import { useCallback, useState, useEffect, useRef } from 'react';
import { isImageFormat } from '@/utils/formats';
import type { Format } from '@/utils/formats';
import type { MediaDimensions } from '@/types/mediaDimensions';
import type { InputMessage, OutputMessage } from '@/types/workers';
import type { CompressionInput } from '@/types/compressor';
import type { TaskErrorKind } from '@/types/analytics';

export default function useCompressor(type: CompressionInput) {
  const workerRef = useRef<Worker>(null);
  const [processorStatus, setProcessorStatus] = useState<
    'loading' | 'ready' | 'working'
  >('loading');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const createWorker = useCallback(() => {
    if (window.Worker) {
      workerRef.current =
        type === 'image'
          ? new Worker(
              new URL('../workers/image-compressor.ts', import.meta.url),
            )
          : new Worker(
              new URL('../workers/video-compressor.ts', import.meta.url),
            );

      workerRef.current.onmessage = (ev: MessageEvent<OutputMessage>) => {
        if (ev.data.type === 'status' && ev.data.content === 'ready') {
          setProcessorStatus('ready');
        }
      };
    }
  }, [type]);

  useEffect(() => {
    createWorker();
    return () => {
      setProcessorStatus('loading');
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [createWorker]);
  return {
    status: processorStatus,
    currentJobId,
    abort: () => {
      setProcessorStatus('loading');
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      createWorker();
    },
    compress: function (
      jobId: string,
      file: File,
      formats: Record<string, Format[]>,
      mediaSizes: Record<string, MediaDimensions>,
      keepAudio: boolean,
      fileNames: Record<string, Partial<Record<Format, string>>>,
      onProgress: (
        jobId: string,
        format: Format,
        configName: string,
        progress?: number,
      ) => void,
      onResult: (
        jobId: string,
        format: Format,
        configName: string,
        output: File,
      ) => void,
      onError: (
        jobId: string,
        format: Format,
        configName: string,
        message: string,
        kind: TaskErrorKind,
      ) => void,
    ): void {
      if (!workerRef.current) {
        throw new Error(
          'Worker not loaded. Ensure the worker is imported correctly.',
        );
      }
      const worker = workerRef.current;
      for (const configFormats of Object.values(formats)) {
        for (const format of configFormats) {
          if (type === 'image' && !isImageFormat(format)) {
            throw new Error('Images can only be converted to Image formats');
          }
        }
      }
      if (processorStatus !== 'ready') {
        throw new Error(
          'Processor is not ready. Please wait for the current task to finish.',
        );
      }
      setCurrentJobId(jobId);
      worker.onmessage = (ev: MessageEvent<OutputMessage>) => {
        if (ev.data.type === 'status' && ev.data.content === 'ready') {
          setProcessorStatus('ready');
        } else if (ev.data.type === 'result') {
          const { jobId, configName, format, content: output } = ev.data;
          onResult(jobId, format, configName, output);
        } else if (ev.data.type === 'progress') {
          const { jobId, configName, format, content: progress } = ev.data;
          onProgress(jobId, format, configName, progress);
        } else if (ev.data.type === 'error') {
          const { jobId, configName, format, content: message, kind } = ev.data;
          onError(jobId, format, configName, message, kind);
        } else {
          throw new Error('Unknown message type from worker:' + ev.data);
        }
      };
      worker.onerror = (ev) => {
        setProcessorStatus('ready');
        throw new Error('Worker error: ' + ev.message);
      };
      setProcessorStatus('working');
      const message: InputMessage = {
        jobId,
        file,
        formats,
        mediaSizes,
        keepAudio,
        fileNames,
      };
      worker.postMessage(message);
    },
  };
}

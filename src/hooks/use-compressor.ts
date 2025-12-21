import { useState, useEffect, useRef } from 'react';
import { Format, isImageFormat } from '@/utils/formats';
import { MediaDimensions } from '@/types/mediaDimensions';
import { Device } from '@/types/devices';
import { InputMessage, OutputMessage } from '@/types/workers';
import { CompressionInput } from '@/types/compressor';

export default function useCompressor(type: CompressionInput) {
  const workerRef = useRef<Worker>(null);
  const [processorStatus, setProcessorStatus] = useState<
    'loading' | 'ready' | 'working'
  >('loading');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  function createWorker() {
    if (window.Worker) {
      setProcessorStatus('loading');
      const imgW = new Worker(
        new URL('../workers/image-compressor.ts', import.meta.url),
      );
      const vidW = new Worker(
        new URL('../workers/video-compressor.ts', import.meta.url),
      );
      workerRef.current = type === 'image' ? imgW : vidW;

      workerRef.current.onmessage = (ev: MessageEvent<OutputMessage>) => {
        if (ev.data.type === 'status' && ev.data.content === 'ready') {
          setProcessorStatus('ready');
        }
      };
    }
  }

  useEffect(() => {
    createWorker();
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [type]); // Empty dependency array ensures this runs once on mount and cleanup on unmount
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
      formats: Format[],
      mediaSizes: Partial<Record<Device, MediaDimensions>>,
      onProgress: (
        jobId: string,
        format: Format,
        device: Device,
        progress?: number,
      ) => void,
      onResult: (
        jobId: string,
        format: Format,
        device: Device,
        output: File,
      ) => void,
      onError: (
        jobId: string,
        format: Format,
        device: Device,
        message: string,
      ) => void,
    ): void {
      if (!workerRef.current) {
        throw new Error(
          'Worker not loaded. Ensure the worker is imported correctly.',
        );
      }
      const worker = workerRef.current;
      for (const format of formats) {
        if (type === 'image' && !isImageFormat(format)) {
          throw new Error('Images can only be converted to Image formats');
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
          const { jobId, device, format, content: output } = ev.data;
          onResult(jobId, format, device, output);
        } else if (ev.data.type === 'progress') {
          const { jobId, device, format, content: progress } = ev.data;
          onProgress(jobId, format, device, progress);
        } else if (ev.data.type === 'error') {
          const { jobId, device, format, content: message } = ev.data;
          onError(jobId, format, device, message);
        } else {
          throw new Error('Unknown message type from worker:' + ev.data);
        }
      };
      worker.onerror = (ev) => {
        setProcessorStatus('ready');
        throw new Error('Worker error: ' + ev.message);
      };
      setProcessorStatus('working');
      const message: InputMessage = { jobId, file, formats, mediaSizes };
      worker.postMessage(message);
    },
  };
}

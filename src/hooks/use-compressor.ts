import { useState, useEffect, useRef } from 'react';
import { Format, isVideoFormat, isImageFormat } from '@/utils/formats';
import { MediaDimensions } from '@/types/mediaDimensions';
import { Device } from '@/types/devices';
import { Message } from '@/types/workers';
import { CompressionInput } from '@/types/compressor';

export default function useCompressor(type: CompressionInput) {
  const workerRef = useRef<Worker>(null);
  const [processorStatus, setProcessorStatus] = useState<
    'loading' | 'ready' | 'working'
  >('loading');
  useEffect(() => {
    if (window.Worker) {
      const imgW = new Worker(
        new URL('../workers/image-compressor.ts', import.meta.url),
      );
      const vidW = new Worker(
        new URL('../workers/video-compressor.ts', import.meta.url),
      );
      workerRef.current = type === 'image' ? imgW : vidW;

      workerRef.current.onmessage = (ev: MessageEvent<Message>) => {
        if (ev.data.type === 'status' && ev.data.content === 'ready') {
          setProcessorStatus('ready');
        }
      };
    }
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [type]); // Empty dependency array ensures this runs once on mount and cleanup on unmount
  return processorStatus !== 'ready'
    ? null
    : function (
        file: File,
        formats: Format[],
        mediaSizes: Partial<Record<Device, MediaDimensions>>,
        onProgress: (format: Format, device: Device, progress?: number) => void,
        onResult: (format: Format, device: Device, output: File) => void,
      ): void {
        if (!workerRef.current) {
          throw new Error(
            'Worker not loaded. Ensure the worker is imported correctly.',
          );
        }
        const worker = workerRef.current;
        for (const format of formats) {
          if (type === 'video' && !isVideoFormat(format)) {
            throw new Error('Videos can only be converted to video formats');
          }
          if (type === 'image' && !isImageFormat(format)) {
            throw new Error('Images can only be converted to Image formats');
          }
        }
        if (processorStatus !== 'ready') {
          throw new Error(
            'Processor is not ready. Please wait for the current task to finish.',
          );
        }
        worker.onmessage = (ev: MessageEvent<Message>) => {
          if (ev.data.type === 'status' && ev.data.content === 'ready') {
            setProcessorStatus('ready');
          } else if (ev.data.type === 'result') {
            const { device, format, content: output } = ev.data;
            onResult(format, device, output);
          } else if (ev.data.type === 'progress') {
            const { device, format, content: progress } = ev.data;
            onProgress(format, device, progress);
          } else {
            throw new Error('Unknown message type from worker:' + ev.data);
          }
        };
        worker.onerror = (ev) => {
          setProcessorStatus('ready');
          throw new Error('Worker error: ' + ev.message);
        };
        setProcessorStatus('working');
        worker.postMessage({ file, formats, mediaSizes });
      };
}

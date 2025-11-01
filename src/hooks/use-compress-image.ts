import { useState, useEffect, useRef } from 'react';
import { isImageFormat, type Format } from '@/utils/formats';
import { MediaDimensions } from '@/types/mediaDimensions';

export default function useCompressImage() {
  const workerRef = useRef<Worker>(null);
  const [processorBusy, setProcessorBusy] = useState(false);
  useEffect(() => {
    if (window.Worker) {
      workerRef.current = new Worker(
        new URL('../app/workers/image-compressor.ts', import.meta.url),
      );
      setProcessorBusy(false);
    }
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleanup on unmount
  return workerRef.current === null
    ? null
    : function (
        file: File,
        format: Format,
        mediaSize: MediaDimensions,
        onProgressUpdate: (progress: number) => void,
      ): Promise<File> {
        if (!workerRef.current) {
          throw new Error(
            'Worker not loaded. Ensure the worker is imported correctly.',
          );
        }
        const worker = workerRef.current;
        if (!isImageFormat(format)) {
          throw new Error('Images can only be converted to Image formats');
        }
        if (processorBusy) {
          throw new Error(
            'Processor is busy. Please wait for the current task to finish.',
          );
        }
        setProcessorBusy(true);
        return new Promise<File>((resolve, reject) => {
          worker.onmessage = (
            ev: MessageEvent<{ type: string; data: number | File }>,
          ) => {
            const { type, data } = ev.data;
            if (type === 'result') {
              const output = data as File;
              setProcessorBusy(false);
              resolve(output);
              return;
            }
            console.error('Unknown message type from worker:', type);
          };
          worker.onerror = (ev) => {
            console.error(ev);
            setProcessorBusy(false);
            reject(new Error('An error occurred during video processing.'));
          };
          worker.postMessage({ file, format, mediaSize });
        });
      };
}

import { Format, isVideoFormat } from '@/utils/formats';
import { MediaDimensions } from '@/types/mediaDimensions';
import { useEffect, useRef, useState } from 'react';

export default function useCompressVideo() {
  const workerRef = useRef<Worker>(null);
  const [processorBusy, setProcessorBusy] = useState(false);
  useEffect(() => {
    if (window.Worker) {
      workerRef.current = new Worker(
        new URL('../app/workers/video-compressor.ts', import.meta.url),
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
        if (!isVideoFormat(format)) {
          throw new Error('Videos can only be converted to video formats');
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
            if (type === 'progress') {
              const progress = data as number;
              onProgressUpdate(progress);
              return;
            }
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

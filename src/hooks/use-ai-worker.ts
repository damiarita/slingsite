import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AiDevice, AiMaskResult } from '@/types/ai';
import type { TaskErrorKind } from '@/types/analytics';
import type { AiInputMessage, AiOutputMessage } from '@/types/workers';
import type { AiModelId } from '@/utils/ai-models';
import { trackEvent } from '@/utils/analytics';

export type AiLoadState =
  | { status: 'idle' }
  | { status: 'loading'; modelId: AiModelId; percentage?: number }
  | { status: 'ready'; modelId: AiModelId; device: AiDevice }
  | { status: 'errored'; modelId: AiModelId; kind: TaskErrorKind };

type RunCallbacks = {
  onProgress: (percentage: number) => void;
  // The download is over: from here on there is no percentage to show.
  onModelReady: () => void;
  onMask: (result: AiMaskResult) => void;
  onAlt: (text: string) => void;
  onError: (message: string, kind: TaskErrorKind) => void;
};

type Request = RunCallbacks & { id: string };

// The AI worker. Created on the first use, so visitors who don't ask for a
// model load neither the runtime nor anything from Hugging Face. It outlives
// jobs: encoder aborts don't touch it, and a removed job's result is ignored.
export default function useAiWorker() {
  const workerRef = useRef<Worker | null>(null);
  const requestRef = useRef<Request | null>(null);
  // Transformers.js loads asynchronously, and a message posted before the
  // worker sets `onmessage` is lost, so they wait for its `ready`.
  const pendingRef = useRef<AiInputMessage[] | null>([]);
  const [loadState, setLoadState] = useState<AiLoadState>({ status: 'idle' });

  const getWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;
    const worker = new Worker(new URL('../workers/ai.ts', import.meta.url));
    worker.onmessage = (ev: MessageEvent<AiOutputMessage>) => {
      const message = ev.data;
      const request = requestRef.current;
      switch (message.type) {
        case 'ready':
          pendingRef.current?.forEach((pending) => worker.postMessage(pending));
          pendingRef.current = null;
          break;
        case 'download':
          setLoadState({
            status: 'loading',
            modelId: message.modelId,
            percentage: message.percentage,
          });
          request?.onProgress(message.percentage);
          break;
        case 'loaded':
          request?.onModelReady();
          setLoadState({
            status: 'ready',
            modelId: message.modelId,
            device: message.device,
          });
          trackEvent({
            event: 'ai_model_loaded',
            model_id: message.modelId,
            ai_device: message.device,
            status: 'completed',
            error_kind: undefined,
            elapsed_ms: message.elapsedMs,
          });
          break;
        case 'load-error':
          setLoadState(
            message.cancelled
              ? { status: 'idle' }
              : {
                  status: 'errored',
                  modelId: message.modelId,
                  kind: message.kind,
                },
          );
          if (!message.cancelled) {
            console.error('Model failed to load:', message.message);
            trackEvent({
              event: 'ai_model_loaded',
              model_id: message.modelId,
              ai_device: undefined,
              status: 'errored',
              error_kind: message.kind,
              elapsed_ms: undefined,
            });
          }
          break;
        case 'mask':
          if (request?.id === message.requestId) {
            requestRef.current = null;
            request.onMask({ mask: message.mask, empty: message.empty });
          }
          break;
        case 'alt':
          if (request?.id === message.requestId) {
            requestRef.current = null;
            request.onAlt(message.text);
          }
          break;
        case 'run-error':
          if (request?.id === message.requestId) {
            requestRef.current = null;
            request.onError(message.message, message.kind);
          }
          break;
      }
    };
    worker.onerror = (ev) => {
      // The tab ran out of memory or the worker failed to start.
      console.error('AI worker error:', ev.message);
      worker.terminate();
      workerRef.current = null;
      pendingRef.current = [];
      const request = requestRef.current;
      requestRef.current = null;
      request?.onError(ev.message, 'inference_failed');
    };
    workerRef.current = worker;
    return worker;
  }, []);

  useEffect(
    () => () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      pendingRef.current = [];
    },
    [],
  );

  const post = useCallback(
    (message: AiInputMessage) => {
      const worker = getWorker();
      if (pendingRef.current) pendingRef.current.push(message);
      else worker.postMessage(message);
    },
    [getWorker],
  );

  // Starts the download as soon as the visitor asks for a model.
  const preload = useCallback(
    (modelId: AiModelId) => {
      // Ticking again with the model in memory: the worker does nothing.
      setLoadState((state) =>
        state.status === 'ready' && state.modelId === modelId
          ? state
          : { status: 'loading', modelId },
      );
      post({ type: 'load', modelId });
    },
    [post],
  );

  const cancelDownload = useCallback(() => {
    setLoadState((state) =>
      state.status === 'loading' ? { status: 'idle' } : state,
    );
    if (workerRef.current) post({ type: 'cancel' });
  }, [post]);

  const isBusy = useCallback(() => requestRef.current !== null, []);

  const run = useCallback(
    (
      requestId: string,
      modelId: AiModelId,
      file: File,
      callbacks: RunCallbacks,
    ) => {
      requestRef.current = { ...callbacks, id: requestId };
      post({ type: 'run', requestId, modelId, file });
    },
    [post],
  );

  // A removed job's request: its result, when it comes, is dropped.
  const forget = useCallback((requestId: string) => {
    if (requestRef.current?.id === requestId) requestRef.current = null;
  }, []);

  return useMemo(
    () => ({ loadState, preload, cancelDownload, isBusy, run, forget }),
    [loadState, preload, cancelDownload, isBusy, run, forget],
  );
}

export type AiWorker = ReturnType<typeof useAiWorker>;

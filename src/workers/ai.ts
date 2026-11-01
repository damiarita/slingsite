import {
  AutoModel,
  AutoProcessor,
  env,
  Florence2ForConditionalGeneration,
  RawImage,
  type PreTrainedModel,
  type Processor,
  type ProgressInfo,
  type Tensor,
} from '@huggingface/transformers';
import type { AiDevice } from '@/types/ai';
import type { TaskErrorKind } from '@/types/analytics';
import type { AiInputMessage, AiOutputMessage } from '@/types/workers';
import {
  type AiModel,
  type AiModelId,
  aiModels,
  detectAiDevice,
  getRemotePathTemplate,
} from '@/utils/ai-models';

// Separate from the encoder workers: those are terminated on every abort, and
// loading a model again takes many seconds.

// GitHub Pages can't send COOP/COEP, so no SharedArrayBuffer.
env.backends.onnx!.wasm!.numThreads = 1;
// Self-hosted (next.config.ts): the default is a CDN.
env.backends.onnx!.wasm!.wasmPaths = `${self.location.origin}/_next/static/ort/`;
env.allowLocalModels = false;

const send = (message: AiOutputMessage) => self.postMessage(message);

let downloads = new AbortController();
const browserFetch = self.fetch.bind(self);
env.fetch = (input: string | URL, init?: RequestInit) =>
  browserFetch(input, { ...init, signal: downloads.signal });

type Loaded = {
  modelId: AiModelId;
  device: AiDevice;
  model: PreTrainedModel;
  processor: Processor;
};
let loaded: Loaded | null = null;

const getDevices = async (): Promise<AiDevice[]> =>
  (await detectAiDevice()) === 'webgpu' ? ['webgpu', 'wasm'] : ['wasm'];

async function loadOn(info: AiModel, device: AiDevice): Promise<Loaded> {
  env.remotePathTemplate = getRemotePathTemplate(info);
  const sizes = new Map<string, { loaded: number; total: number }>();
  const options = {
    device,
    dtype: info.dtype,
    // Per file, because the files arrive in parallel.
    progress_callback: (progress: ProgressInfo) => {
      if (progress.status !== 'progress') return;
      sizes.set(progress.file, progress);
      const done = [...sizes.values()].reduce((sum, s) => sum + s.loaded, 0);
      send({
        type: 'download',
        modelId: info.id,
        percentage: Math.min(
          99,
          Math.floor((done / (info.downloadMB * 1e6)) * 100),
        ),
      });
    },
  };
  const model = await (
    info.task === 'alt' ? Florence2ForConditionalGeneration : AutoModel
  ).from_pretrained(info.repo, options);
  const processor = await AutoProcessor.from_pretrained(info.repo, {});
  return { modelId: info.id, device, model, processor };
}

const isCancel = (error: unknown) => (error as Error)?.name === 'AbortError';

const isDownloadError = (error: unknown) =>
  error instanceof TypeError || /fetch/i.test(String(error));

// Only one model stays in memory: mobile browsers kill heavy tabs.
async function dispose() {
  const previous = loaded;
  loaded = null;
  await previous?.model.dispose().catch(() => undefined);
}

async function load(modelId: AiModelId, devices?: AiDevice[]): Promise<Loaded> {
  if (loaded?.modelId === modelId && !devices) return loaded;
  await dispose();
  const start = performance.now();
  const candidates = devices ?? (await getDevices());
  let lastError: unknown;
  for (const device of candidates) {
    try {
      loaded = await loadOn(aiModels[modelId], device);
      send({
        type: 'loaded',
        modelId,
        device,
        elapsedMs: Math.round(performance.now() - start),
      });
      return loaded;
    } catch (error) {
      // An adapter doesn't prove a model runs (limits, shader features).
      if (isCancel(error) || isDownloadError(error)) throw error;
      lastError = error;
      console.warn(`Model failed on ${device}:`, error);
    }
  }
  throw lastError;
}

const alphaOf = (logit: number) => 255 / (1 + Math.exp(-logit));

async function removeBackground({ model, processor }: Loaded, file: File) {
  const image = await RawImage.fromBlob(file);
  const { pixel_values } = await (
    processor as unknown as (
      image: RawImage,
    ) => Promise<{ pixel_values: Tensor }>
  )(image);
  const outputs = await model({ input_image: pixel_values });
  const logits = (outputs.logits ?? Object.values(outputs)[0]) as Tensor;
  const [height, width] = logits.dims.slice(-2);
  const data = Uint8ClampedArray.from(logits.data as Float32Array, alphaOf);
  const opaque = data.reduce((sum, alpha) => sum + (alpha > 127 ? 1 : 0), 0);
  return {
    mask: { data, width, height },
    empty: opaque / data.length < 0.005,
  };
}

const captionTask = '<CAPTION>';

async function caption({ model, processor }: Loaded, file: File) {
  const image = await RawImage.fromBlob(file);
  const florence = processor as unknown as Processor & {
    (image: RawImage, text: string): Promise<Record<string, Tensor>>;
    construct_prompts: (text: string) => string[];
    batch_decode: (
      ids: unknown,
      options: { skip_special_tokens: boolean },
    ) => string[];
    post_process_generation: (
      text: string,
      task: string,
      size: [number, number],
    ) => Record<string, string>;
  };
  const inputs = await florence(
    image,
    florence.construct_prompts(captionTask)[0] ?? captionTask,
  );
  const ids = await model.generate({ ...inputs, max_new_tokens: 100 });
  const [text] = florence.batch_decode(ids, { skip_special_tokens: false });
  return florence
    .post_process_generation(text, captionTask, image.size)
    [captionTask].trim();
}

const getLoadErrorKind = (error: unknown): TaskErrorKind =>
  isDownloadError(error) ? 'model_download_failed' : 'model_load_failed';

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

async function infer(loadedModel: Loaded, requestId: string, file: File) {
  if (aiModels[loadedModel.modelId].task === 'alt') {
    send({
      type: 'alt',
      requestId,
      text: await caption(loadedModel, file),
    });
  } else {
    const { mask, empty } = await removeBackground(loadedModel, file);
    self.postMessage(
      { type: 'mask', requestId, mask, empty } satisfies AiOutputMessage,
      { transfer: [mask.data.buffer] },
    );
  }
}

async function run(requestId: string, modelId: AiModelId, file: File) {
  let current: Loaded;
  try {
    current = await load(modelId);
  } catch (error) {
    const kind = getLoadErrorKind(error);
    return send({
      type: 'run-error',
      requestId,
      message: messageOf(error),
      kind,
    });
  }
  try {
    await infer(current, requestId, file);
  } catch (error) {
    // A GPU can load a model and still fail on it (out of memory, lost
    // device), so it gets a second chance on the CPU.
    if (current.device === 'webgpu') {
      console.warn('Inference failed on webgpu:', error);
      try {
        await infer(await load(modelId, ['wasm']), requestId, file);
        return;
      } catch (retryError) {
        error = retryError;
      }
    }
    send({
      type: 'run-error',
      requestId,
      message: messageOf(error),
      kind: 'inference_failed',
    });
  }
}

async function preload(modelId: AiModelId) {
  try {
    await load(modelId);
  } catch (error) {
    send({
      type: 'load-error',
      modelId,
      message: messageOf(error),
      kind: getLoadErrorKind(error),
      cancelled: isCancel(error),
    });
  }
}

// One thing at a time, in order.
let queue = Promise.resolve();
const enqueue = (work: () => Promise<void>) => {
  queue = queue.then(work);
};

self.onmessage = (ev: MessageEvent<AiInputMessage>) => {
  const message = ev.data;
  switch (message.type) {
    case 'cancel':
      downloads.abort();
      downloads = new AbortController();
      break;
    case 'load':
      enqueue(() => preload(message.modelId));
      break;
    case 'run':
      enqueue(() => run(message.requestId, message.modelId, message.file));
      break;
  }
};

send({ type: 'ready' });

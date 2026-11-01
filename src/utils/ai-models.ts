import type { AiDevice } from '@/types/ai';

export type AiTask = 'remove-background' | 'alt';

export type AiModelId = 'birefnet-lite-512' | 'florence-2-base-ft';

type Dtype = 'fp32' | 'q4' | 'q8';

export type AiModel = {
  id: AiModelId;
  task: AiTask;
  name: string;
  repo: string;
  // The commit every file comes from, so a change upstream can't reach
  // visitors. Set through `env.remotePathTemplate`: the `revision` option of
  // Transformers.js 4.3 misses its cache and fails offline.
  commit: string;
  dtype: Dtype | Record<string, Dtype>;
  // Every file the model loads, to tell whether it is downloaded.
  files: string[];
  downloadMB: number;
  license: string;
  languages: string[];
};

export const aiModels: Record<AiModelId, AiModel> = {
  'birefnet-lite-512': {
    id: 'birefnet-lite-512',
    task: 'remove-background',
    name: 'BiRefNet Lite',
    repo: 'studioludens/birefnet-lite-512',
    commit: '962e67969ec6acec9c19fab76acee4f5e22e990c',
    dtype: 'fp32',
    files: ['config.json', 'preprocessor_config.json', 'onnx/model.onnx'],
    downloadMB: 192,
    license: 'MIT',
    languages: [],
  },
  'florence-2-base-ft': {
    id: 'florence-2-base-ft',
    task: 'alt',
    name: 'Florence-2',
    repo: 'onnx-community/Florence-2-base-ft',
    commit: 'e88a44eaf3791a35eae0c5a47b3dbcd36e67eb6f',
    dtype: {
      vision_encoder: 'q4',
      embed_tokens: 'q8',
      encoder_model: 'q4',
      decoder_model_merged: 'q4',
    },
    files: [
      'config.json',
      'generation_config.json',
      'preprocessor_config.json',
      'tokenizer.json',
      'tokenizer_config.json',
      'onnx/vision_encoder_q4.onnx',
      'onnx/embed_tokens_quantized.onnx',
      'onnx/encoder_model_q4.onnx',
      'onnx/decoder_model_merged_q4.onnx',
    ],
    downloadMB: 216,
    license: 'MIT',
    languages: ['en'],
  },
};

export const defaultAiModels: Record<AiTask, AiModelId> = {
  'remove-background': 'birefnet-lite-512',
  alt: 'florence-2-base-ft',
};

export const getRemotePathTemplate = (model: AiModel) =>
  `{model}/resolve/${model.commit}/`;

const cacheName = 'transformers-cache';

// Reads the browser's cache only. ModelRegistry.is_pipeline_cached would tell
// too, but it calls Hugging Face, and nothing may reach it before the visitor
// asks for a model.
export async function isAiModelDownloaded(model: AiModel): Promise<boolean> {
  try {
    if (!(await caches.has(cacheName))) return false;
    const cache = await caches.open(cacheName);
    const matches = await Promise.all(
      model.files.map((file) =>
        cache.match(
          `https://huggingface.co/${model.repo}/resolve/${model.commit}/${file}`,
        ),
      ),
    );
    return matches.every(Boolean);
  } catch {
    return false; // No Cache API (private windows, some settings).
  }
}

type GpuAdapter = {
  isFallbackAdapter?: boolean;
  info?: { isFallbackAdapter?: boolean };
};

// A software adapter would be slower than WASM,
// so it counts as no GPU.
export async function detectAiDevice(): Promise<AiDevice> {
  try {
    const { gpu } = navigator as {
      gpu?: { requestAdapter: () => Promise<GpuAdapter | null> };
    };
    const adapter = await gpu?.requestAdapter();
    const isFallback =
      adapter?.isFallbackAdapter || adapter?.info?.isFallbackAdapter;
    return adapter && !isFallback ? 'webgpu' : 'wasm';
  } catch {
    return 'wasm';
  }
}

import type { TaskErrorKind } from './analytics';

export type AiDevice = 'webgpu' | 'wasm';

// The alpha of an image, at the model's size. compressImage scales it to each
// output.
export type AiMask = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

// A step that runs once per file, before the outputs are encoded.
export type AiStep<Result> =
  | { status: 'waiting' }
  | { status: 'running'; percentage?: number }
  | { status: 'completed'; result: Result }
  | { status: 'errored'; errorMessage: string; errorKind: TaskErrorKind };

export type AiMaskResult = {
  mask: AiMask;
  // The model found no subject: the output would be (almost) transparent.
  empty: boolean;
};

export type AiAltResult = { text: string };

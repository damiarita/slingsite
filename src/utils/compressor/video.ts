import type { MediaDimensions } from '@/types/mediaDimensions';
import type { VideoFormat } from '@/utils/formats';
import { getFileNameWithExtensionAndSuffix } from '@/utils/compressor/all';
import {
  Input,
  Output,
  WebMOutputFormat,
  Mp4OutputFormat,
  BufferTarget,
  Conversion,
  VideoCodec,
  ALL_FORMATS,
  BlobSource,
  CanvasSink,
} from 'mediabunny';

const outputFormats: Record<VideoFormat, WebMOutputFormat | Mp4OutputFormat> = {
  'vp9.webm': new WebMOutputFormat(),
  'hevc.mp4': new Mp4OutputFormat({ fastStart: 'in-memory' }),
  'avc.mp4': new Mp4OutputFormat({ fastStart: 'in-memory' }),
};

const outputCodecs: Record<VideoFormat, VideoCodec> = {
  'vp9.webm': 'vp9',
  'hevc.mp4': 'hevc',
  'avc.mp4': 'avc',
};

export async function compressVideo(
  file: File,
  formatsByConfig: Record<string, VideoFormat[]>,
  mediaSizes: Record<string, MediaDimensions>,
  keepAudio: boolean,
  fileNames: Record<string, Partial<Record<VideoFormat, string>>>,
  onSuccess: (file: File, configName: string, format: VideoFormat) => void,
  onError: (
    configName: string,
    format: VideoFormat,
    errorMessage: string,
  ) => void,
  onProgress: (
    configName: string,
    format: VideoFormat,
    progress: number,
  ) => void,
): Promise<void> {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new BlobSource(file),
  });
  for (const [configName, mediaSize] of Object.entries(mediaSizes)) {
    const formats = formatsByConfig[configName] || [];
    for (const format of formats) {
      const outputFormat = outputFormats[format];
      const outputCodec = outputCodecs[format];

      const output = new Output({
        format: outputFormat,
        target: new BufferTarget(),
      });

      const conversion = await Conversion.init({
        input,
        output,
        video: {
          width: mediaSize.width,
          height: mediaSize.height,
          fit: 'contain',
          codec: outputCodec,
        },
        // When kept, mediabunny copies the audio packets if it can (the
        // container accepts the codec and nothing needs resampling) and
        // transcodes them otherwise.
        audio: { discard: !keepAudio },
        tags: {},
      });
      // A track that can't be encoded is discarded and the conversion stays
      // valid, so a kept audio track could silently disappear.
      const discardedAudio = conversion.discardedTracks.find(
        (t) => t.track.type === 'audio' && t.reason !== 'discarded_by_user',
      );
      if (keepAudio && discardedAudio) {
        onError(
          configName,
          format,
          discardedAudio.reason === 'no_encodable_target_codec'
            ? `This browser cannot encode the audio for ${format} on this device. Try another browser or output format, or turn off "keep audio".`
            : discardedAudio.reason === 'undecodable_source_codec' ||
                discardedAudio.reason === 'unknown_source_codec'
              ? `This browser cannot read the audio of this file. Try another browser, or turn off "keep audio".`
              : 'The audio could not be kept: ' + discardedAudio.reason,
        );
        continue;
      }
      if (!conversion.isValid) {
        // Conversion is invalid and cannot be executed without error.
        // This field gives reasons for why tracks were discarded:
        const errorMessage = conversion.discardedTracks.some(
          (t) => t.reason === 'no_encodable_target_codec',
        )
          ? `This browser cannot encode ${outputCodec.toUpperCase()} on this device. Try another browser or output format.`
          : 'The conversion was not possible: ' +
            conversion.discardedTracks.map((t) => t.reason).join(', ');
        onError(configName, format, errorMessage);
        continue;
      }

      conversion.onProgress = (progress: number) => {
        onProgress(configName, format, progress);
      };

      await conversion.execute();

      if (!output.target.buffer) {
        onError(configName, format, 'No output generated');
        continue;
      }
      const compressedFile = new File(
        [output.target.buffer],
        fileNames[configName]?.[format] ?? file.name,
        {
          type: await output.getMimeType(),
        },
      );
      onSuccess(compressedFile, configName, format);
    }
  }
}

export async function extractFirstFrame(file: File): Promise<File> {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new BlobSource(file),
  });
  const videoTrack = await input.getPrimaryVideoTrack();
  if (!videoTrack) throw new Error('No video track found');
  if (!(await videoTrack.canDecode())) {
    throw new Error('This browser cannot decode this video');
  }
  const sink = new CanvasSink(videoTrack);
  const result = await sink.getCanvas(await videoTrack.getFirstTimestamp());
  if (!result) throw new Error('Could not extract frame');
  const canvas = result.canvas as OffscreenCanvas;
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  return new File(
    [blob],
    getFileNameWithExtensionAndSuffix(file.name, 'png', '-thumbnail'),
    { type: 'image/png' },
  );
}

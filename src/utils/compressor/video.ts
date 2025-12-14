import { Device } from '@/types/devices';
import { MediaDimensions } from '@/types/mediaDimensions';
import { VideoFormat } from '@/utils/formats';
import {
  getCompressedFileName,
  getFileNameWithExtensionAndSuffix,
} from '@/utils/compressor/all';
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
  'av1.webm': new WebMOutputFormat(),
  mp4: new Mp4OutputFormat({ fastStart: 'in-memory' }),
};

const outputCodecs: Record<VideoFormat, VideoCodec> = {
  'vp9.webm': 'vp9',
  'av1.webm': 'av1',
  mp4: 'avc',
};

export async function compressVideo(
  file: File,
  formats: VideoFormat[],
  mediaSizes: Partial<Record<Device, MediaDimensions>>,
  onSuccess: (file: File, device: Device, format: VideoFormat) => void,
  onError: (device: Device, format: VideoFormat, errorMessage: string) => void,
  onProgress: (device: Device, format: VideoFormat, progress: number) => void,
): Promise<void> {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new BlobSource(file),
  });
  for (const [device, mediaSize] of Object.entries(mediaSizes) as [
    Device,
    MediaDimensions,
  ][]) {
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
        audio: {
          discard: true,
        },
        tags: {},
      });
      if (!conversion.isValid) {
        // Conversion is invalid and cannot be executed without error.
        // This field gives reasons for why tracks were discarded:
        const errorMessage =
          'Reasons the conversion was no possible:' +
          conversion.discardedTracks
            .map((t) => t.track.name + ': ' + t.reason)
            .join(', ');
        onError(device, format, errorMessage);
        continue;
      }

      conversion.onProgress = (progress: number) => {
        onProgress(device, format, progress);
      };

      await conversion.execute();

      if (!output.target.buffer) {
        onError(device, format, 'No output generated');
        continue;
      }
      const compressedFile = new File(
        [output.target.buffer],
        getCompressedFileName(file.name, device, format),
        {
          type: await output.getMimeType(),
        },
      );
      onSuccess(compressedFile, device, format);
    }
  }
}

export async function extractFirstFrame(file: File): Promise<File> {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new BlobSource(file),
  });
  return new Promise<File>(async (resolve, reject) => {
    input.getPrimaryVideoTrack().then((videoTrack) => {
      if (!videoTrack) {
        reject('No video track found');
        return;
      }
      videoTrack.canDecode().then((decodable) => {
        if (!decodable) {
          reject('Video track is not decodable');
          return;
        }
        const sink = new CanvasSink(videoTrack);

        videoTrack.getFirstTimestamp().then((firstTimestamp) => {
          // Get the thumbnail at timestamp 0s
          sink.getCanvas(firstTimestamp).then((result) => {
            if (!result) {
              reject('Could not extract frame');
              return;
            }
            const canvas = result.canvas as OffscreenCanvas;
            canvas.convertToBlob({ type: 'image/png' }).then((blob) => {
              resolve(
                new File(
                  [blob],
                  getFileNameWithExtensionAndSuffix(
                    file.name,
                    'png',
                    '-thumbnail',
                  ),
                  { type: 'image/png' },
                ),
              );
            });
          });
        });
      });
    });
  });
}

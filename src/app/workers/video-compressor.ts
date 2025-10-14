import { MediaDimensions } from '@/types/mediaDimensions';
import { VideoFormat } from '@/utils/formats';
import {
	Input,
	Output,
	WebMOutputFormat,
    Mp4OutputFormat,
	BufferTarget,
	Conversion,
    VideoCodec,
    ALL_FORMATS,
    BlobSource
} from 'mediabunny';


self.addEventListener('message', async (ev) => {

    const { file, format, mediaSize } = ev.data as {
        file: File;
        format: VideoFormat
        mediaSize: MediaDimensions;
    };
    
    const outputFormat = format === 'webm' ? new WebMOutputFormat() : new Mp4OutputFormat({fastStart: 'in-memory'});
    const outputCodec: VideoCodec = format === 'webm' ? 'vp9' : 'avc';

    const input = new Input({
	formats: ALL_FORMATS,
	source: new BlobSource(file),
});
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
        tags: {}
    });
    if (!conversion.isValid) {
        // Conversion is invalid and cannot be executed without error.
        // This field gives reasons for why tracks were discarded:
        throw new Error ("Reasons the conversion was no possible:"+ conversion.discardedTracks.map(t=>t.track.name+": "+t.reason).join(", "));
    }

    conversion.onProgress = (progress: number) => {
        self.postMessage({ type: 'progress', data: progress });
    };

    await conversion.execute();

    if(!output.target.buffer){
        throw new Error("No output generated");
    }
    
    self.postMessage({ type: 'result', data: new File([output.target.buffer], file.name, {type:await output.getMimeType()}) });
    
});
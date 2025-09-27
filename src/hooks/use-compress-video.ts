import { Format, ImageFormat, isVideoFormat, VideoFormat } from "@/utils/formats";
import { MediaDimensions } from "@/types/mediaDimensions";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { useEffect, useRef, useState } from "react";


export default function useCompressVideo() {
  const [loaded, setLoaded] = useState(false);
  const ffmpegRef = useRef<FFmpeg>(null);
  useEffect(() => {
        const ffmpeg = ffmpegRef.current=new FFmpeg();
        ffmpeg.on('log', ({ message }) => {
            console.log(message);
        });
        ffmpeg.on('progress', (progress) => {
            console.log(`Progress: ${(progress.progress * 100).toFixed(2)}%`);
        });
        ffmpeg.load({
            coreURL: '/_next/static/ffmpeg/ffmpeg-core.js',
            wasmURL: '/_next/static/ffmpeg/ffmpeg-core.wasm',
        }).then(()=>setLoaded(true));
    },[]);
  return !loaded?null:function (file: File, format:Format, mediaSize:MediaDimensions): Promise<File> {
    if(!ffmpegRef.current){
      throw new Error("ffmpegRef not yet defined")
    }
    if(isVideoFormat(format)){
      const videoFormat = format as VideoFormat;
      const ffmpeg = ffmpegRef.current;
      const outputFileName = getOutputName(file, videoFormat)
      const outputMimeType = 'video/'+videoFormat
      return file.arrayBuffer()
      .then(
        buffer=>new Uint8Array(buffer)
      )
      .then(fileData=>ffmpeg.writeFile(file.name, fileData))
      .then(_=>ffmpeg.exec(videoFormat === 'mp4' ? [
        '-i', file.name,
        '-vf', `scale=${mediaSize.width}:-2:flags=lanczos`,
        '-c:v', 'libx264',
        '-preset', 'slow',
        '-crf', '28',
        '-profile:v', 'high',
        '-level', '4.1',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        '-an', // Remove audio
        '-sn', // Remove subtitles
        '-map_metadata', '-1',
        '-f', 'mp4',
        outputFileName
      ] : [
        '-i', file.name,
        '-vf', `scale=${mediaSize.width}:-2:flags=lanczos`,
        '-c:v', 'libvpx-vp9',
        '-crf', '35', // Increased from 32 for less memory usage
        '-b:v', '0', // Let CRF control quality
        '-pix_fmt', 'yuv420p',
        '-cpu-used', '2', // Faster encoding, less memory intensive (was 1)
        '-tile-columns', '1', // Reduce memory usage
        '-tile-rows', '0', // Reduce memory usage
        '-frame-parallel', '0', // Disable frame parallelism to save memory
        '-row-mt', '0', // Disable row multithreading to save memory (was 1)
        '-threads', '1', // Limit to 1 thread to reduce memory
        '-an', // Remove audio (fix: removed conflicting audio settings)
        '-sn', // Remove subtitles
        '-map_metadata', '-1',
        '-f', 'webm',
        outputFileName
      ]))
      .then(_=>ffmpeg.readFile(outputFileName))
      .then(data=>{
        if (data instanceof Uint8Array) {
          return new File([new Uint8Array(data)], outputFileName, { type: outputMimeType });
        } else if (typeof data === 'string') {
          const blob = new Blob([data], { type: outputMimeType });
          return new File([blob], outputFileName, { type: outputMimeType });
        } else {
          throw new Error('data must be a Uint8Array or a string.');
        }
      })
    }
    throw new Error("Image not implemented yet")
  }
}

function getOutputName(file:File, format:VideoFormat){
    const fileNamePieces = file.name.split(".");
    fileNamePieces[fileNamePieces.length-2]+="output";
    fileNamePieces[fileNamePieces.length-1]=format;
    return fileNamePieces.join(".");
}
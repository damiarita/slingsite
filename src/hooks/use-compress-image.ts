import { useState, useEffect } from "react";
import { isImageFormat, type Format, type ImageFormat } from "@/utils/formats";
import { MediaDimensions } from "@/types/mediaDimensions";
type CompressorClass = typeof import("@yireen/squoosh-browser").default;
type Settings = ConstructorParameters<CompressorClass>[1];

export default function useCompressImage() {
  const [compressorClass, setCompressorClass] = useState<CompressorClass | null>(null);
  useEffect(() => {
    async function loadWasm() {
      try {
        const wasmModule = await import("@yireen/squoosh-browser");
        setCompressorClass(() => wasmModule.default);
      } catch (err) {
        console.error("Failed to load '@yireen/squoosh-browser':", err);
      }
    }
    loadWasm();
  }, []);
  return compressorClass===null? null : function (file: File, format:Format, mediaSize:MediaDimensions, onProgressUpdate:(progress:number)=>void): Promise<File> {
    if (!compressorClass){
      throw new Error("Compressor class not loaded. Ensure '@yireen/squoosh-browser' is imported correctly.");
    } 
    if(!isImageFormat(format)){
      throw new Error("Images can only be converted to image formats")
    }
    const imageFormat = format as ImageFormat;
    const compressor = new compressorClass(file, getSettings(imageFormat, mediaSize.width, mediaSize.height));
    return compressor.process();
  };
}

function getSettings(format: ImageFormat, width:number, height:number): Settings {

  if (format === "webp") {
    return {
      preprocessorState: {
        rotate: { rotate: 0 }
      },
      processorState: {
        quantize: {
          enabled: false,
          zx: 0,
          maxNumColors: 256,
          dither: 1.0
        },
        resize: {
          enabled: true,
          width,
          height,
          method: 'lanczos3',
          fitMethod: 'stretch',
          premultiply: true,
          linearRGB: true
        }
      },
      encoderState: {
        type: "webP",
        options: {
          quality: 75,
          target_size: 0,
          target_PSNR: 0,
          method: 4,
          sns_strength: 50,
          filter_strength: 60,
          filter_sharpness: 0,
          filter_type: 1,
          partitions: 0,
          segments: 4,
          pass: 1,
          show_compressed: 0,
          preprocessing: 0,
          autofilter: 0,
          partition_limit: 0,
          alpha_compression: 1,
          alpha_filtering: 1,
          alpha_quality: 100,
          lossless: 0,
          exact: 0,
          image_hint: 0,
          emulate_jpeg_size: 0,
          thread_level: 0,
          low_memory: 0,
          near_lossless: 100,
          use_delta_palette: 0,
          use_sharp_yuv: 0
        }
      }
    };
  } else if (format === "jpg") {
    return {
      preprocessorState: {
        rotate: { rotate: 0 }
      },
      processorState: {
        quantize: {
          enabled: false,
          zx: 0,
          maxNumColors: 256,
          dither: 1.0
        },
        resize: {
          enabled: true,
          width: width,
          height: height,
          method: 'lanczos3',
          fitMethod: 'stretch',
          premultiply: true,
          linearRGB: true
        }
      },
      encoderState: {
        type: "mozJPEG",
        options: {
          quality: 75,
          chroma_subsample: 0,
          trellis_multipass: false,
          trellis_opt_zero: false,
          trellis_opt_table: false,
          trellis_loops: 1,
          quant_table: 3,
          separate_chroma_quality: false,
          baseline: false,
          arithmetic: false,
          progressive: true,
          optimize_coding: true,
          smoothing: 0,
          color_space: 3,
          auto_subsample: true,
          chroma_quality: 75,
        }
      }
    };
  } else if (format === "avif") {
    // avif
    return {
      preprocessorState: {
        rotate: { rotate: 0 }
      },
      processorState: {
        quantize: {
          enabled: false,
          zx: 0,
          maxNumColors: 256,
          dither: 1.0
        },
        resize: {
          enabled: true,
          width: width,
          height: height,
          method: 'lanczos3',
          fitMethod: 'stretch',
          premultiply: true,
          linearRGB: true
        }
      },
      encoderState: {
        type: "avif",
        options: {
          cqLevel: 33,
          cqAlphaLevel: 33,
          denoiseLevel: 0,
          tileRowsLog2: 0,
          tileColsLog2: 0,
          speed: 6,
          subsample: 1,
          chromaDeltaQ: false,
          sharpness: 0,
          tune: 0
        }
      }
    };
  }
  else{
    throw new Error(`Unsupported format: ${format}`);
  }

}


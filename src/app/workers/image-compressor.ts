import { MediaDimensions } from '@/types/mediaDimensions';
import { ImageFormat } from '@/utils/formats';

self.onmessage=async (ev) => {

    const { file, format, mediaSize } = ev.data as {
        file: File;
        format: ImageFormat
        mediaSize: MediaDimensions;
    };

    const outputMimeType=format==='jpg'?'image/jpeg':`image/${format}`
    const imageBitmap = await createImageBitmap(file);
      
    // Create canvas for resizing
    const canvas = new OffscreenCanvas(mediaSize.width, mediaSize.height);
    const ctx = canvas.getContext('2d', {
    alpha: true,
    desynchronized: true // Hint for hardware acceleration
    });
    if (!ctx) throw new Error('Failed to get canvas context');
      
    // Use high-quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
      
    // Draw resized image
    ctx.drawImage(imageBitmap, 0, 0, mediaSize.width, mediaSize.height);
      
    const blob = await canvas.convertToBlob({
    type: outputMimeType,
    quality: 0.8
    });

    self.postMessage({ type: 'result', data: new File([blob], file.name, {type:outputMimeType}) });
};
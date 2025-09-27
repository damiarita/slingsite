const imageFormats = ["jpg","webp","avif"] as const;
export type ImageFormat = typeof imageFormats[number];

const videoFormats = ["mp4","webm"] as const;
export type VideoFormat = typeof videoFormats[number];

export type Format = ImageFormat | VideoFormat;

export function isImageFormat(format:Format){
    return imageFormats.includes(format as ImageFormat);
}

export function isVideoFormat(format:Format){
    return videoFormats.includes(format as VideoFormat);
}


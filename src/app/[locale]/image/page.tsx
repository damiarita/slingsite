import ImagePage from '@/components/image-page';
import { Metadata } from 'next'

export function generateMetadata(): Metadata {
  return {
    title: "Online Image Compressor and Resizer - SlingSite",
    description: "Compress and resize your images online for free with SlingSite's Image Compressor. Optimize images for web use, reduce file size without losing quality, and choose dimensions for mobile, tablet, and desktop devices.",
  }
}

export default function App() {
  return <ImagePage />
}
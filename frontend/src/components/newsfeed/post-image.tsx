import { ZoomableImage } from "@/components/common/zoomable-image";

interface PostImageProps {
  src: string;
}

export function PostImage({ src }: PostImageProps) {
  return <ZoomableImage src={src} alt="Ảnh đính kèm" className="mt-3 max-h-[32rem] w-full rounded-2xl object-cover" />;
}

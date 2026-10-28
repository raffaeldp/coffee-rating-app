/* eslint-disable @next/next/no-img-element -- photos come from the uploads volume, not the build */
import { ZoomPhoto } from "./zoom-photo";

// Coffee thumbnail. Click to view full screen, except where the thumbnail is itself a choice (zoom={false}).
export function Photo({ src, zoom = true, large }: { src: string | null; zoom?: boolean; large?: boolean }) {
  const className = large ? "thumb large" : "thumb";
  if (!src) return <span className={className} />;
  return zoom ? <ZoomPhoto src={`/photos/${src}`} className={className} /> : <img className={className} src={`/photos/${src}`} alt="" />;
}

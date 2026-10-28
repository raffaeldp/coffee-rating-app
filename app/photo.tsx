/* eslint-disable @next/next/no-img-element -- photos come from the uploads volume, not the build */
import { ZoomPhoto } from "./zoom-photo";

// Coffee thumbnail. Click to view full screen, except where the thumbnail is itself a choice (zoom={false}).
export function Photo({ src, zoom = true }: { src: string | null; zoom?: boolean }) {
  if (!src) return <span className="thumb" />;
  return zoom ? <ZoomPhoto src={`/photos/${src}`} /> : <img className="thumb" src={`/photos/${src}`} alt="" />;
}

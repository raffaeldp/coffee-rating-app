/* eslint-disable @next/next/no-img-element -- photos come from the uploads volume, not the build */
export function Photo({ src, big }: { src: string | null; big?: boolean }) {
  return src ? <img className={big ? "big" : "thumb"} src={`/photos/${src}`} alt="" /> : <span className="thumb" />;
}

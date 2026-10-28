"use client";
/* eslint-disable @next/next/no-img-element -- photos come from the uploads volume, not the build */

import { useRef } from "react";
import { useTranslations } from "next-intl";

const Magnifier = ({ size }: { size: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4M11 8v6M8 11h6" />
  </svg>
);

// Thumbnail that opens the full photo in a native modal <dialog> (Esc, backdrop click or × closes it).
export function ZoomPhoto({ src }: { src: string }) {
  const t = useTranslations("common");
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className="zoom" onClick={() => dialog.current?.showModal()} aria-label={t("zoom")}>
        <img className="thumb" src={src} alt="" />
        <span className="zoom-icon">
          <Magnifier size={22} />
        </span>
      </button>
      <dialog ref={dialog} className="lightbox" onClick={() => dialog.current?.close()}>
        <button type="button" className="lightbox-close" aria-label={t("close")} autoFocus>
          ×
        </button>
        <img src={src} alt="" />
      </dialog>
    </>
  );
}

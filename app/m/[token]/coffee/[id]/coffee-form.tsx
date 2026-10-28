"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

// Phone photos are 4–12 MB; shrink to 1200px JPEG before upload (server caps at 2 MB).
async function resize(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  return new File([blob!], "photo.jpg", { type: "image/jpeg" });
}

type Coffee = { name: string; description: string; photo: string | null };

export function CoffeeForm({ action, coffee }: { action: (formData: FormData) => void; coffee: Coffee | null }) {
  const t = useTranslations("refill");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(coffee?.photo ? `/photos/${coffee.photo}` : null);

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const small = await resize(file);
      const dt = new DataTransfer();
      dt.items.add(small);
      input.files = dt.files;
      setPreview(URL.createObjectURL(small));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form action={action}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {preview && <img className="big" src={preview} alt="" />}
      <label className="field" htmlFor="photo">{t("photo")}</label>
      <input id="photo" name="photo" type="file" accept="image/*" capture="environment" onChange={onPhoto} />
      <label className="field" htmlFor="name">{t("name")}</label>
      <input id="name" name="name" type="text" required maxLength={100} defaultValue={coffee?.name} />
      <label className="field" htmlFor="description">{t("description")}</label>
      <textarea id="description" name="description" rows={3} maxLength={1000} defaultValue={coffee?.description} />
      <p>
        <button className="btn" disabled={busy}>{busy ? t("resizing") : coffee ? t("save") : t("saveAndLoad")}</button>
      </p>
    </form>
  );
}

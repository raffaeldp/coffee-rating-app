import { headers } from "next/headers";
import QRCode from "qrcode";
import { getTranslations } from "next-intl/server";
import { machineOr404 } from "@/lib/queries";

export default async function Qr({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const machine = machineOr404(token);
  const h = await headers();
  const url = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}/m/${token}`;
  const svg = await QRCode.toString(url, { type: "svg", margin: 1 });
  const t = await getTranslations("qr");
  return (
    <div className="qr" style={{ textAlign: "center" }}>
      <h1>☕ {t("hint")}</h1>
      <div dangerouslySetInnerHTML={{ __html: svg }} />
      <p>{machine.name}</p>
      <p className="muted small noprint">{url}</p>
    </div>
  );
}

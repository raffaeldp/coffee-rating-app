import createNextIntlPlugin from "next-intl/plugin";

export default createNextIntlPlugin()({
  output: "standalone",
  // photos are resized client-side to ~1200px; server caps them at 2 MB
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
});

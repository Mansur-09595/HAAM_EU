'use client'

export default function GoogleMapEmbed({ address }: { address: string }) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  return (
    <iframe
      title="Google map"
      src={src}
      style={{ border: 0 }}
      width="100%"
      height="100%"
      allowFullScreen
      loading="lazy"
    ></iframe>
  );
}
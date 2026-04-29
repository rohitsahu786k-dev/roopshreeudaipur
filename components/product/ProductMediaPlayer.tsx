"use client";

import ReactPlayer from "react-player/lazy";

function instagramEmbedUrl(url: string) {
  const clean = url.split("?")[0].replace(/\/$/, "");
  return `${clean}/embed`;
}

export function ProductMediaPlayer({ url, active = true }: { url?: string; active?: boolean }) {
  if (!url) return null;

  if (/instagram\.com/i.test(url)) {
    return (
      <iframe
        src={instagramEmbedUrl(url)}
        title="Instagram reel"
        className="h-full w-full"
        loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture"
      />
    );
  }

  return <ReactPlayer url={url} width="100%" height="100%" playing={active} muted loop playsinline controls={false} />;
}

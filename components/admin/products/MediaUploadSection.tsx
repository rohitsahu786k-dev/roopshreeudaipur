"use client";

import { useState, useRef } from "react";
import { Upload, X, Video, Image as ImageIcon, Film, Move, Link as LinkIcon } from "lucide-react";
import Image from "next/image";

type MediaItem = {
  url: string;
  type: "image" | "video" | "reel";
  alt: string;
  position: number;
  thumbnailUrl?: string;
};

type Props = {
  media: MediaItem[];
  onChange: (media: MediaItem[]) => void;
};

export default function MediaUploadSection({ media, onChange }: Props) {
  const [urlInput, setUrlInput] = useState("");
  const [urlType, setUrlType] = useState<"image" | "video" | "reel">("image");
  const [dragOver, setDragOver] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragTarget, setDragTarget] = useState<number | null>(null);

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    const item: MediaItem = {
      url,
      type: urlType,
      alt: "",
      position: media.length
    };
    onChange([...media, item]);
    setUrlInput("");
  };

  const remove = (idx: number) => onChange(media.filter((_, i) => i !== idx));

  const updateAlt = (idx: number, alt: string) => {
    const updated = [...media];
    updated[idx] = { ...updated[idx], alt };
    onChange(updated);
  };

  const handleDragStart = (idx: number) => setDragging(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragTarget(idx);
  };
  const handleDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragging === null || dragging === idx) return;
    const reordered = [...media];
    const [moved] = reordered.splice(dragging, 1);
    reordered.splice(idx, 0, moved);
    onChange(reordered.map((item, i) => ({ ...item, position: i })));
    setDragging(null);
    setDragTarget(null);
  };

  const isYouTube = (url: string) =>
    url.includes("youtube.com") || url.includes("youtu.be");

  const getYouTubeThumbnail = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
  };

  return (
    <div className="space-y-4">
      {/* Media Grid */}
      {media.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Media ({media.length})</h3>
            <span className="text-xs text-gray-500">Drag to reorder</span>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {media.map((item, idx) => {
              const thumb =
                item.type === "video" || item.type === "reel"
                  ? isYouTube(item.url)
                    ? getYouTubeThumbnail(item.url)
                    : item.thumbnailUrl ?? null
                  : item.url;

              return (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`group relative aspect-square cursor-grab rounded-lg border-2 overflow-hidden transition-all ${
                    dragTarget === idx ? "border-primary scale-105" : "border-gray-200"
                  } ${idx === 0 ? "ring-2 ring-primary ring-offset-1" : ""}`}
                >
                  {thumb ? (
                    <Image src={thumb} alt={item.alt || ""} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-100">
                      {item.type === "reel" ? (
                        <Film className="h-8 w-8 text-gray-400" />
                      ) : (
                        <Video className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                  )}

                  {/* Type badge */}
                  <div className="absolute left-1 top-1">
                    {item.type === "reel" && (
                      <span className="rounded bg-pink-500 px-1 py-0.5 text-[9px] font-bold text-white">
                        REEL
                      </span>
                    )}
                    {item.type === "video" && (
                      <span className="rounded bg-blue-500 px-1 py-0.5 text-[9px] font-bold text-white">
                        VIDEO
                      </span>
                    )}
                    {idx === 0 && item.type === "image" && (
                      <span className="rounded bg-primary px-1 py-0.5 text-[9px] font-bold text-white">
                        MAIN
                      </span>
                    )}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => remove(idx)}
                    className="absolute right-1 top-1 hidden rounded-full bg-black/70 p-0.5 text-white group-hover:flex"
                  >
                    <X className="h-3 w-3" />
                  </button>

                  {/* Drag handle */}
                  <div className="absolute bottom-1 left-1 hidden group-hover:block text-white opacity-70">
                    <Move className="h-3 w-3" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alt text for first image */}
          {media[0] && media[0].type === "image" && (
            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Main image alt text
              </label>
              <input
                value={media[0].alt}
                onChange={(e) => updateAlt(0, e.target.value)}
                placeholder="Describe the main image for accessibility"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          )}
        </div>
      )}

      {/* Add Media by URL */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Add Media</h3>

        <div className="space-y-4">
          {/* Type selector */}
          <div className="flex gap-2">
            {(["image", "video", "reel"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setUrlType(type)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                  urlType === type
                    ? "border-primary bg-primary text-white"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {type === "image" && <ImageIcon className="h-3.5 w-3.5" />}
                {type === "video" && <Video className="h-3.5 w-3.5" />}
                {type === "reel" && <Film className="h-3.5 w-3.5" />}
                {type}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addUrl()}
                placeholder={
                  urlType === "image"
                    ? "https://example.com/image.jpg"
                    : urlType === "reel"
                    ? "https://www.instagram.com/reel/... or YouTube Shorts URL"
                    : "https://www.youtube.com/watch?v=... or direct video URL"
                }
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <button
              onClick={addUrl}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Add
            </button>
          </div>

          <p className="text-xs text-gray-500">
            {urlType === "reel"
              ? "Supports Instagram Reels, YouTube Shorts, TikTok, or direct MP4 URLs"
              : urlType === "video"
              ? "Supports YouTube, Vimeo, or direct video file URLs"
              : "Paste any image URL or upload from your media library"}
          </p>
        </div>

        {/* Drop zone hint */}
        <div className="mt-4 rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
          <Upload className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">
            Coming soon: Direct file upload to cloud storage
          </p>
          <p className="text-xs text-gray-400 mt-1">
            For now, upload to Cloudinary/S3 and paste the URL above
          </p>
        </div>
      </div>
    </div>
  );
}

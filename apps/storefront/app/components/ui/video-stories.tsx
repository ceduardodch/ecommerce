"use client"

import { useState } from "react"
import { trackStorefrontEvent } from "../analytics"

type StoryItem = {
  src: string
  poster: string
  label: string
}

export function VideoStories({ items }: { items: StoryItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  function handleSelect(index: number) {
    const item = items[index]
    if (activeIndex !== index) {
      trackStorefrontEvent({
        eventName: "Lead",
        type: "video_interest",
        source: "storefront",
        cta: item.label,
        placement: "video_stories",
        metadata: { videoSrc: item.src, videoLabel: item.label, storyIndex: index },
      })
    }
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <div className="w-full">
      {/* Horizontal strip of story chips */}
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 pb-2 scrollbar-none">
        {items.map((item, index) => (
          <button
            key={item.src}
            type="button"
            onClick={() => handleSelect(index)}
            className="flex-none snap-start flex flex-col items-center gap-1.5 focus:outline-none"
            aria-label={`Ver ${item.label}`}
          >
            {/* Chip: 64×88, rounded-[14px] */}
            <div
              className={`relative w-16 h-22 rounded-[14px] overflow-hidden bg-[#E8E2D8] transition-all ${
                activeIndex === index
                  ? "ring-2 ring-offset-1 ring-[var(--accent)]"
                  : "ring-1 ring-[#E8E2D8]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.poster}
                alt={item.label}
                className="w-full h-full object-cover"
              />
              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="white"
                  aria-hidden="true"
                >
                  <path d="M5 3.5l8 4.5-8 4.5V3.5z" />
                </svg>
              </div>
            </div>
            <span className="text-[11px] text-[#6B6B66] text-center leading-tight max-w-[64px]">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Inline video player for active story */}
      {activeIndex !== null && (
        <div className="mt-3 px-4">
          <div className="relative aspect-[9/16] max-h-[60vh] md:max-h-[70vh] lg:max-w-[400px] lg:mx-auto overflow-hidden rounded-2xl bg-[#E8E2D8]">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              key={items[activeIndex].src}
              src={items[activeIndex].src}
              poster={items[activeIndex].poster}
              autoPlay
              playsInline
              controls
              className="absolute inset-0 w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
              aria-label="Cerrar video"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { trackStorefrontEvent } from "../analytics"

export function VideoFrame({
  src,
  poster,
  ratio = "9/16",
  label,
}: {
  src: string
  poster: string
  ratio?: "9/16" | "16/9"
  label?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [playing, setPlaying] = useState(false)
  const firedRef = useRef(false)

  // Lazy-load when the element enters the viewport
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  function handlePlay() {
    const video = videoRef.current
    if (!video) return
    if (!firedRef.current) {
      firedRef.current = true
      trackStorefrontEvent({
        eventName: "Lead",
        type: "video_interest",
        source: "storefront",
        cta: label ?? src,
        placement: "video_frame",
        metadata: { videoSrc: src, videoLabel: label },
      })
    }
    if (playing) {
      video.pause()
      setPlaying(false)
    } else {
      void video.play()
      setPlaying(true)
    }
  }

  const aspectClass = ratio === "9/16" ? "aspect-[9/16]" : "aspect-video"

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl bg-[#E8E2D8] ${aspectClass} cursor-pointer`}
      onClick={handlePlay}
      aria-label={label ?? "Reproducir video"}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handlePlay()}
    >
      {/* Poster image */}
      {!playing && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt={label ?? "Video poster"}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Lazy-loaded video */}
      {loaded && (
        <video
          ref={videoRef}
          src={src}
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onEnded={() => setPlaying(false)}
        />
      )}

      {/* Play button overlay */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="#1A1A18"
              aria-hidden="true"
            >
              <path d="M6.5 4.5l9 5.5-9 5.5V4.5z" />
            </svg>
          </div>
        </div>
      )}

      {/* Label pill */}
      {label && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-black/50 px-3 py-1 text-[11px] text-white backdrop-blur-sm">
            {label}
          </span>
        </div>
      )}
    </div>
  )
}

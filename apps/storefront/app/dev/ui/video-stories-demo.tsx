"use client"

import { VideoStories } from "../../components/ui/video-stories"

const STORIES = [
  {
    src: "/media/hero-cocina.mp4",
    poster: "/media/poster-hero-cocina.jpg",
    label: "Wok en acción",
  },
  {
    src: "/media/receta-wok.mp4",
    poster: "/media/poster-receta-wok.jpg",
    label: "Receta rápida",
  },
  {
    src: "/media/uso-diario-gas.mp4",
    poster: "/media/poster-uso-diario.jpg",
    label: "Uso diario",
  },
  {
    src: "/media/set-mgc.mp4",
    poster: "/media/poster-set-mgc.jpg",
    label: "Set MGC",
  },
]

export function VideoStoriesDemo() {
  return <VideoStories items={STORIES} />
}

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type CarouselPhoto = { src: string; alt: string };

const INTERVAL_MS = 3000;

export default function PhotoCarousel({
  photos,
  sizes,
  priority = false,
}: {
  photos: CarouselPhoto[];
  sizes: string;
  priority?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((i) => (i + 1) % photos.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, active, photos.length]);

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {photos.map((photo, i) => (
        <Image
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          fill
          priority={priority && i === 0}
          sizes={sizes}
          className={`object-cover object-center transition-opacity duration-1000 ${
            i === active ? "opacity-90" : "opacity-0"
          }`}
          aria-hidden={i !== active}
        />
      ))}
      <div className="absolute right-4 top-4 z-10 flex gap-1.5">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Fotografia ${i + 1}`}
            aria-current={i === active}
            className={`h-2 rounded-full transition-all ${
              i === active ? "w-6 bg-brand-accentBright" : "w-2 bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

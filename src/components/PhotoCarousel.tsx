"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type CarouselPhoto = { src: string; alt: string };

const INTERVAL_MS = 3000;
// Horizontal finger travel that counts as a swipe rather than a tap.
const SWIPE_PX = 40;

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

  // Changing the photo also restarts the autoplay timer (it depends on `active`).
  const go = (step: number) => setActive((i) => (i + step + photos.length) % photos.length);

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    swiped.current = false;
  }

  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    // Mostly vertical moves are page scrolls, not swipes.
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(t.clientY - start.y)) return;
    swiped.current = true;
    go(dx < 0 ? 1 : -1);
  }

  // A tap on the left third goes back, anywhere else goes forward.
  function onClick(e: React.MouseEvent<HTMLDivElement>) {
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    go(e.clientX - rect.left < rect.width / 3 ? -1 : 1);
  }

  return (
    <div
      className="absolute inset-0 cursor-pointer touch-pan-y select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
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
          draggable={false}
        />
      ))}
      <div className="absolute right-2 top-2 z-10 flex">
        {photos.map((photo, i) => (
          // The padding gives each dot a finger-sized tap area.
          <button
            key={photo.src}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActive(i);
            }}
            aria-label={`Fotografia ${i + 1}`}
            aria-current={i === active}
            className="group p-1.5 sm:p-1"
          >
            <span
              className={`block h-2 rounded-full transition-all ${
                i === active ? "w-6 bg-brand-accentBright" : "w-2 bg-white/60 group-hover:bg-white"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

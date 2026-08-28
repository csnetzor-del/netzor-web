"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  id: string;
  image: string;
  imageAlt: string;
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  cta?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
};

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[index];

  return (
    <section className="relative mt-20 h-[calc(72vh-5rem)] min-h-[420px] max-h-[740px] w-full overflow-hidden border-b border-border shadow-[0_8px_32px_rgba(0,127,255,0.15)]">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            i === index ? "opacity-100 z-0" : "opacity-0 z-0 pointer-events-none"
          )}
        >
          <Image
            src={s.image}
            alt={s.imageAlt}
            fill
            priority={i === 0}
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
      ))}

      <div className="hero-overlay absolute inset-0 z-[1]" aria-hidden />
      <div className="hero-overlay-accent absolute inset-0 z-[1]" aria-hidden />

      <div className="hero-overlay-top absolute inset-x-0 top-0 z-[2] h-24 pointer-events-none" aria-hidden />

      <div className="relative z-10 flex h-full items-center pb-14">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div key={slide.id} className="max-w-3xl animate-fade-in">
            <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
              {slide.eyebrow}
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-md">
              {slide.title}
            </h1>
            <p className="mt-6 text-lg text-white/85 max-w-2xl leading-relaxed">
              {slide.subtitle}
            </p>
            {(slide.cta || slide.ctaSecondary) && (
              <div className="mt-10 flex flex-wrap gap-4">
                {slide.cta && (
                  <Link href={slide.cta.href}>
                    <Button size="lg">{slide.cta.label}</Button>
                  </Link>
                )}
                {slide.ctaSecondary && (
                  <Link href={slide.ctaSecondary.href}>
                    <Button variant="secondary" size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                      {slide.ctaSecondary.label}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={prev}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2 text-white backdrop-blur hover:bg-black/50 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2 text-white backdrop-blur hover:bg-black/50 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-10 bg-accent-glow" : "w-6 bg-white/40 hover:bg-white/60"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

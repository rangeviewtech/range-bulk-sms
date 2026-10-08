"use client";

import { MagicCard } from "@/components/ui/magic-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { SparklesText } from "@/components/ui/sparkles-text";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { RetroGrid } from "@/components/ui/retro-grid";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Terminal, TypingAnimation, AnimatedSpan } from "@/components/ui/terminal";
import { NeonGradientCard } from "@/components/ui/neon-gradient-card";
import { Meteors } from "@/components/ui/meteors";

export default function ComponentsShowcase() {
  return (
    <div className="flex flex-col gap-12 p-8 max-w-7xl mx-auto w-full mb-24 mt-24">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          <SparklesText>Magic UI Components Showcase</SparklesText>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Here you can find all the highly interactive Magic UI components available in the library, seamlessly integrated into Range Bulk SMS.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Buttons Section */}
        <section className="space-y-6 bg-card p-6 rounded-2xl border">
          <h2 className="text-2xl font-bold">Action Buttons</h2>
          <div className="flex flex-wrap gap-6 items-center">
            <RainbowButton>Rainbow Button</RainbowButton>
            <ShimmerButton className="shadow-2xl">
              <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                Shimmer Button
              </span>
            </ShimmerButton>
          </div>
        </section>

        {/* Typography Section */}
        <section className="space-y-6 bg-card p-6 rounded-2xl border">
          <h2 className="text-2xl font-bold">Typography & Numbers</h2>
          <div className="space-y-6 flex flex-col items-start justify-center">
            <div className="p-4 border rounded-xl bg-background/50 flex flex-col items-center justify-center w-full">
              <div className="text-sm text-muted-foreground mb-2">Animated Shiny Text</div>
              <div className="z-10 flex min-h-[4rem] items-center justify-center">
                <div className="group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                  <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                    <span>✨ New Feature Released</span>
                  </AnimatedShinyText>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-xl bg-background/50 flex flex-col items-center justify-center w-full">
              <div className="text-sm text-muted-foreground mb-2">Number Ticker</div>
              <div className="text-5xl font-bold tracking-tighter text-black dark:text-white">
                <NumberTicker value={100} />
              </div>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section className="space-y-6 bg-card p-6 rounded-2xl border lg:col-span-2">
          <h2 className="text-2xl font-bold">Interactive Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
            <MagicCard className="cursor-pointer flex-col items-center justify-center shadow-2xl whitespace-nowrap text-4xl" gradientColor="#D9D9D955">
              MagicCard (Hover Me)
            </MagicCard>
            
            <NeonGradientCard className="max-w-sm items-center justify-center text-center">
              <span className="pointer-events-none z-10 h-full whitespace-pre-wrap bg-gradient-to-br from-[#ff2975] from-35% to-[#00FFF1] bg-clip-text text-center text-4xl font-bold leading-none tracking-tighter text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                Neon Gradient
              </span>
            </NeonGradientCard>
          </div>
        </section>

        {/* Backgrounds Section */}
        <section className="space-y-6 bg-card p-6 rounded-2xl border lg:col-span-2">
          <h2 className="text-2xl font-bold">Dynamic Backgrounds</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="relative flex h-[300px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
              <span className="pointer-events-none z-10 whitespace-pre-wrap bg-gradient-to-b from-[#ffd319] via-[#ff2975] to-[#8c1eff] bg-clip-text text-center text-5xl font-bold leading-none tracking-tighter text-transparent">
                Retro Grid
              </span>
              <RetroGrid />
            </div>

            <div className="relative flex h-[300px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
              <p className="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-black dark:text-white">
                Dot Pattern
              </p>
              <DotPattern className="absolute inset-0 h-full w-full opacity-50" />
            </div>

            <div className="relative flex h-[300px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
              <p className="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-white">
                Meteors
              </p>
              <Meteors number={30} />
            </div>
            
          </div>
        </section>

        {/* Terminal Section */}
        <section className="space-y-6 bg-card p-6 rounded-2xl border lg:col-span-2">
          <h2 className="text-2xl font-bold">Terminal View</h2>
          <div className="w-full flex justify-center">
            <Terminal>
              <TypingAnimation>&gt; npm run dev</TypingAnimation>
              <AnimatedSpan delay={1500} className="text-green-500">
                <span>✔ Ready in 1250ms</span>
              </AnimatedSpan>
              <AnimatedSpan delay={2000} className="text-blue-500">
                <span>ℹ Network: http://localhost:3000</span>
              </AnimatedSpan>
              <TypingAnimation delay={2500}>&gt; Deploying Magic UI...</TypingAnimation>
              <AnimatedSpan delay={4000} className="text-green-500">
                <span>✔ Successfully launched!</span>
              </AnimatedSpan>
            </Terminal>
          </div>
        </section>

      </div>
    </div>
  );
}

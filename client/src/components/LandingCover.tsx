import { Link } from 'react-router-dom';
import {
  ScallopFrame,
  Strawberry,
  Lemon,
  CitrusHalf,
  Whisk,
  ForkKnife,
  PeaPod,
  Sparkle,
  Herb,
  CookBook,
} from './Doodles';

// Signed-out landing — styled like a family-cookbook cover: doodles scattered
// around a central scalloped panel (filled with doodles, not a photo), the title
// low like "THE DAVIES FAMILY / RECIPES", and a small sign-in link at the bottom.
export default function LandingCover() {
  return (
    <div className="grid min-h-[82vh] place-items-center px-4 py-10">
      <div className="relative w-full max-w-xl">
        {/* doodles framing the cover */}
        <div className="pointer-events-none absolute inset-0 text-terracotta/85" aria-hidden="true">
          <Sparkle className="absolute left-[22%] top-[1%] hidden h-7 w-7 md:block" />
          <Strawberry className="absolute right-0 top-0 h-14 w-14 rotate-6" />
          <PeaPod className="absolute -left-2 top-[10%] hidden h-14 w-14 -rotate-12 sm:block" />
          <ForkKnife className="absolute -left-3 top-[38%] hidden h-16 w-16 sm:block" />
          <Herb className="absolute -right-2 top-[34%] hidden h-14 w-14 sm:block" />
          <Whisk className="absolute -left-2 bottom-24 hidden h-14 w-14 rotate-6 md:block" />
          <PeaPod className="absolute -right-3 bottom-28 hidden h-16 w-16 rotate-12 md:block" />
          <Lemon className="absolute bottom-2 left-1 h-12 w-12 -rotate-6" />
          <CitrusHalf className="absolute bottom-0 right-1 h-14 w-14" />
          <Sparkle className="absolute right-[34%] bottom-[6%] hidden h-6 w-6 md:block" />
        </div>

        {/* cover content */}
        <div className="relative mx-auto flex max-w-sm flex-col items-center">
          <ScallopFrame className="w-full p-3">
            <div className="relative grid aspect-[4/5] w-full place-items-center rounded-xl bg-paper text-terracotta">
              <CookBook className="h-24 w-24" />
              <Sparkle className="absolute left-7 top-7 h-7 w-7" />
              <Strawberry className="absolute right-7 top-9 h-10 w-10 -rotate-12" />
              <Herb className="absolute right-9 top-1/2 hidden h-9 w-9 sm:block" />
              <Whisk className="absolute bottom-8 left-8 h-10 w-10 rotate-6" />
              <Lemon className="absolute bottom-7 right-8 h-10 w-10 rotate-6" />
            </div>
          </ScallopFrame>

          <p className="eyebrow mt-7">The Cook Book Club</p>
          <h1 className="mt-1 font-display text-5xl font-bold tracking-tight text-terracotta">
            RECIPES
          </h1>

          <Link
            to="/login"
            className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-ink/70 underline-offset-4 transition hover:text-terracotta hover:underline"
          >
            Sign in to explore
          </Link>
        </div>
      </div>
    </div>
  );
}

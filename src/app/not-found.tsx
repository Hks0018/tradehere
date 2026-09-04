import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-5 py-24">
      <div className="text-center">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
          404
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-[-0.02em] text-ink-900 sm:text-4xl">
          We couldn&apos;t find that page
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-500">
          The page may have moved, or the symbol you were looking for is not part of the sample
          universe.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/">Back to home</Button>
          <Button href="/markets" variant="secondary">Explore markets</Button>
        </div>
        <p className="mt-8 text-sm text-ink-400">
          Or try the{" "}
          <Link href="/stocks" className="font-medium text-brand-600 hover:text-brand-700">
            stock screener
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

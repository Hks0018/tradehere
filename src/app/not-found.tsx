import Link from "next/link";
import { Band } from "@/components/ui/Band";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MaskedHeading } from "@/components/ui/MaskedHeading";
import { Reveal } from "@/components/ui/Reveal";

export default function NotFound() {
  return (
    <Band env="void" grid className="flex min-h-[80svh] items-center">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/15 blur-[130px]"
      />
      <div className="container-page py-24">
        <Eyebrow onVoid index="404">Not found</Eyebrow>
        <MaskedHeading
          as="h1"
          lines={["That page isn't", "on the tape."]}
          className="mt-8 font-display text-display-2 text-paper-50"
        />
        <Reveal delay={0.2} y={14}>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-paper-200/70">
            The page may have moved, or the symbol you were looking for is not part of the sample
            universe.
          </p>

          <ul className="mt-12 grid max-w-2xl gap-0 border-t border-paper-200/15 sm:grid-cols-3">
            {[
              { label: "Home", href: "/" },
              { label: "Markets", href: "/markets" },
              { label: "Stock screener", href: "/stocks" },
            ].map((link) => (
              <li key={link.href} className="border-b border-paper-200/10 sm:border-b-0">
                <Link
                  href={link.href}
                  className="group/nf flex items-center justify-between gap-4 py-5 sm:pr-8"
                >
                  <span className="font-display text-xl font-semibold text-paper-50">
                    {link.label}
                  </span>
                  <span
                    aria-hidden
                    className="text-paper-300/50 transition-transform duration-300 group-hover/nf:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Band>
  );
}

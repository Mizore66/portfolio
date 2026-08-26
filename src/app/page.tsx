import { Suspense } from "react";
import { OpeningApp } from "@/components/opening/OpeningApp";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen" data-hydrated="false" aria-hidden />
      }
    >
      <OpeningApp />
    </Suspense>
  );
}

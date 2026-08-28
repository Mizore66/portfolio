"use client";

import { useSyncExternalStore } from "react";

type NetworkInformation = EventTarget & { saveData?: boolean };

function connection(): NetworkInformation | undefined {
  return (navigator as Navigator & { connection?: NetworkInformation }).connection;
}

function subscribe(onStoreChange: () => void) {
  const nav = connection();
  nav?.addEventListener("change", onStoreChange);
  const mq = window.matchMedia("(prefers-reduced-data: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => {
    nav?.removeEventListener("change", onStoreChange);
    mq.removeEventListener("change", onStoreChange);
  };
}

function skipDecor(): boolean {
  if (connection()?.saveData === true) return true;
  return window.matchMedia("(prefers-reduced-data: reduce)").matches;
}

export function DeskCollage() {
  const skip = useSyncExternalStore(subscribe, skipDecor, () => false);
  return <div className={skip ? "desk-plain" : "desk-collage"} aria-hidden="true" />;
}

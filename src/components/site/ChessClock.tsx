"use client";

import { useEffect, useState } from "react";

const fmt = (tz?: string) => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: tz });

/**
 * The contact section's chess clock (from Revelatio's two time zones): the
 * visitor's face runs, because it is White's move; Anas's face shows Malaysia
 * Time. Decorative (`aria-hidden`): the location and reply time are stated in text.
 * One tick a second, none while the tab is hidden.
 */
export function ChessClock({ zone, name }: { zone: string; name: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;
    const run = () => {
      if (id) clearInterval(id);
      id = null;
      if (document.visibilityState !== "visible") return;
      setNow(new Date());
      id = setInterval(() => setNow(new Date()), 1000);
    };
    run();
    document.addEventListener("visibilitychange", run);
    return () => {
      if (id) clearInterval(id);
      document.removeEventListener("visibilitychange", run);
    };
  }, []);
  return (
    <div className="clock" aria-hidden="true">
      <div className="clock-face clock-running">
        <span className="clock-label">You</span>
        <span className="clock-time">{now ? fmt().format(now) : "--:--:--"}</span>
      </div>
      <div className="clock-face">
        <span className="clock-label">{name}</span>
        <span className="clock-time">{now ? fmt(zone).format(now) : "--:--:--"}</span>
      </div>
    </div>
  );
}

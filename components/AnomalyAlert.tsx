"use client";

import { useState } from "react";
import Link from "next/link";

export default function AnomalyAlert() {
  const [dismissed, setDismissed] = useState(false);
  const [ticketRaised, setTicketRaised] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-red-950/80 border-b border-red-700/60 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
        <span className="text-red-400 font-bold text-sm animate-pulse">🚨 ACTIVE ANOMALY</span>
        <span className="text-red-200 text-sm flex-1">
          <span className="font-semibold">LC2 Block:</span> ₹4,200 wasted this week · Friday
          6–9pm · 0 classes scheduled · AC running at full load
        </span>
        <div className="flex items-center gap-2 ml-auto">
          <Link
            href="/map"
            className="text-red-300 hover:text-white text-xs font-medium underline underline-offset-2"
          >
            View Details →
          </Link>
          {ticketRaised ? (
            <span className="text-green-400 text-xs font-semibold">
              ✅ TKT-002 raised. Facilities notified.
            </span>
          ) : (
            <button
              onClick={() => setTicketRaised(true)}
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
            >
              Raise Ticket →
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="text-red-400 hover:text-white text-lg leading-none ml-1"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  temperature: number;
  weathercode: number;
}

export default function WeatherBar() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&current=temperature_2m,weathercode"
    )
      .then((r) => r.json())
      .then((d) => {
        setWeather({
          temperature: Math.round(d.current.temperature_2m),
          weathercode: d.current.weathercode,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const temp = weather?.temperature ?? 0;

  const bgClass =
    !weather
      ? "bg-[#1E293B]"
      : temp > 32
      ? "bg-orange-900/60 border-orange-700/50"
      : temp < 25
      ? "bg-green-900/40 border-green-700/50"
      : "bg-[#1E293B] border-[#334155]";

  const message =
    !weather
      ? "Weather data loading..."
      : temp > 32
      ? `High AC load expected · Energy demand +15%`
      : temp < 25
      ? `Cool weather · AC savings opportunity`
      : `Moderate conditions · Normal energy load`;

  const icon = temp > 32 ? "🔥" : temp < 25 ? "🌿" : "🌡️";

  return (
    <div className={`border-b ${bgClass} px-4 py-2`}>
      <div className="max-w-7xl mx-auto flex items-center gap-3 text-sm">
        <span>{icon}</span>
        <span className="text-slate-300">
          {loading ? (
            "🌡️ Bengaluru: Weather data loading..."
          ) : (
            <>
              <span className="font-semibold text-white">Bengaluru Live: {temp}°C</span>
              <span className="text-slate-400 mx-2">·</span>
              <span>{message}</span>
            </>
          )}
        </span>
        {temp > 32 && weather && (
          <span className="ml-auto text-orange-400 text-xs font-semibold animate-pulse">
            ⚡ HIGH DEMAND ALERT
          </span>
        )}
        {temp < 25 && weather && (
          <span className="ml-auto text-green-400 text-xs font-semibold">
            ✅ SAVINGS WINDOW
          </span>
        )}
      </div>
    </div>
  );
}

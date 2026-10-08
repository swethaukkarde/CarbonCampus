"use client";

import { useEffect, useState } from "react";

interface Scenario {
  id: number;
  scenario: string;
  building: string;
  annualSavings: number;
  co2Reduction: number;
  feasibility: string;
  description: string;
}

interface Building {
  buildingId: string;
  buildingName: string;
}

function formatINR(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

const feasibilityColor: Record<string, string> = {
  Easy: "badge-green",
  Medium: "badge-orange",
  Hard: "badge-red",
};

export default function WhatIf() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [running, setRunning] = useState<number | null>(null);
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [acHours, setAcHours] = useState(2);
  const [customBuilding, setCustomBuilding] = useState("LC2");

  useEffect(() => {
    fetch("/data/whatif_scenarios.json").then((r) => r.json()).then(setScenarios);
    fetch("/data/energy_profile.json").then((r) => r.json()).then((data) =>
      setBuildings(data.map((b: { buildingId: string; buildingName: string }) => ({ buildingId: b.buildingId, buildingName: b.buildingName })))
    );
  }, []);

  function runSimulation(id: number) {
    setRunning(id);
    setTimeout(() => {
      setRunning(null);
      setResults((prev) => ({ ...prev, [id]: true }));
    }, 1800);
  }

  // Custom scenario calculation
  // hours_reduced × acCount × 1.75kW × ₹8 × 180 days
  const acCountMap: Record<string, number> = { LC1: 30, LC2: 105, LIB: 18, EXAM: 10, ACT: 14, FOOD: 8 };
  const customAcCount = acCountMap[customBuilding] ?? 30;
  const customAnnualSavings = acHours * customAcCount * 1.75 * 8 * 180;
  const customCo2 = Math.round(customAnnualSavings / 8 * 0.82);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">🔬 What-If Simulator</h1>
        <p className="text-slate-400 text-sm mt-1">
          Predict savings before decisions are made. Run scenarios, see impact instantly.
        </p>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {scenarios.map((s) => (
          <div key={s.id} className="card p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold text-white text-base">{s.scenario}</h3>
              <span className={feasibilityColor[s.feasibility] || "badge-green"}>
                {s.feasibility}
              </span>
            </div>

            <p className="text-slate-400 text-sm">{s.description}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0F172A] rounded-lg p-3">
                <p className="text-green-400 font-black text-xl">
                  {formatINR(s.annualSavings)}
                </p>
                <p className="text-slate-500 text-xs">annual savings</p>
              </div>
              <div className="bg-[#0F172A] rounded-lg p-3">
                <p className="text-blue-400 font-black text-xl">{s.co2Reduction} kg</p>
                <p className="text-slate-500 text-xs">CO₂/month reduction</p>
              </div>
            </div>

            {results[s.id] ? (
              <SimulationResult scenario={s} />
            ) : (
              <button
                onClick={() => runSimulation(s.id)}
                disabled={running === s.id}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-wait text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
              >
                {running === s.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⚙️</span> Running simulation...
                  </span>
                ) : (
                  "▶ Run Simulation"
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Custom Scenario Builder */}
      <div className="card p-6 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-white">🛠️ Custom Scenario Builder</h2>
          <p className="text-slate-400 text-sm mt-1">
            Adjust parameters and see live savings estimates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-2">
              Building
            </label>
            <select
              value={customBuilding}
              onChange={(e) => setCustomBuilding(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {buildings.map((b) => (
                <option key={b.buildingId} value={b.buildingId}>
                  {b.buildingName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-300 text-sm font-medium block mb-2">
              Reduce AC hours by:{" "}
              <span className="text-blue-400 font-bold">{acHours} hrs/day</span>
            </label>
            <input
              type="range"
              min={1}
              max={6}
              value={acHours}
              onChange={(e) => setAcHours(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-slate-500 text-xs mt-1">
              <span>1 hr</span>
              <span>6 hrs</span>
            </div>
          </div>
        </div>

        {/* Live result */}
        <div className="bg-[#0F172A] rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-green-400 font-black text-3xl">{formatINR(customAnnualSavings)}</p>
            <p className="text-slate-400 text-sm mt-1">Estimated annual savings</p>
          </div>
          <div className="text-center">
            <p className="text-blue-400 font-black text-3xl">
              {formatINR(customAnnualSavings * 5)}
            </p>
            <p className="text-slate-400 text-sm mt-1">Over 5 years</p>
          </div>
          <div className="text-center">
            <p className="text-yellow-400 font-black text-3xl">
              {Math.round(customCo2 / 21)} 🌳
            </p>
            <p className="text-slate-400 text-sm mt-1">Trees equivalent/year</p>
          </div>
        </div>

        <p className="text-slate-500 text-xs">
          Formula: {acHours} hrs × {customAcCount} ACs × 1.75 kW × ₹8/unit × 180 days ={" "}
          <span className="text-green-400">{formatINR(customAnnualSavings)}/year</span>
        </p>
      </div>
    </div>
  );
}

function SimulationResult({ scenario }: { scenario: Scenario }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(Math.min(100, (scenario.annualSavings / 60000) * 100)), 100);
    return () => clearTimeout(t);
  }, [scenario.annualSavings]);

  const fiveYear = scenario.annualSavings * 5;
  const trees = Math.round((scenario.co2Reduction * 12) / 21);
  const recommendation =
    scenario.feasibility === "Easy"
      ? "✅ Implement immediately"
      : scenario.feasibility === "Medium"
      ? "📅 Plan for next semester"
      : "🔬 Requires detailed planning";

  return (
    <div className="bg-green-950/40 border border-green-700/40 rounded-xl p-4 space-y-3">
      <p className="text-green-400 font-bold text-sm">✅ Simulation Complete</p>

      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Savings potential</span>
          <span>₹{(scenario.annualSavings / 1000).toFixed(0)}k / year</span>
        </div>
        <div className="bg-[#0F172A] rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-1000"
            style={{ width: `${width}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-[#0F172A] rounded-lg p-2 text-center">
          <p className="text-white font-bold">₹{fiveYear.toLocaleString("en-IN")}</p>
          <p className="text-slate-500 text-xs">5-year savings</p>
        </div>
        <div className="bg-[#0F172A] rounded-lg p-2 text-center">
          <p className="text-white font-bold">{trees} 🌳</p>
          <p className="text-slate-500 text-xs">trees equivalent</p>
        </div>
      </div>

      <p className="text-yellow-300 text-sm font-semibold">{recommendation}</p>
    </div>
  );
}

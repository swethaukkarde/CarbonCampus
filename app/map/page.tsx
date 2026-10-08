"use client";

import { useEffect, useState } from "react";

interface Building {
  buildingId: string;
  buildingName: string;
  semesterWasteRupees: number;
  co2KgPerSemester: number;
  wasteSeverity: string;
  energyScore: number;
  totalRooms: number;
  recommendedAction: string;
  expectedSavingsRupees: number;
  ticketRaised: boolean;
  anomaly: {
    detected: boolean;
    description?: string;
    wasteThisWeek?: number;
    timeSlot?: string;
    day?: string;
    suggestedAction?: string;
  };
}

interface FeedbackEntry {
  id: number;
  building: string;
  floor: number;
  timestamp: string;
  status: "occupied" | "empty";
  confirmedBy: string;
  note: string;
  modelLearned: boolean;
}

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">
      <span>✅</span> {message}
    </div>
  );
}

export default function MapPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [fbBuilding, setFbBuilding] = useState("LC2");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/energy_profile.json").then((r) => r.json()).then(setBuildings);
    fetch("/data/feedback_log.json").then((r) => r.json()).then(setFeedback);
  }, []);

  function submitFeedback(status: "occupied" | "empty") {
    const newEntry: FeedbackEntry = {
      id: feedback.length + 1,
      building: fbBuilding,
      floor: Math.floor(Math.random() * 5) + 1,
      timestamp: new Date().toISOString(),
      status,
      confirmedBy: "You (Dashboard User)",
      note: status === "occupied" ? "Marked occupied via dashboard" : "Marked empty via dashboard",
      modelLearned: true,
    };
    setFeedback((prev) => [newEntry, ...prev]);
    setToast("Model updated! Accuracy improving.");
  }

  const selectedBuilding = buildings.find((b) => b.buildingId === selected);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">🗺️ Campus Map — Building Overview</h1>
        <p className="text-slate-400 text-sm mt-1">
          Click any building for details. Red pulse = active anomaly.
        </p>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Building Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {buildings.map((b) => (
          <div
            key={b.buildingId}
            onClick={() => setSelected(selected === b.buildingId ? null : b.buildingId)}
            className={`card p-5 cursor-pointer transition-all duration-300 ${
              b.anomaly.detected
                ? "border-red-500 animate-pulse hover:animate-none"
                : "card-hover"
            } ${selected === b.buildingId ? "ring-2 ring-blue-500" : ""}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-white">{b.buildingName}</h3>
                <p className="text-slate-400 text-xs mt-0.5">{b.totalRooms} rooms</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={
                    b.wasteSeverity === "HIGH"
                      ? "badge-red"
                      : b.wasteSeverity === "MEDIUM"
                      ? "badge-orange"
                      : "badge-green"
                  }
                >
                  {b.wasteSeverity}
                </span>
                {b.anomaly.detected && (
                  <span className="badge-red text-xs">⚠️ ANOMALY</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 font-black text-xl">
                  {formatINR(b.semesterWasteRupees)}
                </p>
                <p className="text-slate-500 text-xs">semester waste</p>
              </div>
              <div className="text-right">
                <p
                  className="text-2xl font-black"
                  style={{
                    color:
                      b.energyScore > 80 ? "#22C55E" : b.energyScore >= 60 ? "#F97316" : "#EF4444",
                  }}
                >
                  {b.energyScore}
                </p>
                <p className="text-slate-500 text-xs">energy score</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Detail */}
      {selectedBuilding && (
        <div className="card p-6 border-blue-500/50 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              📋 {selectedBuilding.buildingName} — Details
            </h2>
            <button
              onClick={() => setSelected(null)}
              className="text-slate-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <DetailStat label="Semester Waste" value={formatINR(selectedBuilding.semesterWasteRupees)} />
            <DetailStat label="CO₂ (kg)" value={selectedBuilding.co2KgPerSemester.toLocaleString("en-IN")} />
            <DetailStat label="Energy Score" value={String(selectedBuilding.energyScore)} />
            <DetailStat label="Total Rooms" value={String(selectedBuilding.totalRooms)} />
          </div>

          <div className="bg-[#0F172A] rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">🎯 Recommended Action</p>
            <p className="text-white font-medium">{selectedBuilding.recommendedAction}</p>
            <p className="text-green-400 text-sm mt-2">
              💰 Expected savings: {formatINR(selectedBuilding.expectedSavingsRupees)}/year
            </p>
          </div>

          {selectedBuilding.anomaly.detected && (
            <div className="bg-red-950/50 border border-red-700/50 rounded-lg p-4">
              <p className="text-red-400 font-bold mb-1">🚨 Anomaly Details</p>
              <p className="text-red-200 text-sm">{selectedBuilding.anomaly.description}</p>
              <p className="text-orange-400 text-sm mt-2">
                💡 {selectedBuilding.anomaly.suggestedAction}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <span
              className={
                selectedBuilding.ticketRaised
                  ? "text-green-400 text-sm"
                  : "text-slate-400 text-sm"
              }
            >
              {selectedBuilding.ticketRaised
                ? "✅ Ticket TKT-001 raised — Facilities Team assigned"
                : "No ticket raised yet"}
            </span>
          </div>
        </div>
      )}

      {/* SFL Feedback Panel */}
      <section className="card p-6 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-white">
            🔄 Sustainability Feedback Loop — Guard Check-in
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Report real-time occupancy. Each check-in improves the AI model.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={fbBuilding}
            onChange={(e) => setFbBuilding(e.target.value)}
            className="bg-[#0F172A] border border-[#334155] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {buildings.map((b) => (
              <option key={b.buildingId} value={b.buildingId}>
                {b.buildingName}
              </option>
            ))}
          </select>
          <button
            onClick={() => submitFeedback("occupied")}
            className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            ✅ Mark Occupied
          </button>
          <button
            onClick={() => submitFeedback("empty")}
            className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            ❌ Mark Empty
          </button>
        </div>

        {/* Feedback Timeline */}
        <div className="space-y-3">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
            Recent Check-ins
          </p>
          {feedback.slice(0, 4).map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 bg-[#0F172A] rounded-lg px-4 py-3"
            >
              <span className="text-lg mt-0.5">
                {entry.status === "occupied" ? "🟢" : "🔴"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white text-sm">{entry.building}</span>
                  <span className="text-slate-500 text-xs">Floor {entry.floor}</span>
                  <span
                    className={`text-xs font-semibold ${
                      entry.status === "occupied" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {entry.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5 truncate">{entry.note}</p>
                <p className="text-slate-600 text-xs mt-0.5">
                  {entry.confirmedBy} ·{" "}
                  {new Date(entry.timestamp).toLocaleString("en-IN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              {entry.modelLearned && (
                <span className="text-blue-400 text-xs font-semibold whitespace-nowrap">
                  🤖 Learned
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0F172A] rounded-lg p-3 text-center">
      <p className="text-xl font-black text-white">{value}</p>
      <p className="text-slate-400 text-xs mt-0.5">{label}</p>
    </div>
  );
}

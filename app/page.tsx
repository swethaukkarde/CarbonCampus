"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

interface Building {
  buildingId: string;
  buildingName: string;
  semesterWasteRupees: number;
  co2KgPerSemester: number;
  wasteSeverity: string;
  energyScore: number;
  color: string;
  recommendedAction: string;
  expectedSavingsRupees: number;
  expectedCo2ReductionKg: number;
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

interface WeeklyTrend {
  week: string;
  totalWasteRupees: number;
  totalWasteKwh: number;
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
    <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-bounce">
      <span>✅</span> {message}
    </div>
  );
}

const severityColor: Record<string, string> = {
  HIGH: "#EF4444",
  MEDIUM: "#F97316",
  LOW: "#22C55E",
};

export default function Dashboard() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [trend, setTrend] = useState<WeeklyTrend[]>([]);
  const [tickets, setTickets] = useState<string[]>(["TKT-001"]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/energy_profile.json").then((r) => r.json()).then(setBuildings);
    fetch("/data/weekly_trend.json").then((r) => r.json()).then(setTrend);
  }, []);

  const actionBuildings = buildings.filter(
    (b) => b.wasteSeverity === "HIGH" || b.wasteSeverity === "MEDIUM" || b.anomaly.detected
  );

  const sorted = [...buildings].sort((a, b) => a.energyScore - b.energyScore);

  function raiseTicket(building: Building) {
    const id = `TKT-00${tickets.length + 1}`;
    setTickets((prev) => [...prev, id]);
    setToast(`${id} raised for ${building.buildingName}. Facilities team notified.`);
  }

  const barData = buildings.map((b) => ({
    name: b.buildingName.replace(" Block", "").replace(" Center", "").replace(" & Aromas", ""),
    waste: b.semesterWasteRupees,
    fill: severityColor[b.wasteSeverity],
  }));

  return (
    <div className="space-y-10">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Hero */}
      <div className="text-center space-y-4 py-6">
        <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">
          Even Semester 2026 · Alliance University, Bengaluru
        </p>
        <h1 className="text-6xl sm:text-7xl font-black text-red-500 tracking-tight">
          ₹3,19,910
        </h1>
        <p className="text-slate-400 text-lg">Estimated energy waste this semester</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-6">
          <StatCard label="Total kWh Wasted" value="39,988" icon="⚡" color="yellow" />
          <StatCard label="CO₂ Emitted (kg)" value="32,791" icon="🌫️" color="slate" />
          <StatCard label="Trees Needed" value="1,562" icon="🌳" color="green" />
        </div>
      </div>

      {/* AI Action Engine */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <span className="text-2xl">🤖</span>
          <div>
            <h2 className="text-xl font-bold text-white">AI Action Engine</h2>
            <p className="text-slate-400 text-sm">
              AI-generated insights for buildings that need immediate attention
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {actionBuildings.map((b) => (
            <div
              key={b.buildingId}
              className={`card p-5 space-y-4 border-l-4 ${
                b.wasteSeverity === "HIGH"
                  ? "border-l-red-500"
                  : "border-l-orange-500"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{b.wasteSeverity === "HIGH" ? "🔴" : "🟠"}</span>
                <p className="text-white text-sm leading-relaxed">
                  <span className="font-bold">{b.buildingName}</span> is expected to waste{" "}
                  <span className="text-red-400 font-bold">
                    {formatINR(b.semesterWasteRupees)}
                  </span>{" "}
                  this semester.{" "}
                  {b.anomaly.detected
                    ? b.anomaly.description
                    : `Running ${b.wasteSeverity.toLowerCase()} energy waste pattern.`}
                </p>
              </div>

              <div className="bg-[#0F172A] rounded-lg p-4 space-y-2 text-sm">
                <ActionRow icon="→" label="Recommended Action" value={b.recommendedAction} />
                <ActionRow
                  icon="💰"
                  label="Expected Savings"
                  value={`${formatINR(b.expectedSavingsRupees)}/year`}
                  highlight
                />
                <ActionRow
                  icon="🌿"
                  label="Carbon Reduction"
                  value={`${b.expectedCo2ReductionKg.toLocaleString()} kg CO₂/year`}
                />
              </div>

              <div className="flex items-center justify-between">
                {b.ticketRaised || tickets.includes("TKT-001") && b.buildingId === "LC2" ? (
                  <span className="text-green-400 text-xs font-semibold">
                    ✅ Ticket already raised
                  </span>
                ) : (
                  <button
                    onClick={() => raiseTicket(b)}
                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                  >
                    🎫 Raise Ticket
                  </button>
                )}
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    b.wasteSeverity === "HIGH"
                      ? "badge-red"
                      : "badge-orange"
                  }`}
                >
                  {b.wasteSeverity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leaderboard */}
      <section>
        <h2 className="text-xl font-bold mb-5">
          🏆 Building Energy Scores — Current Semester
        </h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155] bg-[#0F172A]">
                <th className="text-left px-5 py-3 text-slate-400 font-semibold">Building</th>
                <th className="text-left px-5 py-3 text-slate-400 font-semibold hidden sm:table-cell">
                  Semester Waste
                </th>
                <th className="text-left px-5 py-3 text-slate-400 font-semibold">
                  Energy Score
                </th>
                <th className="text-left px-5 py-3 text-slate-400 font-semibold hidden md:table-cell">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((b, i) => (
                <tr
                  key={b.buildingId}
                  className="border-b border-[#334155] last:border-0 hover:bg-[#253247] transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs w-4">{i + 1}</span>
                      <span className="font-medium text-white">{b.buildingName}</span>
                      {b.anomaly.detected && (
                        <span className="text-red-400 text-xs animate-pulse">⚠️</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-300 hidden sm:table-cell">
                    {formatINR(b.semesterWasteRupees)}
                  </td>
                  <td className="px-5 py-4 w-48">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-[#0F172A] rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${b.energyScore}%`,
                            backgroundColor:
                              b.energyScore > 80
                                ? "#22C55E"
                                : b.energyScore >= 60
                                ? "#F97316"
                                : "#EF4444",
                          }}
                        />
                      </div>
                      <span
                        className="text-sm font-bold w-8"
                        style={{
                          color:
                            b.energyScore > 80
                              ? "#22C55E"
                              : b.energyScore >= 60
                              ? "#F97316"
                              : "#EF4444",
                        }}
                      >
                        {b.energyScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-bold mb-4 text-white">📊 Waste by Building (₹)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 30, left: 10 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                angle={-30}
                textAnchor="end"
              />
              <YAxis
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v: number) => [formatINR(v), "Waste"]}
                contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8 }}
                labelStyle={{ color: "#fff" }}
              />
              <Bar dataKey="waste" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <rect key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-bold mb-4 text-white">📈 Weekly Waste Trend (₹)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v: number) => [formatINR(v), "Waste"]}
                contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8 }}
                labelStyle={{ color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="totalWasteRupees"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: "#3B82F6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    yellow: "text-yellow-400",
    green: "text-green-400",
    slate: "text-slate-300",
  };
  return (
    <div className="card p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`text-2xl font-black ${colorMap[color] || "text-white"}`}>{value}</div>
      <div className="text-slate-400 text-xs mt-1">{label}</div>
    </div>
  );
}

function ActionRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-slate-400 mt-0.5">{icon}</span>
      <span className="text-slate-400">{label}:</span>
      <span className={`font-semibold ${highlight ? "text-green-400" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}

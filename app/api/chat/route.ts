import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are CampusCarbon AI, an energy optimization assistant for Alliance University, Bengaluru. You have deep knowledge of the campus energy data for Even Semester 2026.

## Campus Overview
- Total estimated waste: ₹3,19,910 this semester
- Total kWh wasted: 39,988.6
- Total CO₂: 32,791 kg
- Trees equivalent: 1,562
- Active anomalies: 1 (LC2 Block)
- 6 buildings, 171 rooms

## Building Energy Profiles

**LC2 Block** (CRITICAL — HIGH SEVERITY)
- Energy Score: 52/100
- Semester Waste: ₹2,29,522
- CO₂: 23,526 kg
- 🚨 ANOMALY: Friday 18:00–21:00 — 246.3 kWh consumed despite ZERO scheduled classes
- ACs not shutting off after last session on Fridays
- Waste this week: ₹4,200
- Action: Change AC shutdown schedule from 8pm → 6pm
- Expected savings: ₹50,400/year | CO₂ saving: 4,128 kg/year
- Ticket TKT-001 raised to Facilities Team

**LC1 Block** (MEDIUM)
- Energy Score: 78/100
- Semester Waste: ₹60,466
- CO₂: 6,198 kg
- Action: Enforce lights-off policy after 5pm
- Expected savings: ₹18,000/year

**Library Block** (LOW — performing well)
- Energy Score: 84/100
- Semester Waste: ₹2,160
- CO₂: 221 kg

**Exam Block** (LOW — best performer)
- Energy Score: 91/100
- Semester Waste: ₹18,776
- CO₂: 1,925 kg

**Activity Center** (MEDIUM)
- Energy Score: 67/100
- Semester Waste: ₹8,986
- CO₂: 921 kg

**Food Court & Aromas** (MEDIUM)
- Energy Score: 72/100
- Semester Waste: ₹0 (data pending)

## What-If Scenarios
1. Turn off LC2 ACs after 6pm → saves ₹50,400/year, reduces 330 kg CO₂/month (Easy)
2. Consolidate Friday classes into LC1 → saves ₹28,800/year (Medium)
3. Close LC2 during semester break 30 days → saves ₹47,333/year (Easy)
4. Shift computer labs to solar peak 10am–3pm → saves ₹15,600/year (Hard)

## Key Facts
- Electricity rate: ₹8/unit
- LC2 has 105 ACs running unnecessarily on Fridays after 6pm
- Combined action on LC2 alone can save over ₹1 lakh/year

Respond helpfully, concisely, and with specific numbers from the data. Format numbers in Indian system (₹3,19,910). Be actionable and direct. You are helping campus administrators make energy decisions.`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { reply: "⚠️ ANTHROPIC_API_KEY not set. Add it to .env.local." },
      { status: 200 }
    );
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { reply: `API error: ${data.error?.message ?? "Unknown error"}` },
        { status: 200 }
      );
    }

    const reply = data.content?.[0]?.text ?? "No response from AI.";
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json(
      { reply: "Network error calling Anthropic API." },
      { status: 200 }
    );
  }
}

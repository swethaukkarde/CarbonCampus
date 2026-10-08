# CampusCarbon ⚡
**AI-powered Smart Campus Energy Optimizer — Alliance University, Bengaluru**

Microsoft AI for Good Hackathon Demo

## Setup

### 1. Install dependencies
```bash
npm install recharts lucide-react
```

### 2. Add your API key
```bash
cp .env.local.example .env.local
# Edit .env.local and add your Anthropic API key
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages
| Route | Description |
|-------|-------------|
| `/` | Dashboard — hero stats, AI Action Engine, leaderboard, charts |
| `/map` | Campus Map — building cards, anomaly highlights, SFL feedback |
| `/whatif` | What-If Simulator — scenario cards, custom AC calculator |
| `/copilot` | AI Copilot — chat with Claude about campus energy data |

## Deploy to Vercel
```bash
npx vercel --prod
```
Set `ANTHROPIC_API_KEY` in Vercel environment variables.

## Data Files (`/public/data/`)
- `summary.json` — campus-level aggregates
- `energy_profile.json` — per-building energy data + anomalies
- `weekly_trend.json` — 9-week waste trend
- `feedback_log.json` — guard check-in history
- `whatif_scenarios.json` — 4 pre-built scenarios
- `tickets.json` — maintenance tickets

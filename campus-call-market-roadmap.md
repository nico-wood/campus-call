# Campus Call — Public-Data Market Roadmap

## Product direction

Campus Call should be positioned as a **play-money campus forecasting network**, not a sports-betting app.

> Campus Call predicts the campus moments that change a student’s next decision.

The product has two complementary jobs:

1. **Campus Pulse:** social, fun, high-energy forecasts that give people a reason to participate and share.
2. **Campus Utility:** forecasts that help a student decide what to do right now, such as whether to leave for the bus or bring a jacket.

All markets use virtual, non-redeemable points. Every market must have a public source, an exact close time, a clear resolution rule, and an evidence link after resolution.

## Market-quality rules

Before launching a market, answer all of these questions:

1. Is the question understandable in a few seconds?
2. Does it resolve to one unambiguous outcome?
3. Is there a public, authoritative internet source that can resolve it?
4. Is there a defined closing time before the event/outcome?
5. Can the source evidence be stored and shown later?

If any answer is `no`, do not launch the market yet.

## Tier 1: Athletics (best launch category)

### Why it works

- Strong emotional engagement and easy onboarding.
- Official schedules, live stats, box scores, and standings are public.
- Outcomes are objective and timely.
- The volleyball pilot already proves this category.

### Good market types

| Question pattern | Example | Resolution source |
|---|---|---|
| Match winner | Will Cal Poly beat Montana State? | Official final score |
| Margin / set score | Will Cal Poly sweep 3–0? | Official box score |
| First period / set | Who wins Set 1? | Official live stats / box score |
| Threshold | Will Cal Poly score 75+ points? | Official box score |
| Season outcome | Will Cal Poly earn the No. 1 seed? | Official standings |

### Avoid

- Player props unless lineup/participation is known and the product has a clear void rule.
- Markets that close after an event has started.
- Any market with real-money stakes or prizes tied to correct forecasts.

## Tier 2: Weather (best non-sports daily habit)

### Value proposition

Weather is universal and repeatable. It is not the most exciting category, but it can create a daily reason to open Campus Call.

### Public data source

Use the National Weather Service API:

1. `https://api.weather.gov/points/{latitude},{longitude}` returns forecast and observation-station information for the chosen campus coordinate.
2. Choose one named observation station and store that station ID with every market.
3. Resolve observed-condition markets from that same station.

### Good market types

| Question pattern | Example | Resolution rule |
|---|---|---|
| Daily high | Will the official high reach 70°F tomorrow? | `Yes` if the named station’s daily maximum is at least 70°F. |
| Rain window | Will measurable rain fall from 11 a.m. to 2 p.m.? | `Yes` if the station reports at least 0.01 inches during the stated PT window. |
| Wind threshold | Will wind gusts exceed 25 mph before 6 p.m.? | `Yes` if the named station reports a gust over 25 mph in the window. |
| Temperature range | What will tomorrow’s high be? | Multi-outcome: `<60`, `60–69`, `70–79`, `80+`; resolve from daily maximum. |

### Product presentation

Frame this as a decision, not trivia:

> **Bring a jacket?** The campus gives a 68% chance that the high stays below 65°F.

### Implementation notes

- Never resolve an observed-weather market from a forecast.
- Save the source response, URL, and timestamp used for resolution because forecasts change.
- Use Pacific Time consistently in all user-facing questions.

## Tier 3: Transit (best campus-utility story)

### Value proposition

The real value is not “guess whether the bus is late.” It is helping students decide whether to leave, wait, walk, or bike.

> **Leave now?** The community gives the next campus-bound bus a 71% chance of arriving on time.

### Public data source

City of San Luis Obispo Transit publishes GTFS-realtime data:

- [SLO Transit real-time feed record and endpoints](https://www.transit.land/data/feeds/f-9q60w-cityofsanluisobispotransit~rt)
- Vehicle positions
- Trip updates / predicted arrivals
- Service alerts
- Static GTFS schedule data

### Good market types

| Question pattern | Example | Resolution rule |
|---|---|---|
| Arrival countdown | At 8:30 a.m., will the next Route X bus reach [stop] within eight minutes? | Save the official trip-update snapshot at 8:30. `Yes` if the next matching predicted arrival is eight minutes or less away. |
| Deadline arrival | At 5 p.m., will the next Route X arrival occur after 5:15 p.m.? | At 5 p.m., resolve from the saved official predicted arrival. |
| Service disruption | Will an official service alert affect Route X at noon? | `Yes` if the official alert feed has an active route/trip-specific alert at noon. |
| Vehicle proximity | Will the nearest active Route X vehicle be within 0.5 miles of [landmark] at 3 p.m.? | Calculate distance from the saved official vehicle-position snapshot to a fixed coordinate. |

### Better long-term market

The most useful version is an actual on-time-arrival question:

> Will Route X reach the campus stop within three minutes of its scheduled 8:45 a.m. arrival?

To resolve this fairly, the backend must poll and store vehicle positions, detect when a vehicle crosses a fixed stop geofence, and compare that time against the static GTFS schedule. This requires more engineering than a point-in-time snapshot, but it produces a meaningful campus-utility product.

### Implementation notes

- Use a backend or scheduled function to fetch and cache feeds; do not depend on browser-side calls.
- A real-time feed is a current snapshot. If resolving a market about a past time, save the snapshot at that time.
- Start with one known route and one stop; do not attempt every route at once.

## Other public-data opportunities

These can work only when an official public source is available for the specific event:

| Category | Possible market | Requirement |
|---|---|---|
| Ticketed campus event | Will the event sell out before noon? | Public availability or inventory status visible online. |
| Livestreamed event | Will the event start by 7:40 p.m.? | Official stream or official event record provides a verifiable start time. |
| Campus election | Will candidate/proposition X win? | Official published election results. |
| Public academic calendar | Will finals begin on the scheduled date? | Official calendar; low excitement but clean resolution. |

## Categories to defer

Do not launch these until a trustworthy, public resolution source or formal partner integration exists:

- Dining wait times
- Parking occupancy
- Library occupancy
- Event attendance
- Class cancellations
- Individual professor/student-related questions

Also do not create markets around emergencies, injuries, safety incidents, or other sensitive events.

## Required market schema

Every market should retain data like this:

```ts
type Market = {
  id: string;
  question: string;
  outcomes: string[];
  pointsOnly: true;
  closesAt: string; // ISO timestamp
  resolvesAt?: string;
  sourceName: string;
  sourceUrl: string;
  resolutionRule: string;
  status: 'open' | 'closed' | 'resolved' | 'void';
  resolvedOutcome?: string;
  resolvedAt?: string;
  resolutionEvidenceUrl?: string;
  resolutionEvidenceSnapshot?: unknown;
  resolutionNote?: string;
};
```

If an official source cannot provide usable evidence, set the market to `void` and return virtual points. Never guess a result.

## Recommended build order

1. **Athletics:** use the volleyball pilot to validate onboarding, market closing, and resolution evidence.
2. **Weather:** add a daily high-temperature market using one NWS station.
3. **Transit:** build one point-in-time arrival market for a single route and stop.
4. **Trust layer:** add source cards, resolution logs, and a probability-over-time chart to every completed market.
5. **Partner data:** only then explore dining, parking, attendance, or library occupancy.

## Pitch language

Use this wording:

> Campus Call turns public campus signals and community knowledge into transparent forecasts students can use.

Avoid calling the product a sportsbook or betting app. Emphasize virtual points, public sources, explicit rules, and auditable resolution.

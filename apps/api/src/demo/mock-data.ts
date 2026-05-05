// Realistic fake data used when DEMO_MODE=true

export const DEMO_CANDIDATES = [
  { name: "Sarah Mitchell", title: "ICU Registered Nurse", location: "Dallas, TX", email: "sarah.mitchell@example.com", phone: "+12145550101", score: 94, status: "booked", source: "linkedin" },
  { name: "James Okafor", title: "RN – Cardiac Care Unit", location: "Fort Worth, TX", email: "james.okafor@example.com", phone: "+12145550102", score: 91, status: "replied", source: "indeed" },
  { name: "Priya Nair", title: "Travel Nurse – ICU", location: "Irving, TX", email: "priya.nair@example.com", phone: "+12145550103", score: 88, status: "replied", source: "linkedin" },
  { name: "Marcus Thompson", title: "Critical Care RN", location: "Plano, TX", email: "marcus.t@example.com", phone: "+12145550104", score: 85, status: "sent", source: "linkedin" },
  { name: "Elena Vasquez", title: "RN – Emergency & Trauma", location: "Garland, TX", email: "elena.v@example.com", phone: "+12145550105", score: 83, status: "sent", source: "indeed" },
  { name: "David Kim", title: "Registered Nurse – SICU", location: "Arlington, TX", email: "david.kim@example.com", phone: "+12145550106", score: 80, status: "sent", source: "linkedin" },
  { name: "Amara Osei", title: "Float Pool RN – ICU/CCU", location: "Mesquite, TX", email: "amara.o@example.com", phone: "+12145550107", score: 79, status: "personalized", source: "linkedin" },
  { name: "Tyler Nguyen", title: "Neurocritical Care RN", location: "Dallas, TX", email: "tyler.n@example.com", phone: "+12145550108", score: 77, status: "personalized", source: "indeed" },
  { name: "Rachel Foster", title: "RN – Cardiovascular ICU", location: "Richardson, TX", email: "rachel.f@example.com", phone: "+12145550109", score: 76, status: "qualified", source: "linkedin" },
  { name: "Isaiah Brown", title: "Registered Nurse – MICU", location: "Frisco, TX", email: "isaiah.b@example.com", phone: "+12145550110", score: 74, status: "qualified", source: "linkedin" },
  { name: "Olivia Chen", title: "ICU RN – Level I Trauma", location: "McKinney, TX", email: "olivia.c@example.com", phone: "+12145550111", score: 72, status: "qualified", source: "indeed" },
  { name: "Noah Patterson", title: "Critical Care Nurse", location: "Denton, TX", email: "noah.p@example.com", phone: "+12145550112", score: 71, status: "qualified", source: "linkedin" },
  { name: "Fatima Al-Hassan", title: "RN – Surgical ICU", location: "Carrollton, TX", email: "fatima.a@example.com", phone: "+12145550113", score: 70, status: "qualified", source: "linkedin" },
  { name: "Christopher Reyes", title: "RN – Burns & Trauma ICU", location: "Grand Prairie, TX", email: "chris.r@example.com", phone: "+12145550114", score: 68, status: "enriched", source: "indeed" },
  { name: "Natalie Warren", title: "Registered Nurse – NICU", location: "Lewisville, TX", email: "natalie.w@example.com", phone: "+12145550115", score: 65, status: "enriched", source: "linkedin" },
  { name: "Brandon Scott", title: "Staff RN – Oncology ICU", location: "Allen, TX", email: "brandon.s@example.com", phone: "+12145550116", score: 62, status: "enriched", source: "indeed" },
  { name: "Jasmine Carter", title: "RN – Pediatric ICU", location: "Flower Mound, TX", email: "jasmine.c@example.com", phone: "+12145550117", score: null, status: "disqualified", source: "linkedin" },
  { name: "Kevin Walsh", title: "Registered Nurse – Med/Surg", location: "Mansfield, TX", email: "kevin.w@example.com", phone: "+12145550118", score: null, status: "disqualified", source: "indeed" },
  { name: "Aisha Kamara", title: "RN – Stepdown Unit", location: "Euless, TX", email: "aisha.k@example.com", phone: "+12145550119", score: null, status: "sourced", source: "linkedin" },
  { name: "Derek Patel", title: "Travel RN – ICU", location: "Bedford, TX", email: "derek.p@example.com", phone: "+12145550120", score: null, status: "sourced", source: "indeed" },
  { name: "Monica Liu", title: "RN – Trauma ICU", location: "Hurst, TX", email: "monica.l@example.com", phone: "+12145550121", score: null, status: "sourced", source: "linkedin" },
  { name: "Antoine Jackson", title: "Registered Nurse – CCU", location: "Grapevine, TX", email: "antoine.j@example.com", phone: "+12145550122", score: null, status: "sourced", source: "linkedin" },
  { name: "Sophia Martinez", title: "ICU Float RN", location: "Colleyville, TX", email: "sophia.m@example.com", phone: "+12145550123", score: null, status: "sourced", source: "indeed" },
  { name: "Ryan O'Brien", title: "Critical Care RN – SICU", location: "Southlake, TX", email: "ryan.o@example.com", phone: "+12145550124", score: null, status: "sourced", source: "linkedin" },
  { name: "Destiny Williams", title: "RN – Neonatal ICU", location: "Keller, TX", email: "destiny.w@example.com", phone: "+12145550125", score: null, status: "sourced", source: "indeed" },
];

export const DEMO_CAMPAIGN = {
  name: "Senior RN — Dallas ICU Network",
  status: "active",
  sourcingSpec: "ICU Registered Nurses with 3+ years critical care experience in the Dallas–Fort Worth metro area. BSN required, CCRN preferred.",
  irpPrompt: `You are scoring candidates for an ICU Registered Nurse role in Dallas, TX.
Score the candidate 0-100 based on:
- Active RN license in Texas (required, disqualify if absent)
- ICU or critical care experience (3+ years preferred)
- BSN degree (required) / MSN (bonus)
- CCRN certification (strong positive signal)
- Proximity to Dallas metro
- History of stable employment (< 3 jobs in 5 years preferred)`,
  threshold: 70,
  channels: ["sms", "email"],
  cadenceTemplate: "5-touch",
};

export const DEMO_MESSAGES: { candidateName: string; messages: { direction: "inbound" | "outbound"; channel: "sms" | "email"; body: string }[] }[] = [
  {
    candidateName: "Sarah Mitchell",
    messages: [
      { direction: "outbound", channel: "sms", body: "Hi Sarah! I came across your profile and your ICU experience at Baylor is exactly what we're looking for. We have a critical care opportunity in Dallas with excellent pay and flexibility. Worth a quick 10-min chat? — Mike, Headhunter Academy" },
      { direction: "inbound", channel: "sms", body: "Hi Mike, yes I'd be interested! I'm currently at Presbyterian but open to hearing more. What's the role?" },
      { direction: "outbound", channel: "sms", body: "Great Sarah! It's a full-time ICU RN position, $48–54/hr + sign-on bonus. We have slots this week. I'll send you a calendar link — does Thursday or Friday work?" },
      { direction: "inbound", channel: "sms", body: "Thursday afternoon works for me! Looking forward to it." },
    ],
  },
  {
    candidateName: "James Okafor",
    messages: [
      { direction: "outbound", channel: "email", body: "Hi James,\n\nYour cardiac ICU background caught my attention — we're placing a Critical Care RN with a top-tier Dallas health system, $50–56/hr and strong benefits.\n\nWould you be open to a brief call this week?\n\nBest,\nMike" },
      { direction: "inbound", channel: "email", body: "Hi Mike, thanks for reaching out. I'm actually considering a move — can you share more about the facility? Is it a Magnet hospital?" },
      { direction: "outbound", channel: "email", body: "Great question James — yes, it's a Magnet-designated facility ranked top 10 in Texas. I'll send the full JD. What's the best time to connect?" },
    ],
  },
  {
    candidateName: "Priya Nair",
    messages: [
      { direction: "outbound", channel: "sms", body: "Hi Priya! Travel nurses with your ICU background are in high demand right now. We have a permanent role in Dallas — better stability, great comp. Interested? — Mike, HHA" },
      { direction: "inbound", channel: "sms", body: "Depends on the package honestly. What's the base?" },
      { direction: "outbound", channel: "sms", body: "Base is $51/hr + $8k sign-on + relocation. Full benefits day 1. Want me to schedule a call?" },
    ],
  },
];

export const DEMO_SCORE_REASONING: Record<string, string> = {
  high: "Strong match: Active Texas RN license confirmed, 6 years ICU experience (4 in CICU), BSN from UT Southwestern, CCRN certified, currently employed at a Dallas-area facility. Stable employment history. Exceeds all minimum criteria.",
  mid: "Good match: Active Texas RN license, 3 years critical care experience, BSN confirmed. No CCRN certification but eligible to sit for exam. Minor commute from current location (28 miles). Meets threshold.",
  low: "Borderline: RN license active but in a step-down rather than true ICU setting. 2 years experience falls short of 3-year minimum. BSN confirmed. Scores below threshold — flagged for manual review.",
};

// ─── Additional campaigns to populate the demo ────────────────────────────────

export const DEMO_CAMPAIGN_TRAVEL = {
  name: "Travel Nurses — Pacific Northwest",
  status: "active",
  sourcingSpec: "Travel RNs willing to take 13-week assignments in WA/OR. Med-Surg or Tele preferred. Must have 2+ years acute care experience.",
  irpPrompt: `Score travel-nurse candidates for Pacific Northwest (WA/OR) assignments.
- Active multi-state compact RN license (required)
- 2+ years acute care, ideally Med-Surg or Tele
- Open to 13-week contracts with extension option
- Comfortable with EPIC EMR
- Vaccination records on file
- Tenure stability is less critical (travel role)`,
  threshold: 65,
  channels: ["sms", "email"],
  cadenceTemplate: "3-touch",
};

export const DEMO_CANDIDATES_TRAVEL = [
  { name: "Hannah Brooks", title: "Travel RN — Med/Surg", location: "Seattle, WA", email: "hannah.b@example.com", phone: "+12065550201", score: 92, status: "booked", source: "linkedin" },
  { name: "Liam Rodriguez", title: "Travel RN — Tele", location: "Portland, OR", email: "liam.r@example.com", phone: "+15035550202", score: 89, status: "replied", source: "indeed" },
  { name: "Mei Tanaka", title: "Travel RN — Stepdown", location: "Bellevue, WA", email: "mei.t@example.com", phone: "+14255550203", score: 86, status: "replied", source: "linkedin" },
  { name: "Caleb Iverson", title: "Travel RN — Med/Surg", location: "Tacoma, WA", email: "caleb.i@example.com", phone: "+12535550204", score: 81, status: "sent", source: "indeed" },
  { name: "Zara Patel", title: "Travel RN — Tele", location: "Beaverton, OR", email: "zara.p@example.com", phone: "+15035550205", score: 78, status: "sent", source: "linkedin" },
  { name: "Thomas Reilly", title: "Travel RN — Med/Surg", location: "Eugene, OR", email: "thomas.r@example.com", phone: "+15415550206", score: 75, status: "personalized", source: "linkedin" },
  { name: "Aaliyah Brooks", title: "Travel RN — Cardiac", location: "Spokane, WA", email: "aaliyah.b@example.com", phone: "+15095550207", score: 73, status: "qualified", source: "indeed" },
  { name: "Diego Morales", title: "Travel RN — Ortho", location: "Vancouver, WA", email: "diego.m@example.com", phone: "+13605550208", score: 70, status: "qualified", source: "linkedin" },
  { name: "Grace Park", title: "Travel RN", location: "Salem, OR", email: "grace.p@example.com", phone: "+15035550209", score: null, status: "enriched", source: "linkedin" },
  { name: "Owen Schmidt", title: "Travel RN — Med/Surg", location: "Bend, OR", email: "owen.s@example.com", phone: "+15415550210", score: null, status: "sourced", source: "indeed" },
  { name: "Lila Nguyen", title: "Travel RN — Tele", location: "Olympia, WA", email: "lila.n@example.com", phone: "+13605550211", score: null, status: "sourced", source: "linkedin" },
  { name: "Marcus Webb", title: "Travel RN — Acute", location: "Hillsboro, OR", email: "marcus.w@example.com", phone: "+15035550212", score: null, status: "disqualified", source: "indeed" },
];

export const DEMO_CAMPAIGN_SWE = {
  name: "Senior Backend Engineers — Austin",
  status: "active",
  sourcingSpec: "Senior software engineers (5+ yrs) with Go or Rust backend experience in the Austin metro. Distributed systems background preferred. Open to hybrid (3 days in-office).",
  irpPrompt: `Score senior backend engineer candidates for an Austin, TX role.
- 5+ years backend (Go or Rust strongly preferred)
- Distributed-systems exposure (Kafka, Postgres at scale, observability)
- Currently in Austin metro OR willing to relocate
- Hybrid 3 days/week tolerable
- Compensation expectation $180K–$240K base
- No more than 4 jobs in last 8 years (stability proxy)`,
  threshold: 75,
  channels: ["email", "sms"],
  cadenceTemplate: "5-touch",
};

export const DEMO_CANDIDATES_SWE = [
  { name: "Adrian Cole", title: "Staff Engineer — Backend", location: "Austin, TX", email: "adrian.c@example.com", phone: "+15125550301", score: 95, status: "booked", source: "linkedin" },
  { name: "Sienna Wang", title: "Senior SWE — Distributed Systems", location: "Round Rock, TX", email: "sienna.w@example.com", phone: "+15125550302", score: 91, status: "replied", source: "linkedin" },
  { name: "Jordan Pak", title: "Senior Backend Engineer", location: "Cedar Park, TX", email: "jordan.p@example.com", phone: "+15125550303", score: 88, status: "replied", source: "indeed" },
  { name: "Kofi Ahmed", title: "Principal Engineer (Go)", location: "Austin, TX", email: "kofi.a@example.com", phone: "+15125550304", score: 85, status: "sent", source: "linkedin" },
  { name: "Renee Albright", title: "Senior SWE — Rust", location: "Pflugerville, TX", email: "renee.a@example.com", phone: "+15125550305", score: 82, status: "sent", source: "linkedin" },
  { name: "Hugo Beltran", title: "Sr Software Engineer", location: "Lakeway, TX", email: "hugo.b@example.com", phone: "+15125550306", score: 78, status: "personalized", source: "indeed" },
  { name: "Maya Sundaram", title: "Senior Backend Engineer", location: "Bee Cave, TX", email: "maya.s@example.com", phone: "+15125550307", score: 76, status: "qualified", source: "linkedin" },
  { name: "Sam O'Donnell", title: "Backend Engineer (Go)", location: "Austin, TX", email: "sam.o@example.com", phone: "+15125550308", score: null, status: "enriched", source: "indeed" },
  { name: "Leah Martin", title: "Senior Engineer", location: "Manor, TX", email: "leah.m@example.com", phone: "+15125550309", score: null, status: "sourced", source: "linkedin" },
  { name: "Ravi Sharma", title: "SWE", location: "Buda, TX", email: "ravi.s@example.com", phone: "+15125550310", score: null, status: "disqualified", source: "indeed" },
];

export const DEMO_CAMPAIGN_SALES = {
  name: "Enterprise Account Executives — Northeast",
  status: "paused",
  sourcingSpec: "Enterprise AEs with $1M+ ARR closed last 12 months in SaaS. NYC, Boston, or Philly. 4+ years AE experience.",
  irpPrompt: `Score enterprise AE candidates for a SaaS sales role in the Northeast.
- 4+ years enterprise AE experience in SaaS
- Closed $1M+ ARR in trailing 12 months (verify with W2 or quota attainment)
- Currently in NYC, Boston, or Philly metro
- Strong outbound discipline + MEDDIC familiarity
- President's Club or Top Quartile achievement is a plus
- Tenure: average 2+ years per role`,
  threshold: 78,
  channels: ["email"],
  cadenceTemplate: "hyper-personalized",
};

export const DEMO_CANDIDATES_SALES = [
  { name: "Vanessa Hill", title: "Enterprise AE", location: "New York, NY", email: "vanessa.h@example.com", phone: "+12125550401", score: 96, status: "booked", source: "linkedin" },
  { name: "Edward Kowalski", title: "Senior Enterprise AE", location: "Boston, MA", email: "edward.k@example.com", phone: "+16175550402", score: 92, status: "replied", source: "linkedin" },
  { name: "Nia Adebayo", title: "Strategic Account Executive", location: "Philadelphia, PA", email: "nia.a@example.com", phone: "+12155550403", score: 88, status: "sent", source: "indeed" },
  { name: "Gabriel Russo", title: "Enterprise AE — Mid-Market", location: "Brooklyn, NY", email: "gabriel.r@example.com", phone: "+13475550404", score: 84, status: "personalized", source: "linkedin" },
  { name: "Brielle Sanders", title: "Enterprise AE", location: "Cambridge, MA", email: "brielle.s@example.com", phone: "+16175550405", score: 80, status: "qualified", source: "linkedin" },
  { name: "Tariq Malik", title: "Enterprise AE", location: "Jersey City, NJ", email: "tariq.m@example.com", phone: "+12015550406", score: null, status: "enriched", source: "indeed" },
  { name: "Phoebe Yates", title: "Account Executive", location: "Newton, MA", email: "phoebe.y@example.com", phone: "+16175550407", score: null, status: "sourced", source: "linkedin" },
];

export const DEMO_CAMPAIGN_SDR = {
  name: "SDR Hiring — Atlanta Region",
  status: "draft",
  sourcingSpec: "Sales Development Reps with 1-2 years SaaS outbound experience. Atlanta metro. Comfortable with cold calling 60+ dials/day.",
  irpPrompt: `Score SDR candidates for an Atlanta, GA hire.
- 1-2 years SaaS outbound SDR experience
- Comfortable with cold-calling cadence of 60+ dials/day
- Currently in Atlanta metro (no relo in scope)
- Familiar with Salesloft / Outreach.io
- Quota attainment: 90%+ in last 2 quarters`,
  threshold: 60,
  channels: ["sms", "email"],
  cadenceTemplate: "3-touch",
};

export const DEMO_CANDIDATES_SDR = [
  { name: "Trent Mosley", title: "SDR", location: "Atlanta, GA", email: "trent.m@example.com", phone: "+14045550501", score: 78, status: "qualified", source: "linkedin" },
  { name: "Camille Doré", title: "Outbound SDR", location: "Decatur, GA", email: "camille.d@example.com", phone: "+14045550502", score: 72, status: "qualified", source: "indeed" },
  { name: "Jaxon Kim", title: "SDR — SaaS", location: "Marietta, GA", email: "jaxon.k@example.com", phone: "+14045550503", score: null, status: "sourced", source: "linkedin" },
  { name: "Iris Evangelista", title: "Sales Development Rep", location: "Smyrna, GA", email: "iris.e@example.com", phone: "+14045550504", score: null, status: "sourced", source: "indeed" },
  { name: "Reggie Hawthorne", title: "SDR (Outbound)", location: "Sandy Springs, GA", email: "reggie.h@example.com", phone: "+14045550505", score: null, status: "sourced", source: "linkedin" },
];

export const DEMO_MESSAGES_EXTRA: { candidateName: string; messages: { direction: "inbound" | "outbound"; channel: "sms" | "email"; body: string }[] }[] = [
  {
    candidateName: "Adrian Cole",
    messages: [
      { direction: "outbound", channel: "email", body: "Hi Adrian — your work on distributed systems at Datadog caught our attention. We have a Staff Engineer role in Austin with deep autonomy on platform architecture. Open to a 20-min chat?" },
      { direction: "inbound", channel: "email", body: "Sure, happy to chat. Comp range and remote flexibility?" },
      { direction: "outbound", channel: "email", body: "$220K base + meaningful equity, hybrid 3 days/week. Sending a Calendly link now — Tue or Wed afternoon work?" },
      { direction: "inbound", channel: "email", body: "Tuesday 3pm CT works. Looking forward to it." },
    ],
  },
  {
    candidateName: "Vanessa Hill",
    messages: [
      { direction: "outbound", channel: "email", body: "Vanessa — Top Quartile in '24 at MongoDB caught my eye. We're filling a Senior Enterprise role with $1.2M quota and a generous accelerator. Worth 15 minutes?" },
      { direction: "inbound", channel: "email", body: "Definitely interested. What's the territory and OTE?" },
      { direction: "outbound", channel: "email", body: "Northeast strategic accounts (Fortune 1000), OTE $380K with uncapped commissions. Sending a calendar invite for Thursday." },
      { direction: "inbound", channel: "email", body: "Booked. Thanks!" },
    ],
  },
  {
    candidateName: "Hannah Brooks",
    messages: [
      { direction: "outbound", channel: "sms", body: "Hi Hannah! 13-week Med/Surg contract in Seattle starting next month, $2,800/wk net + housing stipend. Interested? — Mike, HHA" },
      { direction: "inbound", channel: "sms", body: "Yes! What's the shift schedule?" },
      { direction: "outbound", channel: "sms", body: "3x12s, day shift, weekends rotating. Block scheduling available. Want me to send the full assignment doc?" },
      { direction: "inbound", channel: "sms", body: "Please do. And let's set up a call." },
    ],
  },
];

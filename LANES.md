# Lanes — requirement first

Every lane here has a payer who **already posted the requirement and committed the money**. No lane needs signups or customer-finding. Scored against the eight tests in `CHARTER.md`. Last hunted 2026-09-24.

Sources are public search results. Venue terms pages for `0din.ai` and several others were blocked by this environment's network policy, so those gates are marked **open**.

---

## Open — build against these

### 1. 0DIN GenAI bug bounty (Mozilla) — **recommended**

| | |
| --- | --- |
| Payer | Mozilla's 0DIN program, on behalf of model vendors |
| Requirement | Posted scope: guardrail jailbreaks, prompt injection, training-data leakage, OWASP LLM Top 10 against in-scope models |
| Money | Published table, **per valid report**: Low ≤ $500, Medium ≤ $2,500, High ≤ $5,000, Severe ≤ $15,000 |
| Deadline | Standing program |
| Eligibility | Age of majority; not on US sanctions lists. India eligible |
| Rail | Paid within 30 days of agreement; government ID + IRS W-8 required |
| What Taskman builds | A red-team harness that runs attack families against in-scope models, keeps only reproducible breaks, and drafts the report |
| Saturation | 2,700+ researchers. Crowded, but it pays per valid finding, not winner-take-all |
| Registry | Novel. Not a rename of any killed lane |
| **Open gates** | Read `0din.ai/policy` and `0din.ai/scope`: is automated testing allowed, and which models are in scope. **Build nothing until this is read.** |

Why first: open today, no deadline, pays per output, reaches India, and fits what Taskman already has (LLM routing, disclosure discipline, false-positive refusal).

### 2. huntr (AI/ML open-source bounties) — already ACTIVE in Taskman

| | |
| --- | --- |
| Requirement | Posted list of in-scope AI/ML OSS repositories |
| Money | Per valid vulnerability, published bounty ranges |
| Rail | Stripe Connect Express (reaches most countries) |
| What Taskman builds | Its existing static detectors, pointed at huntr's in-scope repos |
| Note | Taskman's profile is verified. Listed here because it passes every test; the work is Taskman's `oss-vuln-sweep`, not new |

---

## Watch — requirement posted each cycle, current round closed

### 3. RBI HaRBInger (next edition)

- **Payer:** Reserve Bank of India. **Requirement:** published problem statements (2025 edition: tokenised KYC, offline CBDC, enhancing trust).
- **Money:** ₹40 lakh winner and ₹20 lakh runner-up per statement. **₹5 lakh prototype funding to every shortlisted team**, paid before winning.
- **Eligibility:** individuals 18+, teams, entities. Global.
- **Cycle:** 2025 edition launched 23 Oct 2025, registration closed 15 Nov 2025. Next call expected Q4 2026. Unconfirmed.
- **Fit:** fraud and trust themes match Taskman's DETECT and reconciliation engine.

### 4. IndiaAI Innovation Challenge

- **Payer:** IndiaAI Mission with line ministries (2026: MSME, AYUSH). **Money:** ₹25 lakh Stage-2 funding per shortlisted team; up to ₹1 crore two-year government contract.
- **Blocker:** the 2026 round wanted market-deployed solutions, not prototypes. Watch for a round Taskman's assets fit.

### 5. iDEX (defence)

- **Payer:** Ministry of Defence. **Money:** grants up to ₹1.5 crore. Individual innovators eligible.
- **State:** DISC 14 (82 problem statements) closed 4 May 2026. The Open Challenge closes **30 Sep 2026** but has no posted problem statement, so it fails test 1. Watch for DISC 15.

---

## Weak — passes the tests, poor fit

### 6. Web3 audit contests (Code4rena, Sherlock, Cantina)

- Posted codebases, escrowed pools of $100K–$2M, paid **per unique valid finding** by severity.
- Weak because Taskman's detectors target Node.js, not Solidity (a large build), the field is swarmed with AI-assisted auditors, and payouts are mostly USDC (Indian VDA tax applies).

### 7. Gray Swan Arena

- Recurring red-teaming challenges; part of each pool is paid per break, plus first-break bounties; $100 minimum payout.
- Weak because the rules **prohibit automated submission**: each break is crafted and submitted by hand. That is operator labour, not a build.

---

## Killed at the hunt

| Lane | Why |
| --- | --- |
| Kaggle ARC Prize 2026 | Swarmed winner-take-all: 2,000+ teams |
| Seller reimbursement (Taskman lane 4) | Product-first, and a free Indian incumbent (Robnu) already serves small sellers |
| DPDP compliance kit (Taskman lane 8) | Product-first, and at least 6 Indian tools exist, one with a free plan |
| Anything in Taskman's registry marked KILLED | Stays killed: github-bounty-hunt, algora (+ issuehunt, polar), agent-economy, taskforce-moltjobs, vibe-app-security |

## Sources

- 0DIN: https://0din.ai/marketing/bug_bounty · https://0din.ai/policy · https://hacks.mozilla.org/2024/08/0din-a-genai-bug-bounty-program-securing-tomorrows-ai-together/
- Gray Swan: https://app.grayswan.ai/arena/about · https://app.grayswan.ai/arena/challenge/agent-red-teaming?panel=rules
- HaRBInger: https://www.newsonair.gov.in/rbi-launches-global-hackathon-harbinger-2025-to-foster-secure-inclusive-banking-solutions · https://www.outlookmoney.com/banking/rbi-launches-global-hackathon-harbinger-2025-to-boost-secure-banking-innovation
- IndiaAI: https://www.indiaai.gov.in/article/indiaai-innovation-challenge-2026 · https://www.karmasandhan.com/indiaai-innovation-challenge-2026/
- iDEX: https://idex.gov.in/challenges · https://startupgrantshub.com/opportunities/defence-india-startup-challenge-disc-14/ · https://www.startupgrantsindia.com/idex-open-challenge
- Audit contests: https://docs.code4rena.com/competitions · https://smartcontractshacking.com/tools/web3-auditing-competitions-and-bug-bounties
- Kaggle: https://www.kaggle.com/competitions/arc-prize-2026-arc-agi-2

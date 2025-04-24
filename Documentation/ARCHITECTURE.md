---
title: "System Architecture"
author: "ParadisePortfolios Team"
date: "2025-04-23"
format:
  html:
    toc: true
    toc-depth: 3
---

This section covers the overall architecture that powers Paradise Portfolios’ AI-driven travel-marketing platform.  
It reflects the project goals (chatbot, video generation, seamless affiliate booking) and constraints outlined in the Preliminary Design Report.

```plaintext
 ┌────────────────────────────────────────────────────────────┐
 │                    Browser / Client                        │
 │  • React-based pages (Destinations, Blog, Trip Planner)    │
 │  • Fetch → /api/chat, /api/book, /api/videos               │
 └───────────────┬────────────────────────────────────────────┘
                 │  HTTPS (JSON + static assets)
                 ▼
 ┌───────────────────────────────────────────────────────────┐
 │            Express Server  (Node.js, server.js)           │
 │  • Serves static HTML/CSS/JS from /public                 │
 │  • REST endpoints:                                        │
 │        POST /api/chat    → Chat Controller                │
 │        GET  /api/videos  → Video Catalog                  │
 │        POST /api/book    → Booking Gateway                │
 │  • Reads .env for API keys & affiliate ID                 │
 └───────────────┬──────────────┬────────────────────────────┘
                 │              ├───────────────┐
     OpenAI SDK  │              │ HTTPS         │  Sandals Affiliate Link
                 ▼              ▼               ▼ (Travel Advisor Referral)
 ┌──────────────────────────┐   ┌────────────────────────────┐
 │  Chatbot Service         │   │  Booking Gateway           │
 │  (GPT-4o Mini, fine-tune)│   │  • Redirects to Sandals    │
 │  • Hotel Q&A, itinerary  │   │    w/ ?referral=138577     │
 │                          │   │  • Captures click analytics|
 └──────────────────────────┘   └────────────────────────────┘
                 │
                 │ prompts / responses
                 ▼
 ┌────────────────────────────────────────────────────────────┐
 │      AI Video Pipeline  (Python Workers)                   │
 │  • Script → images (Sandals/Beaches) → MiniMax → MP4       │
 │  • HailuoAI animates stills ; voice-over via OpenAI TTS    │
 │  • Stores finished videos in /assets/videos                │
 └────────────────────────────────────────────────────────────┘
```

## 1. Browser / Client  
* React pages (`Destinations`, `Blog`, `Trip Planner`) render content and embed MP4s created by the AI pipeline.  
* Front-end scripts handle map widgets, lazy-loading, theme toggling (light and dark) and fetch requests to the Express API.  
* All chat, booking, and video-catalog requests flow through HTTPS to `/api/*`, keeping analytics and security centralized.
---

## 2. Express Server (Node + Express)  
(`chatbot-backend/server.js`) serves both static assets and JSON APIs.

| Route            | Verb | Purpose                                                                        |
|------------------|------|--------------------------------------------------------------------------------|
| `/api/chat`      | POST | Validate prompt → OpenAI → return reply                                        |
| `/api/videos`    | GET  | List video metadata (title, destination, URL)                                  |
| `/api/book`      | POST | Assemble Sandals referral URL & log click (PCI DSS-ready) |

Environment variables deliver `OPENAI_API_KEY`, MiniMax keys and the referal code used throughout the site.  

---

## 3. Chatbot Service  
* Fine-tuned **GPT-4o Mini** answers travel questions and recommends resorts, budgets and activities to the end user.
* Stateless design: no personally identifiable information is stored, satisfying privacy requirements.
---

## 4. AI Video Pipeline  
* Python workers: **script → curated images → MiniMax** animation → OpenAI TTS overlay.  
* Generates BOTH horizontal and vertical MP4s in ≈ 2 minutes per destination, enabling high-volume marketing reels for short form content on (Tiktok/Instagram Reels/Youtube Shorts) regardless of desired format. 
* Completed videos are versioned in `/assets/videos/` and surfaced through `/api/videos`.
---

## 5. Booking Gateway  
* Constructs a Sandals Travel Advisor URL with the team’s affiliate ID, then redirects the user to Sandals.com for their desired location.  
* Future roadmap: add tokenized payment and reservation confirmation once direct booking is enabled.
---

## 6. Deployment & Scaling Boundaries  

| Layer          | Technology         | Scaling Strategy                                   |
|----------------|--------------------|----------------------------------------------------|
| Static assets  | Cloud CDN          | Edge caching, immutable filenames                  |
| Express API    | Node.JS   | Horizontal auto-scaling on CPU / latency           |
| Video workers  | Serverless batch   | Fire on queue events; parallel fan-out             |
| Chat requests  | OpenAI cloud       | External elastic scaling                           |

The solution remains file-backed. The website is lightweight as well as the video generator. The budget for our project was $1000, yet with our prototype totaling ~$200 in costs, we can still expect to see horizontal and vertical scaling at very low costs with services like GoDaddy and AmazonWebServices. 
---

## 7. Security & Compliance  
* TLS 1.3 everywhere; HSTS on the CDN.  
* No PII storage; all sensitive data remains with upstream providers.  
* PCI DSS controls wrap any booking-related traffic  
* Content moderation and transparent affiliate disclosures mitigate ethical and regulatory risks
---

### Traceability Matrix

| Requirement (PDR)                                         | Architectural Element                              |
|-----------------------------------------------------------|---------------------------------------------------|
| AI chatbot for personalized hotel suggestions | `/api/chat` + Chatbot Service                      |
| AI-generated destination videos          | AI Video Pipeline + `/api/videos`                  |
| Direct Sandals booking with referral link   | Booking Gateway                                   |
| Low-cost, scalable platform                | NodeJS -> Express.JS, serverless workers, CDN       |
| ISO 27001 / PCI DSS             | TLS, env-vars, no PII storage                     |

This architecture not only fulfills, but exceeds every functional, cost and compliance goal in the Preliminary Design Report while leaving clear hooks for future enhancements (payments, fully-automated video embedding and advanced analytics, etc.).

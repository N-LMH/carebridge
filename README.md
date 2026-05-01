# CareBridge / 医路桥

CareBridge is a healthcare triage and visit-preparation assistant built for hackathon delivery. It helps patients describe symptoms clearly, receive conservative next-step guidance, and generate a doctor-ready handoff before reaching formal care.

`医路桥` 不是替代医生诊断的工具，而是把医疗支持前移：帮助患者更早判断风险、更完整整理病情，并在正式就医前完成高质量准备。

![CareBridge home](./doc/screenshots/home.png)

## Product Value

Patients in rural, county, or underserved settings often struggle before diagnosis begins:

- They do not know whether symptoms are urgent.
- They are unsure which department to visit.
- They cannot explain symptoms clearly under pressure.
- Family members lack a shared record of symptom changes.
- Doctors lose time reconstructing fragmented information.

CareBridge focuses on the handoff between symptom uncertainty and real medical care.

## Product Highlights

- Guided patient intake with bilingual symptom support.
- Dynamic follow-up questions only when missing context changes risk.
- Four-level triage output with explicit next-step guidance.
- Doctor-ready visit summary for copy, print, or handoff.
- Follow-up logging for symptom progression.
- Recent-case sidebar for revisiting prior sessions.
- Clear medical safety boundaries throughout the interface.

## Screens

### Intake workspace

![CareBridge intake](./doc/screenshots/home.png)

### Triage result and visit summary

![CareBridge triage result](./doc/screenshots/triage-result.png)

### Follow-up logging

![CareBridge follow-up](./doc/screenshots/follow-up.png)

## Tech Stack

- Frontend: `Vue 3`, `Vite`, `Pinia`, `Vue Router`, TypeScript
- Backend: `Node.js` + `Express`
- Persistence: local JSON storage in `data/`
- Testing: `Vitest`, `Supertest`, `Playwright`
- Delivery assets: generated screenshots and PDF deck

## Getting Started

Install dependencies:

```bash
npm install
```

Build the production client and start the server:

```bash
npm run build
npm start
```

Open:

```text
http://127.0.0.1:4173
```

## Development

For frontend iteration, run the API and Vite dev server in two terminals:

```bash
npm run dev
npm run dev:client
```

Open:

```text
http://127.0.0.1:5173
```

## Verification

```bash
npm run type-check
npm run build
npm run test:coverage
npm run test:e2e
npm test
```

Regenerate submission assets:

```bash
npm run capture:screenshots
npm run build:pdf
```

## Demo Flow

1. Enter patient profile, symptoms, duration, and severity.
2. Answer targeted follow-up questions for missing risk signals.
3. Review risk level, reasoning, department suggestion, and immediate steps.
4. Open the doctor-facing handoff summary.
5. Save a follow-up record after observing symptom changes.
6. Revisit prior sessions from the recent-case sidebar.

## Safety Boundaries

- CareBridge does not provide final medical diagnosis.
- It does not replace licensed clinicians.
- Red-flag symptoms are escalated conservatively.
- Outputs are for pre-visit guidance and doctor handoff only.
- The MVP stores sessions locally in `data/`.

## Repository Structure

```text
.
├── client
│   └── src
│       ├── components
│       ├── stores
│       ├── services
│       └── views
├── doc
│   ├── CareBridge-Hackathon-Deck.pdf
│   ├── 产品设计.md
│   ├── PPT大纲.md
│   ├── 视频脚本.md
│   ├── 提交清单.md
│   └── screenshots
├── scripts
│   ├── capture-screenshots.mjs
│   └── generate_hackathon_pdf.py
├── src
│   ├── create-app.js
│   ├── storage.js
│   └── triage-engine.js
├── tests
│   ├── api.test.js
│   ├── triage-engine.test.js
│   └── e2e
└── server.js
```

## Documentation

- [中文说明文档](./doc/说明文档-中文.md)
- [English Documentation](./doc/README-English.md)
- [产品设计文档](./doc/产品设计.md)
- [PPT 大纲](./doc/PPT大纲.md)
- [视频脚本](./doc/视频脚本.md)
- [提交清单](./doc/提交清单.md)
- [提交 PDF](./doc/CareBridge-Hackathon-Deck.pdf)

## Hackathon Positioning

CareBridge is designed to score well on practicality, execution, healthcare impact, and responsible product boundaries. The project is a working local MVP with tests, screenshots, PDF materials, and a complete demo path.

Healthcare support should begin before the patient reaches a doctor, not only after.

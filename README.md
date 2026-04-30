# CareBridge / 医路桥

CareBridge is a healthcare triage and visit-preparation assistant built for hackathon delivery. It helps underserved patients describe symptoms clearly, receive safe next-step guidance, and generate a doctor-ready summary before reaching formal care.

`医路桥` 不是一个替代医生诊断的工具，而是一个把医疗支持前移的产品：帮助患者更早判断风险、更完整整理病情、并在正式就医前就完成高质量准备。

![CareBridge home](./doc/screenshots/home.png)

## What It Solves

Patients in rural, county, or underserved settings often face the same early-stage problems:

- They do not know whether symptoms are urgent
- They are unsure which department to visit
- They cannot explain symptoms clearly
- Family members struggle to coordinate medical context
- Doctors lose time reconstructing fragmented information

CareBridge focuses on the moment before diagnosis: the handoff between symptom uncertainty and real medical care.

## Product Highlights

- Guided patient intake with natural-language symptom capture
- Dynamic follow-up questions only when missing information changes risk
- Four-level triage output with explicit next-step guidance
- Doctor-ready visit summary that can be copied, downloaded, or printed
- Follow-up logging for symptom progression
- Recent-case dashboard for revisiting prior sessions
- Accessibility-first interface tuned for healthcare trust and clarity

## Screens

### Intake and caseboard

![CareBridge intake](./doc/screenshots/home.png)

### Triage result and visit summary

![CareBridge triage result](./doc/screenshots/triage-result.png)

### Follow-up logging

![CareBridge follow-up](./doc/screenshots/follow-up.png)

## What Is Built

This repository includes a complete local MVP with:

- An Express API for triage and follow-up workflows
- A polished mobile-friendly frontend
- File-based local persistence for sessions
- Unit, integration, and end-to-end tests
- Product and pitch documentation for hackathon submission

## Tech Stack

- Frontend: vanilla HTML, CSS, and browser-side JavaScript
- Backend: `Node.js` + `Express`
- Persistence: local JSON storage in `data/`
- Testing: `Vitest`, `Supertest`, and `Playwright`

## Getting Started

```bash
npm install
npm start
```

The app runs at:

```text
http://127.0.0.1:4173
```

## Test Commands

```bash
npm run test:coverage
npm run test:e2e
npm test
```

## Demo Flow

The current product flow supports:

1. Patient intake with symptom description and background
2. Targeted follow-up questions for missing risk signals
3. Risk stratification into four action levels
4. Suggested department and immediate care steps
5. Structured visit summary for doctor handoff
6. Follow-up logging and case revisit workflow

## Safety Boundaries

- CareBridge does **not** provide final medical diagnosis
- It does **not** replace licensed clinicians
- Red-flag symptoms are escalated conservatively
- All outputs are for pre-visit guidance and doctor handoff only

## Repository Structure

```text
.
├── README.md
├── package.json
├── server.js
├── public
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── logo.svg
├── src
│   ├── create-app.js
│   ├── storage.js
│   └── triage-engine.js
├── tests
│   ├── api.test.js
│   ├── triage-engine.test.js
│   └── e2e
│       └── carebridge.spec.js
└── doc
    ├── 产品设计.md
    ├── PPT大纲.md
    ├── 视频脚本.md
    ├── 提交清单.md
    └── screenshots
```

## Documentation

- [产品设计文档](./doc/产品设计.md)
- [PPT 大纲](./doc/PPT大纲.md)
- [视频脚本](./doc/视频脚本.md)
- [提交清单](./doc/提交清单.md)

## Hackathon Positioning

CareBridge is designed to score well on:

- **Practicality**: clear user problem and realistic workflow
- **Execution**: working product with tested core flow
- **Impact**: healthcare accessibility for underserved patients
- **Responsibility**: explicit medical safety boundaries

## Vision

Healthcare support should begin before the patient reaches a doctor, not only after.


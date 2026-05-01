# CareBridge Documentation

## Project Overview

CareBridge is a pre-visit healthcare triage and visit-preparation assistant. It helps patients organize symptoms, answer targeted follow-up questions, receive conservative next-step guidance, and generate a doctor-ready handoff before formal medical care begins.

CareBridge is not a diagnosis engine and does not replace licensed clinicians. Its purpose is to improve the first step into healthcare: helping patients understand urgency, prepare context, and communicate more clearly.

## Problem

Many patients, especially in rural, county-level, or underserved settings, face uncertainty before they reach a doctor:

- They do not know whether symptoms are urgent.
- They are unsure which department to visit.
- They struggle to explain symptoms clearly under pressure.
- Family members lack a shared record of symptom changes.
- Doctors lose time reconstructing fragmented patient history.

CareBridge focuses on the handoff between symptom uncertainty and real medical care.

## Core Features

- Patient intake: captures age, region, symptoms, duration, severity, chronic conditions, medications, and allergies.
- Dynamic follow-up: asks targeted questions only when missing information affects risk.
- Risk stratification: returns a four-level action recommendation based on symptoms and risk modifiers.
- Department guidance: suggests emergency care, respiratory, cardiology, gastroenterology, general practice, or other relevant care paths.
- Doctor handoff summary: creates a structured summary that can be copied, printed, or shown to a clinician.
- Follow-up logging: records temperature, symptom changes, medications, and notes over time.
- Recent sessions: allows users to revisit previous assessments and follow-up records.

## User Flow

1. Open the application and enter basic patient information.
2. Describe the main symptoms and duration.
3. Click "Start Assessment".
4. Answer follow-up questions if more information is needed.
5. Review the risk level, reasoning, department suggestion, and immediate steps.
6. Open the visit summary tab to get a doctor-facing handoff.
7. Open the follow-up tab to save observation notes after the assessment.

## Risk Levels

CareBridge currently uses four action levels:

- Level 1: Seek emergency care immediately.
- Level 2: Visit offline care within 24 hours.
- Level 3: Schedule a standard outpatient visit.
- Level 4: Observe at home and keep tracking symptoms.

Red-flag symptoms are escalated conservatively. Examples include severe breathing difficulty, chest pain with shortness of breath, or high fever with worsening symptoms.

## Safety Boundaries

- CareBridge is only for pre-visit guidance.
- It cannot replace medical consultation, physical examination, or formal diagnosis.
- Users should seek immediate offline care or emergency support when red flags appear.
- The current MVP stores sessions in local JSON files and should not be used for real sensitive medical records without additional privacy and security work.

## Technical Stack

- Frontend: Vue 3, Vite, Pinia, Vue Router, TypeScript.
- Backend: Node.js and Express.
- Persistence: local JSON files in the `data/` directory.
- Testing: Vitest, Supertest, and Playwright.
- Delivery assets: generated screenshots and a PDF deck.

## Local Setup

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

## Development Mode

For active development, run the backend and Vite frontend server in separate terminals:

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

Regenerate submission screenshots and the PDF deck:

```bash
npm run capture:screenshots
npm run build:pdf
```

## Repository Structure

```text
.
├── client                  Vue frontend application
├── src                     Express backend and triage engine
├── tests                   Unit, API, and end-to-end tests
├── scripts                 Screenshot and PDF generation scripts
├── doc                     Product docs, screenshots, and submission assets
├── server.js               Server entry point
├── package.json            Scripts and dependencies
└── README.md               Project entry documentation
```

## Hackathon Strengths

- Complete delivery: frontend, backend, persistence, tests, screenshots, and documentation.
- Clear healthcare scenario: focuses on the practical pre-visit gap before diagnosis.
- Responsible boundaries: supports preparation and escalation, not replacement of doctors.
- Easy demo: judges can complete the full patient journey in a few minutes.

## Vision

Healthcare support should begin before the patient reaches a doctor, not only after.

# CareBridge / 医路桥

CareBridge is an AI-powered triage and visit preparation assistant designed for patients in grassroots and underserved areas. It helps users organize symptoms, identify risk level, receive practical care guidance, and generate a structured visit summary before seeing a doctor.

`医路桥` 的目标不是替代医生做诊断，而是帮助更多人在进入医疗系统前，更清楚地表达病情、更及时地做出正确就医决策。

## Why This Project

In real healthcare journeys, many patients face the same problems:

- They do not know whether their symptoms are urgent
- They do not know which department to visit
- They cannot describe symptoms clearly
- Family members struggle to coordinate medical information
- Doctors spend time re-collecting fragmented context

CareBridge focuses on this gap before the formal consultation begins.

## Core Value

- Improve healthcare accessibility for underserved users
- Help patients make clearer and safer next-step decisions
- Generate structured symptom summaries for faster consultations
- Reduce communication friction between patients, families, and doctors

## MVP Scope

The first version focuses on:

- Symptom intake through natural language
- Dynamic follow-up questioning
- Risk stratification with safe action guidance
- Suggested department recommendation
- Visit summary generation
- Basic symptom follow-up tracking

The first version does **not** aim to:

- Provide final medical diagnosis
- Replace licensed doctors
- Prescribe medication
- Integrate directly with hospital systems

## Repository Structure

```text
.
├── README.md
├── .gitignore
└── doc
    ├── 产品设计.md
    └── PPT大纲.md
```

## Documentation

- [产品设计文档](./doc/产品设计.md)
- [PPT 大纲](./doc/PPT大纲.md)

## Demo Story

The recommended demo follows one realistic patient journey:

1. A patient in a rural or county area develops fever, cough, and chest discomfort
2. The user enters symptoms into CareBridge
3. The system asks targeted follow-up questions
4. The system returns a risk level and recommended action
5. A structured visit summary is generated for the doctor
6. The user continues follow-up tracking if immediate emergency care is not required

## Suggested Tech Stack

- Frontend: `Next.js` or `React`
- Backend: `Node.js`
- Database: `Supabase` or `Firebase`
- AI capabilities: symptom parsing, clarification prompts, summary generation, safe explanation text

## Hackathon Deliverables

For this hackathon, the project is intended to support:

- GitHub repository with code and documentation
- PPT/PDF presentation
- 5-7 minute product demo video

## Vision

CareBridge is built around a simple belief:

Healthcare support should begin before the hospital visit, not only after the patient reaches a doctor.


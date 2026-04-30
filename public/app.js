const intakeForm = document.querySelector("#intake-form");
const questionsForm = document.querySelector("#questions-form");
const followUpPanel = document.querySelector("#follow-up-panel");
const resultPanel = document.querySelector("#result-panel");
const resultContent = document.querySelector("#result-content");
const intakeStatus = document.querySelector("#intake-status");
const presetList = document.querySelector("#preset-list");
const sessionList = document.querySelector("#session-list");
const refreshSessionsButton = document.querySelector("#refresh-sessions");
const resetFlowButton = document.querySelector("#reset-flow");
const stepper = document.querySelector("#stepper");

const demoPresets = [
  {
    id: "respiratory-watch",
    title: "Respiratory watch case",
    patientName: "Auntie Chen",
    age: 63,
    gender: "female",
    region: "County clinic area",
    symptoms: "fever, cough, chest tightness",
    symptomNotes: "Fever for three days, coughing more at night, mild chest tightness today.",
    symptomDays: 3,
    severity: "moderate",
    chronicConditions: "hypertension",
    medications: "paracetamol",
    allergies: "none"
  },
  {
    id: "mild-observation",
    title: "Mild home observation case",
    patientName: "Ming",
    age: 22,
    gender: "male",
    region: "University district",
    symptoms: "sore throat",
    symptomNotes: "Mild sore throat since this morning, no fever, able to eat.",
    symptomDays: 1,
    severity: "mild",
    chronicConditions: "",
    medications: "none",
    allergies: "none"
  },
  {
    id: "urgent-red-flag",
    title: "Urgent escalation case",
    patientName: "Mr. Lin",
    age: 58,
    gender: "male",
    region: "Rural village",
    symptoms: "cough, chest tightness",
    symptomNotes: "Breathing is getting harder and chest feels tight today.",
    symptomDays: 1,
    severity: "severe",
    chronicConditions: "asthma",
    medications: "none",
    allergies: "none"
  }
];

let draftPayload = {};
let activeSession = null;

function formToObject(form) {
  const data = new FormData(form);
  return Object.fromEntries(data.entries());
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setStep(stepNumber) {
  stepper.querySelectorAll(".step").forEach((step) => {
    const isActive = Number(step.dataset.step) === stepNumber;
    step.classList.toggle("active", isActive);
  });
}

function setStatus(message, type = "neutral") {
  intakeStatus.textContent = message;
  intakeStatus.className = `status-line ${type === "success" ? "success-text" : ""}`;
}

function fillIntakeForm(preset) {
  Object.entries(preset).forEach(([key, value]) => {
    if (key === "id" || key === "title") return;
    const field = intakeForm.elements.namedItem(key);
    if (field) {
      field.value = value;
    }
  });
  draftPayload = formToObject(intakeForm);
  setStatus(`Loaded preset: ${preset.title}`, "success");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderPresetList() {
  presetList.innerHTML = demoPresets
    .map(
      (preset) => `
        <article class="case-card">
          <div class="case-card-header">
            <div>
              <strong>${escapeHtml(preset.title)}</strong>
              <p>${escapeHtml(preset.patientName)} · ${escapeHtml(preset.region)}</p>
            </div>
            <button type="button" class="ghost-button small-button" data-preset="${preset.id}">
              Load case
            </button>
          </div>
        </article>
      `
    )
    .join("");
}

function buildSummaryExportText(session) {
  const { assessment, summary } = session;
  return [
    "CareBridge / 医路桥 Visit Summary",
    `Patient: ${session.intake.patientName || "Unnamed patient"}`,
    `Age: ${session.intake.age || "Unknown"}`,
    `Region: ${session.intake.region || "Unknown region"}`,
    `Risk level: ${assessment.riskLevel}`,
    `Action: ${assessment.actionLabel}`,
    `Suggested department: ${assessment.suggestedDepartment}`,
    `Chief complaint: ${summary.chiefComplaint}`,
    `Onset: ${summary.onset}`,
    `Main symptoms: ${summary.mainSymptoms}`,
    `Associated symptoms: ${summary.associatedSymptoms}`,
    `Medical history: ${summary.medicalHistory}`,
    `Medication: ${summary.currentMedication}`,
    `Risk notes: ${summary.riskNotes}`,
    "",
    "Immediate steps:",
    ...assessment.immediateSteps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "Doctor prompts:",
    ...summary.doctorQuestions.map((item, index) => `${index + 1}. ${item}`),
    "",
    "Warning:",
    assessment.warning
  ].join("\n");
}

function downloadSummary(session) {
  const blob = new Blob([buildSummaryExportText(session)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `carebridge-summary-${session.id}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function copySummary(session) {
  await navigator.clipboard.writeText(buildSummaryExportText(session));
}

function renderQuestions(questions) {
  questionsForm.innerHTML = "";
  setStep(2);

  questions.forEach((question) => {
    const templateId =
      question.type === "select"
        ? "#question-select-template"
        : "#question-number-template";
    const fragment = document.querySelector(templateId).content.cloneNode(true);
    const label = fragment.querySelector("label");
    const labelText = fragment.querySelector("span");
    labelText.textContent = question.label;

    if (question.type === "select") {
      const select = fragment.querySelector("select");
      select.name = question.id;
      select.setAttribute("aria-label", question.label);
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Select";
      select.appendChild(placeholder);
      question.options.forEach((option) => {
        const element = document.createElement("option");
        element.value = option.value;
        element.textContent = option.label;
        select.appendChild(element);
      });
    } else {
      const input = fragment.querySelector("input");
      input.name = question.id;
      input.setAttribute("aria-label", question.label);
      input.min = question.min;
      input.max = question.max;
      input.step = question.step || "1";
      input.placeholder = question.placeholder || "";
    }

    questionsForm.appendChild(label);
  });

  const actions = document.createElement("div");
  actions.className = "wide actions";
  actions.innerHTML = `
    <button type="submit" class="primary-button">Generate guidance</button>
    <button type="button" class="ghost-button" id="back-to-intake">Back to intake</button>
    <p class="status-line">These answers complete the missing medical context.</p>
  `;
  questionsForm.appendChild(actions);
  followUpPanel.classList.remove("hidden");
}

function renderFollowUps(followUps = []) {
  if (followUps.length === 0) {
    return `<div class="empty-state"><p class="section-copy">No follow-up records yet. Save one after observing the patient again.</p></div>`;
  }

  return `
    <ol class="timeline-list">
      ${followUps
        .map(
          (record) => `
            <li>
              <strong>${new Date(record.createdAt).toLocaleString()}</strong><br />
              温度：${escapeHtml(record.temperatureC ?? "未记录")}°C；变化：${escapeHtml(
                record.symptomChange || "未填写"
              )}；用药：${escapeHtml(record.medicationTaken || "无")}；备注：${escapeHtml(record.note || "无")}
            </li>
          `
        )
        .join("")}
    </ol>
  `;
}

function renderSessionList(sessions) {
  if (!sessions.length) {
    sessionList.innerHTML =
      '<div class="empty-state"><p class="section-copy">No sessions yet. Complete an assessment to build the caseboard.</p></div>';
    return;
  }

  sessionList.innerHTML = sessions
    .map(
      (session) => `
        <article class="session-card" data-session-id="${session.id}">
          <div class="session-card-header">
            <div>
              <strong>${escapeHtml(session.patientName)}</strong>
              <p>${escapeHtml(session.region)}</p>
            </div>
            <div class="case-risk">${escapeHtml(session.actionLabel)}</div>
          </div>
          <div class="session-chip-row">
            <span class="chip">${escapeHtml(session.suggestedDepartment)}</span>
            <span class="session-meta">${session.followUpCount} follow-up records</span>
          </div>
        </article>
      `
    )
    .join("");
}

async function loadRecentSessions() {
  const response = await fetch("/api/sessions?limit=8");
  const data = await response.json();
  renderSessionList(data.sessions || []);
}

function renderResult(session, followupMessage = "") {
  activeSession = session;
  setStep(3);
  const { assessment, summary, followUps } = session;
  const riskClass = assessment.riskLevel.toLowerCase().replace(/\s+/g, "-");

  resultContent.innerHTML = `
    <div class="result-grid">
      <div class="result-card">
        <div class="risk-banner">
          <div>
            <div class="risk-pill ${riskClass}">${escapeHtml(assessment.riskLevel)}</div>
            <h3 class="card-title">${escapeHtml(assessment.actionLabel)}</h3>
          </div>
          <div class="chip">${escapeHtml(assessment.suggestedDepartment)}</div>
        </div>

        <div class="result-actions">
          <p class="warning">${escapeHtml(assessment.warning)}</p>
        </div>

        ${
          assessment.redFlags.length
            ? `<div class="summary-actions">${assessment.redFlags
                .map((flag) => `<span class="case-risk">${escapeHtml(flag)}</span>`)
                .join("")}</div>`
            : ""
        }

        <h4 class="card-title">Why this level?</h4>
        <ol class="reason-list">
          ${assessment.reasoning.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ol>

        <h4 class="card-title">Immediate steps</h4>
        <ol class="step-list">
          ${assessment.immediateSteps.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ol>
      </div>

      <div class="summary-card">
        <div class="summary-actions">
          <div>
            <p class="section-kicker">Visit summary</p>
            <h3 class="card-title">Printable handoff for the doctor</h3>
          </div>
          <div class="summary-actions">
            <button type="button" class="ghost-button small-button" id="copy-summary">Copy</button>
            <button type="button" class="ghost-button small-button" id="download-summary">Download</button>
            <button type="button" class="ghost-button small-button" id="print-summary">Print</button>
          </div>
        </div>
        <div class="summary-box">
          <p class="section-copy">${escapeHtml(summary.summaryText)}</p>
        </div>
        <ul class="summary-list">
          <li><strong>Chief complaint:</strong> ${escapeHtml(summary.chiefComplaint)}</li>
          <li><strong>Onset:</strong> ${escapeHtml(summary.onset)}</li>
          <li><strong>Main symptoms:</strong> ${escapeHtml(summary.mainSymptoms)}</li>
          <li><strong>Associated symptoms:</strong> ${escapeHtml(summary.associatedSymptoms)}</li>
          <li><strong>Medical history:</strong> ${escapeHtml(summary.medicalHistory)}</li>
          <li><strong>Current medication:</strong> ${escapeHtml(summary.currentMedication)}</li>
          <li><strong>Risk notes:</strong> ${escapeHtml(summary.riskNotes)}</li>
          <li><strong>Suggested department:</strong> ${escapeHtml(summary.suggestedDepartment)}</li>
        </ul>
      </div>

      <div class="timeline-card">
        <p class="section-kicker">Doctor prompts</p>
        <h3 class="card-title">Questions to ask or tell the doctor</h3>
        <ol class="step-list">
          ${summary.doctorQuestions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ol>
      </div>

      <div class="timeline-card">
        <p class="section-kicker">Longitudinal tracking</p>
        <h3 class="card-title">Save a follow-up note</h3>
        <form id="followup-form" class="followup-grid">
          <label>
            <span>Current temperature</span>
            <input name="temperatureC" aria-label="Current temperature" type="number" step="0.1" placeholder="e.g. 38.1" />
          </label>
          <label>
            <span>Symptom change</span>
            <input name="symptomChange" aria-label="Symptom change" placeholder="e.g. cough is less frequent" />
          </label>
          <label>
            <span>Medication taken</span>
            <input name="medicationTaken" aria-label="Medication taken" placeholder="e.g. paracetamol" />
          </label>
          <label>
            <span>Follow-up note</span>
            <input name="note" aria-label="Follow-up note" placeholder="e.g. able to rest tonight" />
          </label>
          <div class="wide actions">
            <button type="submit" class="secondary-button">Save follow-up</button>
            <button type="button" class="ghost-button" id="reload-session">Reload this case</button>
            <p id="followup-status" class="status-line">${escapeHtml(followupMessage)}</p>
          </div>
        </form>
        <div id="followup-list">${renderFollowUps(followUps)}</div>
      </div>
    </div>
  `;

  resultPanel.classList.remove("hidden");
  resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });

  document.querySelector("#followup-form").addEventListener("submit", saveFollowUp);
  document.querySelector("#copy-summary").addEventListener("click", async () => {
    await copySummary(session);
    const status = document.querySelector("#followup-status");
    if (status) status.textContent = "Summary copied";
  });
  document.querySelector("#download-summary").addEventListener("click", () => {
    downloadSummary(session);
  });
  document.querySelector("#print-summary").addEventListener("click", () => {
    window.print();
  });
  document.querySelector("#reload-session").addEventListener("click", async () => {
    const refreshed = await fetch(`/api/sessions/${activeSession.id}`);
    const data = await refreshed.json();
    renderResult(data.session, "Case reloaded");
  });
}

async function submitIntake(event) {
  event.preventDefault();
  setStatus("Assessing initial context...");
  draftPayload = formToObject(intakeForm);

  const response = await fetch("/api/triage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draftPayload)
  });
  const data = await response.json();

  if (data.status === "needs_follow_up") {
    setStatus("A few more questions are needed.");
    renderQuestions(data.questions);
    resultPanel.classList.add("hidden");
    return;
  }

  setStatus("Assessment complete.", "success");
  followUpPanel.classList.add("hidden");
  renderResult(data.session);
  await loadRecentSessions();
}

async function submitQuestions(event) {
  event.preventDefault();
  const answers = formToObject(questionsForm);
  const payload = { ...draftPayload, ...answers };

  const response = await fetch("/api/triage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json();

  if (data.status === "needs_follow_up") {
    renderQuestions(data.questions);
    return;
  }

  followUpPanel.classList.add("hidden");
  setStatus("Assessment complete.", "success");
  renderResult(data.session);
  await loadRecentSessions();
}

async function saveFollowUp(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = formToObject(form);

  const response = await fetch(`/api/sessions/${activeSession.id}/follow-ups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json();

  if (!response.ok) {
    document.querySelector("#followup-status").textContent =
      data.error || "Unable to save follow-up";
    return;
  }

  form.reset();
  const refreshed = await fetch(`/api/sessions/${activeSession.id}`);
  const sessionData = await refreshed.json();
  renderResult(sessionData.session, "Follow-up saved");
  await loadRecentSessions();
}

function resetFlow() {
  intakeForm.reset();
  questionsForm.innerHTML = "";
  followUpPanel.classList.add("hidden");
  resultPanel.classList.add("hidden");
  draftPayload = {};
  activeSession = null;
  setStep(1);
  setStatus("Flow reset. Ready for a new patient.");
}

async function openSession(sessionId) {
  const response = await fetch(`/api/sessions/${sessionId}`);
  const data = await response.json();
  if (!response.ok) {
    setStatus(data.error || "Unable to load this case");
    return;
  }
  renderResult(data.session);
  setStatus(`Loaded case: ${data.session.intake.patientName || "Unnamed patient"}`, "success");
}

presetList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-preset]");
  if (!button) return;
  const preset = demoPresets.find((item) => item.id === button.dataset.preset);
  if (preset) fillIntakeForm(preset);
});

sessionList.addEventListener("click", (event) => {
  const card = event.target.closest("[data-session-id]");
  if (!card) return;
  openSession(card.dataset.sessionId);
});

questionsForm.addEventListener("click", (event) => {
  if (event.target.id === "back-to-intake") {
    followUpPanel.classList.add("hidden");
    setStep(1);
  }
});

refreshSessionsButton.addEventListener("click", loadRecentSessions);
resetFlowButton.addEventListener("click", resetFlow);
intakeForm.addEventListener("submit", submitIntake);
questionsForm.addEventListener("submit", submitQuestions);

renderPresetList();
loadRecentSessions();

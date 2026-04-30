const intakeForm = document.querySelector("#intake-form");
const questionsForm = document.querySelector("#questions-form");
const followUpPanel = document.querySelector("#follow-up-panel");
const resultPanel = document.querySelector("#result-panel");
const resultContent = document.querySelector("#result-content");
const intakeStatus = document.querySelector("#intake-status");

let draftPayload = {};
let activeSession = null;

function formToObject(form) {
  const data = new FormData(form);
  return Object.fromEntries(data.entries());
}

function renderQuestions(questions) {
  questionsForm.innerHTML = "";

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
    <p class="status-line">These answers complete the missing medical context.</p>
  `;
  questionsForm.appendChild(actions);
  followUpPanel.classList.remove("hidden");
}

function renderFollowUps(followUps = []) {
  if (followUps.length === 0) {
    return `<p class="section-copy">No follow-up records yet. Save one after you observe the patient again.</p>`;
  }

  return `
    <ol class="timeline-list">
      ${followUps
        .map(
          (record) => `
            <li>
              <strong>${new Date(record.createdAt).toLocaleString()}</strong><br />
              温度：${record.temperatureC ?? "未记录"}°C；变化：${record.symptomChange || "未填写"}；备注：${record.note || "无"}
            </li>
          `
        )
        .join("")}
    </ol>
  `;
}

function renderResult(session, followupMessage = "") {
  activeSession = session;
  const { assessment, summary, followUps } = session;
  const riskClass = assessment.riskLevel.toLowerCase().replace(/\s+/g, "-");

  resultContent.innerHTML = `
    <div class="result-grid">
      <div class="result-card">
        <div class="risk-banner">
          <div>
            <div class="risk-pill ${riskClass}">${assessment.riskLevel}</div>
            <h3 class="card-title">${assessment.actionLabel}</h3>
          </div>
          <div class="chip">${assessment.suggestedDepartment}</div>
        </div>

        <p class="warning">${assessment.warning}</p>

        <h4 class="card-title">Why this level?</h4>
        <ol class="reason-list">
          ${assessment.reasoning.map((item) => `<li>${item}</li>`).join("")}
        </ol>

        <h4 class="card-title">Immediate steps</h4>
        <ol class="step-list">
          ${assessment.immediateSteps.map((item) => `<li>${item}</li>`).join("")}
        </ol>
      </div>

      <div class="summary-card">
        <p class="section-kicker">Visit summary</p>
        <h3 class="card-title">Visit summary</h3>
        <p class="section-copy">${summary.summaryText}</p>
        <ul class="summary-list">
          <li><strong>Chief complaint:</strong> ${summary.chiefComplaint}</li>
          <li><strong>Onset:</strong> ${summary.onset}</li>
          <li><strong>Main symptoms:</strong> ${summary.mainSymptoms}</li>
          <li><strong>Associated symptoms:</strong> ${summary.associatedSymptoms}</li>
          <li><strong>Medical history:</strong> ${summary.medicalHistory}</li>
          <li><strong>Current medication:</strong> ${summary.currentMedication}</li>
          <li><strong>Risk notes:</strong> ${summary.riskNotes}</li>
          <li><strong>Suggested department:</strong> ${summary.suggestedDepartment}</li>
        </ul>
      </div>

      <div class="timeline-card">
        <p class="section-kicker">Doctor prompts</p>
        <h3 class="card-title">Questions to ask or tell the doctor</h3>
        <ol class="step-list">
          ${summary.doctorQuestions.map((item) => `<li>${item}</li>`).join("")}
        </ol>
      </div>

      <div class="timeline-card">
        <p class="section-kicker">Follow-up</p>
        <h3 class="card-title">Track symptom changes</h3>
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
            <p id="followup-status" class="status-line">${followupMessage}</p>
          </div>
        </form>
        <div id="followup-list">${renderFollowUps(followUps)}</div>
      </div>
    </div>
  `;

  resultPanel.classList.remove("hidden");

  document.querySelector("#followup-form").addEventListener("submit", saveFollowUp);
}

async function submitIntake(event) {
  event.preventDefault();
  intakeStatus.textContent = "Assessing initial context...";
  draftPayload = formToObject(intakeForm);

  const response = await fetch("/api/triage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draftPayload)
  });
  const data = await response.json();

  if (data.status === "needs_follow_up") {
    intakeStatus.textContent = "A few more questions are needed.";
    renderQuestions(data.questions);
    resultPanel.classList.add("hidden");
    return;
  }

  intakeStatus.textContent = "Assessment complete.";
  followUpPanel.classList.add("hidden");
  renderResult(data.session);
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

  renderResult(data.session);
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
}

intakeForm.addEventListener("submit", submitIntake);
questionsForm.addEventListener("submit", submitQuestions);


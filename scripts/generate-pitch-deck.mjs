import fs from "node:fs";
import path from "node:path";
import PptxGenJS from "pptxgenjs";

const root = process.cwd();
const docDir = path.join(root, "doc");
const screenshotsDir = path.join(docDir, "screenshots");
const outputPath = path.join(docDir, "CareBridge-Hackathon-Deck.pptx");
const logoPath = path.join(root, "public", "logo.svg");
const screenHome = path.join(screenshotsDir, "home.png");
const screenResult = path.join(screenshotsDir, "triage-result.png");
const screenFollow = path.join(screenshotsDir, "follow-up.png");

for (const asset of [logoPath, screenHome, screenResult, screenFollow]) {
  if (!fs.existsSync(asset)) {
    throw new Error(`Missing required asset: ${asset}`);
  }
}

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "OpenAI Codex";
pptx.company = "CareBridge";
pptx.subject = "Hackathon pitch deck";
pptx.title = "CareBridge / 医路桥";
pptx.lang = "zh-CN";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "zh-CN"
};

const colors = {
  ink: "164E63",
  text: "285D71",
  muted: "6B8794",
  cyan: "0891B2",
  cyanSoft: "D8F6FC",
  green: "059669",
  greenSoft: "DDF8EF",
  amber: "F59E0B",
  amberSoft: "FFF3D6",
  red: "DC2626",
  border: "BEEAF4",
  bg: "F7FDFF",
  white: "FFFFFF"
};

function addPageChrome(slide, section, title, subtitle = "") {
  slide.addText(section, {
    x: 0.6,
    y: 0.32,
    w: 2.4,
    h: 0.18,
    fontFace: "Aptos",
    fontSize: 10,
    bold: true,
    color: colors.cyan,
    charSpace: 1.6,
    margin: 0
  });
  slide.addText(title, {
    x: 0.6,
    y: 0.58,
    w: 7.8,
    h: 0.55,
    fontFace: "Aptos Display",
    fontSize: 22,
    bold: true,
    color: colors.ink,
    margin: 0
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 4.2,
      y: 0.62,
      w: 8.45,
      h: 0.36,
      fontFace: "Aptos",
      fontSize: 10.5,
      color: colors.muted,
      align: "right",
      valign: "mid",
      margin: 0
    });
  }
  slide.addShape(pptx.ShapeType.line, {
    x: 0.6,
    y: 1.16,
    w: 12.1,
    h: 0,
    line: { color: colors.border, pt: 1 }
  });
}

function addBulletList(slide, items, x, y, w, h, fontSize = 15, color = colors.text) {
  const runs = [];
  items.forEach((item, index) => {
    runs.push({
      text: item,
      options: {
        bullet: { indent: 14 },
        breakLine: index < items.length - 1
      }
    });
  });

  slide.addText(runs, {
    x,
    y,
    w,
    h,
    fontFace: "Aptos",
    fontSize,
    color,
    margin: 2,
    paraSpaceAfterPt: 10
  });
}

function addPill(slide, text, x, y, w, fillColor) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h: 0.34,
    rectRadius: 0.12,
    line: { color: fillColor, pt: 1 },
    fill: { color: fillColor, transparency: 88 }
  });
  slide.addText(text, {
    x: x + 0.08,
    y: y + 0.05,
    w: w - 0.16,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 10.5,
    color: colors.ink,
    bold: true,
    align: "center",
    margin: 0
  });
}

function addCard(slide, x, y, w, h, title, body, accent = colors.cyan) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.12,
    line: { color: colors.border, pt: 1.1 },
    fill: { color: colors.white }
  });
  slide.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w: 0.08,
    h,
    line: { color: accent, pt: 0 },
    fill: { color: accent }
  });
  slide.addText(title, {
    x: x + 0.2,
    y: y + 0.18,
    w: w - 0.36,
    h: 0.28,
    fontFace: "Aptos Display",
    fontSize: 16,
    bold: true,
    color: colors.ink,
    margin: 0
  });
  slide.addText(body, {
    x: x + 0.2,
    y: y + 0.52,
    w: w - 0.36,
    h: h - 0.68,
    fontFace: "Aptos",
    fontSize: 12.4,
    color: colors.text,
    margin: 0.02
  });
}

// 1 cover
{
  const slide = pptx.addSlide();
  slide.background = { color: colors.bg };
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.55,
    y: 0.55,
    w: 12.15,
    h: 6.4,
    rectRadius: 0.18,
    line: { color: colors.border, pt: 1 },
    fill: { color: colors.white }
  });
  slide.addImage({ path: logoPath, x: 0.85, y: 0.78, w: 0.56, h: 0.56 });
  slide.addText("CAREEBRIDGE / 医路桥", {
    x: 1.52,
    y: 0.9,
    w: 3,
    h: 0.22,
    fontFace: "Aptos",
    fontSize: 10.5,
    bold: true,
    color: colors.cyan,
    charSpace: 1.4,
    margin: 0
  });
  slide.addText("Turn symptom chaos\ninto safer care decisions.", {
    x: 0.86,
    y: 1.35,
    w: 6.25,
    h: 1.95,
    fontFace: "Aptos Display",
    fontSize: 26,
    bold: true,
    color: colors.ink,
    margin: 0
  });
  slide.addText(
    "AI Triage & Visit Preparation Assistant for Underserved Patients\n让患者在见到医生之前，就完成更清晰、更安全的就医准备。",
    {
      x: 0.9,
      y: 3.48,
      w: 6.2,
      h: 0.95,
      fontFace: "Aptos",
      fontSize: 13.5,
      color: colors.text,
      margin: 0
    }
  );
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.45,
    y: 1.12,
    w: 4.45,
    h: 2.25,
    rectRadius: 0.14,
    line: { color: colors.border, pt: 1 },
    fill: { color: colors.cyanSoft }
  });
  slide.addText("What makes this submission credible", {
    x: 7.76,
    y: 1.4,
    w: 3.6,
    h: 0.28,
    fontFace: "Aptos Display",
    fontSize: 16,
    bold: true,
    color: colors.ink,
    margin: 0
  });
  addBulletList(
    slide,
    [
      "Red-flag aware triage decisions",
      "Follow-up questions only when missing context changes urgency",
      "Doctor-facing summary that can be copied, downloaded, or printed",
      "Persistent revisit flow for follow-up"
    ],
    7.76,
    1.82,
    3.74,
    1.22,
    11.5
  );
  addPill(slide, "Healthcare accessibility", 7.72, 4.6, 1.74, colors.cyan);
  addPill(slide, "Safety boundaries", 9.6, 4.6, 1.5, colors.green);
  addPill(slide, "Hackathon-ready", 8.53, 5.02, 1.72, colors.amber);
}

// 2 problem
{
  const slide = pptx.addSlide();
  slide.background = { color: colors.bg };
  addPageChrome(slide, "Problem", "医疗资源不均，不只是“看病难”，更是“就医前判断难”", "The biggest gap often happens before the patient reaches a doctor.");
  addCard(slide, 0.75, 1.55, 3.88, 1.45, "Patients do not know urgency", "A fever, chest discomfort, or worsening cough often starts with uncertainty, not action.", colors.red);
  addCard(slide, 4.72, 1.55, 3.88, 1.45, "Symptoms are described poorly", "Patients and family members rarely arrive with structured, consultation-ready information.", colors.cyan);
  addCard(slide, 8.69, 1.55, 3.88, 1.45, "Doctors lose time on reconstruction", "Short consultation time gets spent rebuilding context instead of making the best clinical decision.", colors.green);
  slide.addText("The care journey breaks before diagnosis", {
    x: 0.78,
    y: 3.3,
    w: 4.4,
    h: 0.28,
    fontFace: "Aptos Display",
    fontSize: 18,
    bold: true,
    color: colors.ink
  });
  const journey = [
    ["Symptoms start", "Unclear if it is serious"],
    ["Search / ask family", "Advice is fragmented"],
    ["Choose where to go", "Wrong department or delay"],
    ["Arrive at clinic", "Doctor hears incomplete story"]
  ];
  let baseX = 0.82;
  journey.forEach(([title, body], index) => {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: baseX,
      y: 3.78,
      w: 2.55,
      h: 1.28,
      rectRadius: 0.12,
      line: { color: colors.border, pt: 1 },
      fill: { color: colors.white }
    });
    slide.addText(String(index + 1), {
      x: baseX + 0.15,
      y: 3.95,
      w: 0.3,
      h: 0.18,
      fontFace: "Aptos Display",
      fontSize: 13,
      bold: true,
      color: colors.cyan
    });
    slide.addText(title, {
      x: baseX + 0.46,
      y: 3.91,
      w: 1.75,
      h: 0.24,
      fontFace: "Aptos Display",
      fontSize: 13.5,
      bold: true,
      color: colors.ink,
      margin: 0
    });
    slide.addText(body, {
      x: baseX + 0.16,
      y: 4.3,
      w: 2.1,
      h: 0.4,
      fontFace: "Aptos",
      fontSize: 11,
      color: colors.text,
      margin: 0
    });
    if (index < journey.length - 1) {
      slide.addShape(pptx.ShapeType.chevron, {
        x: baseX + 2.66,
        y: 4.2,
        w: 0.2,
        h: 0.26,
        line: { color: colors.border, pt: 0 },
        fill: { color: colors.border }
      });
    }
    baseX += 2.95;
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.82,
    y: 5.52,
    w: 11.9,
    h: 1.08,
    rectRadius: 0.12,
    line: { color: colors.cyan, pt: 1 },
    fill: { color: colors.cyanSoft }
  });
  slide.addText(
    "Medical friction often begins with uncertainty, delay, and fragmented patient communication.",
    {
      x: 1.08,
      y: 5.84,
      w: 11.2,
      h: 0.42,
      fontFace: "Aptos Display",
      fontSize: 18,
      bold: true,
      color: colors.ink,
      align: "center",
      margin: 0
    }
  );
}

// 3 users
{
  const slide = pptx.addSlide();
  slide.background = { color: colors.bg };
  addPageChrome(slide, "Users", "Who we serve", "CareBridge helps the people around the first medical handoff.");
  const users = [
    ["Patients in rural and county settings", "Need a clearer answer to: should I go now, where should I go, and what should I say?"],
    ["Family caregivers", "Need a way to record symptoms and support elderly or low-tech patients."],
    ["Primary / community doctors", "Need structured intake context before repeated basic questioning."],
    ["Receiving clinicians", "Need a clean summary that helps them start closer to clinical decision-making."]
  ];
  const positions = [
    [0.8, 1.65],
    [6.87, 1.65],
    [0.8, 3.7],
    [6.87, 3.7]
  ];
  users.forEach((user, index) => {
    const [x, y] = positions[index];
    addCard(slide, x, y, 5.65, 1.65, user[0], user[1], index < 2 ? colors.cyan : colors.green);
  });
}

// 4 solution
{
  const slide = pptx.addSlide();
  slide.background = { color: colors.bg };
  addPageChrome(slide, "Solution", "Introducing CareBridge", "We do not replace doctors. We prepare patients better.");
  addCard(slide, 0.8, 1.6, 3, 1.55, "1. Symptom intake", "Patients start with natural language instead of medical jargon.", colors.cyan);
  addCard(slide, 3.98, 1.6, 3, 1.55, "2. Guided follow-up", "The system asks only for missing signals that could change urgency.", colors.green);
  addCard(slide, 7.16, 1.6, 3, 1.55, "3. Risk stratification", "Four action levels turn uncertain symptoms into clear next steps.", colors.amber);
  addCard(slide, 10.34, 1.6, 2.18, 1.55, "4. Visit summary", "A doctor-ready summary supports faster handoff.", colors.cyan);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.82,
    y: 3.65,
    w: 11.7,
    h: 2.55,
    rectRadius: 0.12,
    line: { color: colors.border, pt: 1 },
    fill: { color: colors.white }
  });
  slide.addText("Core value proposition", {
    x: 1.05,
    y: 3.92,
    w: 2.8,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 10,
    bold: true,
    color: colors.cyan,
    charSpace: 1.2
  });
  slide.addText("CareBridge helps patients enter the healthcare system earlier, safer, and better prepared.", {
    x: 1.05,
    y: 4.22,
    w: 6.15,
    h: 0.7,
    fontFace: "Aptos Display",
    fontSize: 23,
    bold: true,
    color: colors.ink,
    margin: 0
  });
  addBulletList(
    slide,
    [
      "Turn ambiguous symptoms into a clear action recommendation",
      "Reduce wrong-department visits and avoidable delay",
      "Improve the first doctor-patient handoff with structured context"
    ],
    7.2,
    4.08,
    4.75,
    1.2,
    13
  );
}

// 5 workflow
{
  const slide = pptx.addSlide();
  slide.background = { color: colors.bg };
  addPageChrome(slide, "Workflow", "How it works", "A narrow, realistic loop is easier to trust and easier to demo.");
  const steps = [
    ["Intake", "Natural-language symptoms and patient context"],
    ["Clarify", "Targeted follow-up questions for missing risk signals"],
    ["Assess", "Risk level, suggested action, and suggested department"],
    ["Summarize", "Doctor-facing handoff summary"],
    ["Track", "Follow-up logs and revisit workflow"]
  ];
  steps.forEach(([title, body], index) => {
    const x = 0.85 + index * 2.45;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 2.05,
      w: 2.1,
      h: 2.6,
      rectRadius: 0.12,
      line: { color: colors.border, pt: 1.1 },
      fill: { color: colors.white }
    });
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.16,
      y: 2.22,
      w: 0.42,
      h: 0.42,
      line: { color: colors.cyan, pt: 0 },
      fill: { color: index % 2 === 0 ? colors.cyan : colors.green }
    });
    slide.addText(String(index + 1), {
      x: x + 0.16,
      y: 2.32,
      w: 0.42,
      h: 0.1,
      fontFace: "Aptos Display",
      fontSize: 10,
      bold: true,
      color: colors.white,
      align: "center",
      margin: 0
    });
    slide.addText(title, {
      x: x + 0.16,
      y: 2.78,
      w: 1.7,
      h: 0.24,
      fontFace: "Aptos Display",
      fontSize: 16,
      bold: true,
      color: colors.ink,
      margin: 0
    });
    slide.addText(body, {
      x: x + 0.16,
      y: 3.18,
      w: 1.72,
      h: 0.95,
      fontFace: "Aptos",
      fontSize: 11.5,
      color: colors.text,
      margin: 0
    });
    if (index < steps.length - 1) {
      slide.addShape(pptx.ShapeType.chevron, {
        x: x + 2.12,
        y: 3.2,
        w: 0.23,
        h: 0.4,
        line: { color: colors.border, pt: 0 },
        fill: { color: colors.border }
      });
    }
  });
}

// 6 product overview
{
  const slide = pptx.addSlide();
  slide.background = { color: colors.bg };
  addPageChrome(slide, "Product", "Live product: intake + caseboard", "A trust-first interface matters in healthcare.");
  slide.addImage({ path: screenHome, x: 0.72, y: 1.45, w: 8.7, h: 5.45 });
  addCard(slide, 9.7, 1.75, 2.82, 1.15, "Demo presets", "Fast, reliable demo cases for recording and judging.", colors.cyan);
  addCard(slide, 9.7, 3.1, 2.82, 1.15, "Caseboard", "Recent sessions persist locally so a patient can be revisited later.", colors.green);
  addCard(slide, 9.7, 4.45, 2.82, 1.35, "Accessibility-first UI", "High-contrast light palette, visible focus states, and large tap targets.", colors.amber);
}

// 7 result
{
  const slide = pptx.addSlide();
  slide.background = { color: colors.bg };
  addPageChrome(slide, "Product", "Live product: guidance, summary, and follow-up", "The product does not stop at advice.");
  slide.addImage({ path: screenResult, x: 0.72, y: 1.48, w: 6.02, h: 5.55 });
  slide.addImage({ path: screenFollow, x: 6.92, y: 1.48, w: 5.65, h: 5.55 });
}

// 8 safety
{
  const slide = pptx.addSlide();
  slide.background = { color: colors.bg };
  addPageChrome(slide, "Safety", "Medical safety boundaries", "A responsible healthcare product should be clear about what it does not do.");
  const boundaries = [
    ["No final diagnosis", "The product does not claim to identify a disease or replace clinical judgment."],
    ["No doctor replacement", "All outputs are pre-visit guidance and structured communication support."],
    ["Conservative escalation", "Red-flag symptoms push the product toward urgent in-person care."],
    ["Local privacy by design", "The MVP stores session history locally and only saves the minimum needed context."],
    ["Rules + explanation", "Risk stratification is bounded by explicit logic instead of free-form chatbot output."]
  ];
  let y = 1.62;
  boundaries.forEach((item, index) => {
    addCard(slide, 0.92, y, 11.45, 0.82, item[0], item[1], index % 2 === 0 ? colors.red : colors.cyan);
    y += 0.96;
  });
}

// 9 architecture
{
  const slide = pptx.addSlide();
  slide.background = { color: colors.bg };
  addPageChrome(slide, "Architecture", "Technical design", "Built as a narrow, testable local MVP instead of a speculative platform.");
  addCard(slide, 0.84, 1.68, 3.6, 1.4, "Frontend", "Vanilla HTML/CSS/JS delivers the intake flow, caseboard, export actions, and follow-up experience.", colors.cyan);
  addCard(slide, 4.86, 1.68, 3.6, 1.4, "Backend", "Node.js + Express handles triage assessment, follow-up recording, and session retrieval APIs.", colors.green);
  addCard(slide, 8.88, 1.68, 3.6, 1.4, "Persistence", "Local JSON storage keeps the MVP simple, inspectable, and hackathon-friendly.", colors.amber);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.15,
    y: 3.62,
    w: 11,
    h: 2.2,
    rectRadius: 0.12,
    line: { color: colors.border, pt: 1 },
    fill: { color: colors.white }
  });
  slide.addText("Decision pipeline", {
    x: 1.38,
    y: 3.9,
    w: 2.2,
    h: 0.18,
    fontFace: "Aptos",
    fontSize: 10,
    bold: true,
    color: colors.cyan,
    charSpace: 1.2
  });
  const pipeline = ["Patient intake", "Missing-signal detection", "Red-flag rules", "Risk/action output", "Visit summary", "Follow-up persistence"];
  pipeline.forEach((text, index) => {
    const x = 1.35 + index * 1.76;
    const fill = index % 2 === 0 ? colors.cyanSoft : colors.greenSoft;
    const stroke = index % 2 === 0 ? colors.cyan : colors.green;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 4.42,
      w: 1.45,
      h: 0.72,
      rectRadius: 0.12,
      line: { color: stroke, pt: 1 },
      fill: { color: fill }
    });
    slide.addText(text, {
      x: x + 0.08,
      y: 4.56,
      w: 1.28,
      h: 0.22,
      fontFace: "Aptos",
      fontSize: 10.2,
      bold: true,
      color: colors.ink,
      align: "center",
      margin: 0
    });
    if (index < pipeline.length - 1) {
      slide.addShape(pptx.ShapeType.chevron, {
        x: x + 1.48,
        y: 4.63,
        w: 0.18,
        h: 0.18,
        line: { color: colors.border, pt: 0 },
        fill: { color: colors.border }
      });
    }
  });
}

// 10 execution
{
  const slide = pptx.addSlide();
  slide.background = { color: colors.bg };
  addPageChrome(slide, "Execution", "Built and verified", "A hackathon project feels more credible when the core flow is testable.");
  addCard(slide, 0.85, 1.62, 2.8, 1.28, "10 automated tests", "Unit + API tests pass across triage logic and session workflows.", colors.cyan);
  addCard(slide, 3.85, 1.62, 2.8, 1.28, "1 E2E browser flow", "Playwright validates the main patient journey end-to-end.", colors.green);
  addCard(slide, 6.85, 1.62, 2.8, 1.28, "3 product screenshots", "The repo includes visual proof for README, PPT, and submission assets.", colors.amber);
  addCard(slide, 9.85, 1.62, 2.48, 1.28, "GitHub-ready repo", "Code, docs, assets, scripts, and tests are packaged for submission.", colors.cyan);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.88,
    y: 3.58,
    w: 5.25,
    h: 2.15,
    rectRadius: 0.12,
    line: { color: colors.border, pt: 1 },
    fill: { color: colors.white }
  });
  slide.addText("Why this matters for judges", {
    x: 1.12,
    y: 3.85,
    w: 2.95,
    h: 0.24,
    fontFace: "Aptos Display",
    fontSize: 17,
    bold: true,
    color: colors.ink
  });
  addBulletList(
    slide,
    [
      "This is a working local product, not only a concept.",
      "The user flow is coherent enough to demo in under five minutes.",
      "The team thought about safety and responsibility, not only features."
    ],
    1.08,
    4.17,
    4.65,
    1.1,
    12.5
  );
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.72,
    y: 3.58,
    w: 5.28,
    h: 2.15,
    rectRadius: 0.12,
    line: { color: colors.border, pt: 1 },
    fill: { color: colors.white }
  });
  slide.addText("Submission package", {
    x: 6.98,
    y: 3.85,
    w: 2.45,
    h: 0.18,
    fontFace: "Aptos",
    fontSize: 10,
    bold: true,
    color: colors.cyan,
    charSpace: 1.4
  });
  addBulletList(
    slide,
    [
      "GitHub repository with source code and tests",
      "Product design doc and pitch outline",
      "Screenshots, video script, and submission checklist"
    ],
    6.98,
    4.17,
    4.65,
    1.0,
    12.5
  );
}

// 11 impact
{
  const slide = pptx.addSlide();
  slide.background = { color: colors.bg };
  addPageChrome(slide, "Impact", "Why this matters", "The contribution is social, operational, and communication-oriented.");
  addCard(slide, 0.84, 1.7, 3.85, 2.02, "For patients", "They get a clearer answer to whether care is urgent, where to go, and what to tell a doctor.", colors.cyan);
  addCard(slide, 4.92, 1.7, 3.85, 2.02, "For families", "They can record context for elderly or overwhelmed patients and track what changed later.", colors.green);
  addCard(slide, 9.0, 1.7, 3.3, 2.02, "For clinicians", "They receive a more structured first handoff instead of fragmented storytelling.", colors.amber);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.86,
    y: 4.18,
    w: 11.5,
    h: 1.5,
    rectRadius: 0.12,
    line: { color: colors.cyan, pt: 1 },
    fill: { color: colors.cyanSoft }
  });
  slide.addText("CareBridge improves the entry point into healthcare. That makes it practical for a hackathon and meaningful in the real world.", {
    x: 1.18,
    y: 4.58,
    w: 10.85,
    h: 0.55,
    fontFace: "Aptos Display",
    fontSize: 19,
    bold: true,
    color: colors.ink,
    align: "center",
    margin: 0
  });
}

// 12 closing
{
  const slide = pptx.addSlide();
  slide.background = { color: colors.bg };
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.65,
    y: 0.55,
    w: 12.05,
    h: 6.4,
    rectRadius: 0.18,
    line: { color: colors.border, pt: 1 },
    fill: { color: colors.white }
  });
  slide.addText("CareBridge / 医路桥", {
    x: 0.92,
    y: 0.92,
    w: 2.7,
    h: 0.22,
    fontFace: "Aptos",
    fontSize: 10.5,
    bold: true,
    color: colors.cyan,
    charSpace: 1.6
  });
  slide.addText("Helping patients reach care\nearlier, safer, and better prepared.", {
    x: 0.92,
    y: 1.45,
    w: 6.4,
    h: 1.45,
    fontFace: "Aptos Display",
    fontSize: 24,
    bold: true,
    color: colors.ink,
    margin: 0
  });
  slide.addText("Not a diagnosis engine.\nA better first step into the healthcare system.", {
    x: 0.96,
    y: 3.2,
    w: 4.8,
    h: 0.8,
    fontFace: "Aptos",
    fontSize: 16,
    color: colors.text,
    margin: 0
  });
  slide.addImage({ path: logoPath, x: 8.7, y: 1.55, w: 2.45, h: 2.45 });
  addPill(slide, "Healthcare accessibility", 7.78, 4.92, 1.9, colors.cyan);
  addPill(slide, "Responsible AI", 9.84, 4.92, 1.55, colors.green);
  addPill(slide, "Hackathon-ready MVP", 8.35, 5.38, 2.48, colors.amber);
}

await pptx.writeFile({ fileName: outputPath });
console.log(`Deck written to ${outputPath}`);

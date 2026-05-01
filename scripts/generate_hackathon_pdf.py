from pathlib import Path
import shutil

import fitz
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import registerFont
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
DOC_DIR = ROOT / "doc"
SCREEN_DIR = DOC_DIR / "screenshots"
CROP_DIR = SCREEN_DIR / "crops"
OUT_PDF = DOC_DIR / "CareBridge-Hackathon-Deck.pdf"
PREVIEW_DIR = DOC_DIR / "pdf-preview"
ASSETS = {
    "home": SCREEN_DIR / "home.png",
    "result": SCREEN_DIR / "triage-result.png",
    "follow": SCREEN_DIR / "follow-up.png",
}

FONTS = {
    "body": r"C:\Windows\Fonts\msyh.ttc",
    "bold": r"C:\Windows\Fonts\msyhbd.ttc",
}

for font_path in FONTS.values():
    if not Path(font_path).exists():
        raise FileNotFoundError(font_path)

registerFont(TTFont("YaHei", FONTS["body"]))
registerFont(TTFont("YaHeiBold", FONTS["bold"]))

PAGE_W = 13.333 * 72
PAGE_H = 7.5 * 72

PALETTE = {
    "bg": HexColor("#F7F3EE"),
    "cream": HexColor("#FBF8F4"),
    "card": HexColor("#FFFDFC"),
    "line": HexColor("#E6DDD3"),
    "text": HexColor("#1F1C1A"),
    "body": HexColor("#5F5A55"),
    "brown": HexColor("#8C6A52"),
    "orange": HexColor("#C98B5B"),
    "orange_soft": HexColor("#F3E4D7"),
    "mint": HexColor("#D8ECE4"),
    "teal": HexColor("#5C8A7A"),
    "red_soft": HexColor("#F8DEDB"),
    "red": HexColor("#B75A56"),
    "white": white,
}


def top_to_y(top, height):
    return PAGE_H - top - height


def rounded_box(c, x, top, w, h, fill, stroke=PALETTE["line"], radius=14, line_width=1):
    c.setLineWidth(line_width)
    c.setStrokeColor(stroke)
    c.setFillColor(fill)
    c.roundRect(x, top_to_y(top, h), w, h, radius, stroke=1, fill=1)


def draw_rule(c, y):
    c.setStrokeColor(PALETTE["line"])
    c.setLineWidth(1)
    c.line(52, PAGE_H - y, PAGE_W - 52, PAGE_H - y)


def draw_text(c, text, x, top, w, h, *, font="YaHei", size=12, color=None, leading=None, bold=False):
    style = ParagraphStyle(
        "custom",
        parent=getSampleStyleSheet()["BodyText"],
        fontName="YaHeiBold" if bold else font,
        fontSize=size,
        leading=leading or size * 1.28,
        textColor=color or PALETTE["body"],
        spaceAfter=0,
        spaceBefore=0,
        allowWidows=1,
        allowOrphans=1,
    )
    paragraph = Paragraph(text.replace("\n", "<br/>"), style)
    paragraph.wrapOn(c, w, h)
    paragraph.drawOn(c, x, top_to_y(top, h))


def draw_header(c, kicker, title, aside=""):
    draw_text(c, kicker.upper(), 52, 24, 170, 18, size=9.5, color=PALETTE["brown"], bold=True)
    draw_text(c, title, 52, 46, 520, 56, font="YaHeiBold", size=22, color=PALETTE["text"])
    if aside:
      draw_text(c, aside, 560, 54, 320, 36, size=10, color=PALETTE["body"])
    draw_rule(c, 104)


def draw_bullets(c, items, x, top, w, h, size=13):
    html = "<br/>".join([f"• {item}" for item in items])
    draw_text(c, html, x, top, w, h, size=size, color=PALETTE["body"], leading=size * 1.5)


def draw_image(c, path, x, top, w, h, with_frame=True, fill=None):
    if with_frame:
        rounded_box(c, x, top, w, h, fill or PALETTE["card"])
        inset = 2
    else:
        inset = 0
    c.drawImage(
        ImageReader(str(path)),
        x + inset,
        top_to_y(top + inset, h - inset * 2),
        w - inset * 2,
        h - inset * 2,
        preserveAspectRatio=True,
        mask="auto",
    )


def add_page(c):
    c.setFillColor(PALETTE["bg"])
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)


def pill(c, text, x, top, w, fill, color=PALETTE["text"]):
    rounded_box(c, x, top, w, 24, fill, stroke=fill, radius=12)
    draw_text(c, text, x + 8, top + 5, w - 16, 12, size=9.5, color=color, bold=True)


def cover_page(c):
    add_page(c)
    draw_text(c, "CAREBRIDGE / 医路桥", 54, 34, 200, 16, size=9.5, color=PALETTE["brown"], bold=True)
    draw_text(c, "Turn symptom chaos<br/>into safer care decisions.", 52, 66, 420, 120, font="YaHeiBold", size=28, color=PALETTE["text"], leading=30)
    draw_text(
        c,
        "AI Triage & Visit Preparation Assistant for Underserved Patients<br/>让患者在见到医生之前，就完成更清晰、更安全的就医准备。",
        54,
        188,
        380,
        70,
        size=13,
        color=PALETTE["body"],
        leading=18,
    )
    draw_image(c, CROP_DIR / "hero-crop.png", 52, 300, 430, 118, with_frame=True, fill=PALETTE["card"])
    rounded_box(c, 528, 42, 360, 198, PALETTE["cream"])
    draw_text(c, "Why this submission feels credible", 554, 64, 250, 22, font="YaHeiBold", size=18, color=PALETTE["text"])
    draw_bullets(
        c,
        [
            "Red-flag aware triage decisions",
            "Follow-up questions only when missing context changes urgency",
            "Doctor-facing summary that can be copied, printed, or downloaded",
            "Persistent revisit flow for follow-up",
        ],
        554,
        98,
        290,
        96,
        11.2,
    )
    draw_image(c, CROP_DIR / "caseboard-crop.png", 552, 258, 300, 122, with_frame=True)
    pill(c, "Healthcare accessibility", 552, 404, 130, PALETTE["orange_soft"])
    pill(c, "Safety boundaries", 692, 404, 112, PALETTE["mint"])
    pill(c, "Hackathon-ready", 612, 434, 116, PALETTE["orange_soft"])
    c.showPage()


def problem_page(c):
    add_page(c)
    draw_header(c, "Problem", "The hardest part often happens before diagnosis.", "The care journey breaks while patients are still deciding what to do.")
    draw_text(c, "Patients hesitate.<br/>Families guess.<br/>Doctors reconstruct.", 56, 118, 300, 120, font="YaHeiBold", size=25, color=PALETTE["text"], leading=28)
    draw_text(
        c,
        "Medical friction is not only about limited resources. It is also about uncertainty, delay, and fragmented communication before a patient reaches formal care.",
        56,
        246,
        300,
        78,
        size=13,
        color=PALETTE["body"],
        leading=18,
    )
    draw_text(c, "PAIN POINT", 58, 360, 120, 12, size=9.5, color=PALETTE["brown"], bold=True)
    draw_text(c, "Urgency is unclear", 58, 378, 180, 24, font="YaHeiBold", size=18, color=PALETTE["text"])
    draw_text(c, "Users often cannot tell when symptoms have crossed the line from inconvenient to dangerous.", 58, 408, 290, 52, size=11.5, color=PALETTE["body"])
    draw_image(c, CROP_DIR / "form-crop.png", 414, 116, 180, 360, with_frame=True)
    draw_image(c, CROP_DIR / "result-panel-crop.png", 620, 116, 262, 360, with_frame=True)
    c.showPage()


def audience_page(c):
    add_page(c)
    draw_header(c, "Audience", "Who the product is built for", "One narrow workflow, but value across the care chain.")
    rounded_box(c, 56, 118, 360, 360, PALETTE["card"])
    blocks = [
        ("1", "Patients in rural and county settings", "Need a clear answer to: should I go now, where should I go, and what should I say?"),
        ("2", "Family caregivers", "Need a practical way to record symptoms and support elderly or low-tech patients."),
        ("3", "Clinicians", "Need structured context before time gets spent reconstructing the patient's story."),
    ]
    top = 142
    for num, title, body in blocks:
        draw_text(c, num, 76, top, 20, 12, size=11, color=PALETTE["brown"], bold=True)
        draw_text(c, title, 100, top - 4, 250, 22, font="YaHeiBold", size=16, color=PALETTE["text"])
        draw_text(c, body, 100, top + 24, 260, 42, size=11.2, color=PALETTE["body"])
        top += 100
    draw_image(c, CROP_DIR / "caseboard-crop.png", 446, 118, 178, 168, with_frame=True)
    draw_image(c, CROP_DIR / "form-crop.png", 446, 308, 178, 170, with_frame=True)
    draw_image(c, CROP_DIR / "followup-crop.png", 648, 118, 234, 360, with_frame=True)
    c.showPage()


def solution_page(c):
    add_page(c)
    draw_header(c, "Solution", "CareBridge prepares patients better", "We do not replace doctors. We improve the first step into care.")
    draw_text(c, "A simple product promise:", 58, 120, 180, 16, size=10, color=PALETTE["brown"], bold=True)
    draw_text(c, "Help patients move from symptom uncertainty<br/>into a safer next action.", 56, 150, 330, 80, font="YaHeiBold", size=24, color=PALETTE["text"], leading=28)
    draw_bullets(
        c,
        [
            "Start with natural language",
            "Ask only the missing questions that change urgency",
            "Return a bounded action recommendation",
            "Generate a summary the doctor can use immediately",
        ],
        60,
        254,
        320,
        118,
        12.5,
    )
    draw_image(c, CROP_DIR / "form-crop.png", 440, 118, 176, 360, with_frame=True)
    draw_image(c, CROP_DIR / "result-panel-crop.png", 644, 118, 238, 360, with_frame=True)
    c.showPage()


def workflow_page(c):
    add_page(c)
    draw_header(c, "Workflow", "How the product works", "A narrow, realistic loop is easier to trust and easier to demo.")
    steps = [
        ("1", "Intake", "Symptoms + patient context"),
        ("2", "Clarify", "Only the missing risk signals"),
        ("3", "Assess", "Risk level and action"),
        ("4", "Summarize", "Doctor-facing handoff"),
        ("5", "Track", "Follow-up over time"),
    ]
    x = 62
    for i, (num, title, body) in enumerate(steps):
        rounded_box(c, x, 172, 154, 150, PALETTE["card"] if i % 2 == 0 else PALETTE["cream"])
        draw_text(c, num, x + 18, 194, 18, 12, size=11, color=PALETTE["brown"], bold=True)
        draw_text(c, title, x + 18, 220, 110, 20, font="YaHeiBold", size=16, color=PALETTE["text"])
        draw_text(c, body, x + 18, 250, 110, 40, size=11, color=PALETTE["body"])
        if i < len(steps) - 1:
            c.setStrokeColor(PALETTE["line"])
            c.setLineWidth(1.4)
            c.line(x + 154, PAGE_H - 246, x + 182, PAGE_H - 246)
        x += 174
    draw_text(c, "Designed to explain itself in under one minute of viewing.", 64, 362, 300, 18, size=11.5, color=PALETTE["body"])
    c.showPage()


def product_page(c):
    add_page(c)
    draw_header(c, "Product", "From intake to output", "Real screenshots carry more trust than abstract mockups.")
    draw_image(c, ASSETS["home"], 58, 116, 438, 382, with_frame=True)
    draw_image(c, ASSETS["result"], 520, 116, 340, 182, with_frame=True)
    draw_image(c, ASSETS["follow"], 520, 316, 340, 182, with_frame=True)
    c.showPage()


def safety_page(c):
    add_page(c)
    draw_header(c, "Safety", "Safety boundaries built in", "A good healthcare hackathon project should know its boundaries.")
    draw_text(c, "Not a diagnosis engine.", 56, 124, 380, 36, font="YaHeiBold", size=25, color=PALETTE["text"])
    draw_text(c, "A better first step into the healthcare system.", 56, 170, 360, 28, font="YaHeiBold", size=17, color=PALETTE["brown"])
    draw_bullets(
        c,
        [
            "No final medical diagnosis",
            "No replacement for licensed clinicians",
            "Conservative escalation when red flags appear",
            "Local session storage in the MVP",
        ],
        60,
        232,
        310,
        118,
        12.5,
    )
    draw_image(c, CROP_DIR / "result-panel-crop.png", 446, 118, 182, 360, with_frame=True)
    draw_image(c, CROP_DIR / "followup-crop.png", 652, 118, 230, 360, with_frame=True)
    c.showPage()


def execution_page(c):
    add_page(c)
    draw_header(c, "Execution", "Built and verified", "A working repo, a tested flow, and clean submission assets.")
    metrics = [
        ("Automated tests", "12", "Unit + API tests cover triage rules and session workflows."),
        ("E2E journeys", "1", "Playwright validates the main patient experience end-to-end."),
        ("Screenshots", "3", "README, PDF, and submission pages already have polished product visuals."),
        ("Repository", "Ready", "Docs, scripts, tests, and assets are packaged for submission."),
    ]
    x = 60
    for label, value, note in metrics:
        draw_text(c, label.upper(), x, 126, 120, 12, size=9.5, color=PALETTE["brown"], bold=True)
        draw_text(c, value, x, 146, 120, 28, font="YaHeiBold", size=22, color=PALETTE["text"])
        draw_text(c, note, x, 178, 140, 54, size=11.2, color=PALETTE["body"])
        x += 188
    rounded_box(c, 60, 284, 360, 166, PALETTE["card"])
    draw_text(c, "Why this matters for judges", 82, 308, 220, 22, font="YaHeiBold", size=18, color=PALETTE["text"])
    draw_bullets(
        c,
        [
            "This is a working local product, not only a concept.",
            "The flow is coherent enough to demo in under five minutes.",
            "The team thought about responsibility, not only features.",
        ],
        82,
        340,
        300,
        86,
        12,
    )
    draw_image(c, CROP_DIR / "caseboard-crop.png", 458, 284, 172, 166, with_frame=True)
    draw_image(c, CROP_DIR / "followup-crop.png", 656, 284, 226, 166, with_frame=True)
    c.showPage()


def closing_page(c):
    add_page(c)
    draw_text(c, "CAREBRIDGE / 医路桥", 54, 38, 220, 16, size=9.5, color=PALETTE["brown"], bold=True)
    draw_text(c, "Helping patients reach care<br/>earlier, safer, and better prepared.", 52, 82, 430, 90, font="YaHeiBold", size=27, color=PALETTE["text"], leading=29)
    draw_text(c, "Not a diagnosis engine.<br/>A better first step into the healthcare system.", 56, 196, 310, 54, size=15, color=PALETTE["body"])
    draw_image(c, CROP_DIR / "hero-crop.png", 490, 84, 356, 164, with_frame=True)
    draw_image(c, CROP_DIR / "caseboard-crop.png", 490, 280, 356, 120, with_frame=True)
    pill(c, "Healthcare accessibility", 56, 414, 126, PALETTE["orange_soft"])
    pill(c, "Responsible AI", 194, 414, 104, PALETTE["mint"])
    pill(c, "Hackathon-ready MVP", 310, 414, 136, PALETTE["orange_soft"])
    c.showPage()


def render_preview(pdf_path: Path, out_dir: Path):
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(pdf_path)
    for i, page in enumerate(doc):
      pix = page.get_pixmap(matrix=fitz.Matrix(1.8, 1.8), alpha=False)
      pix.save(out_dir / f"page-{i+1}.png")
    doc.close()


def main():
    c = canvas.Canvas(str(OUT_PDF), pagesize=(PAGE_W, PAGE_H))
    cover_page(c)
    problem_page(c)
    audience_page(c)
    solution_page(c)
    workflow_page(c)
    product_page(c)
    safety_page(c)
    execution_page(c)
    closing_page(c)
    c.save()
    render_preview(OUT_PDF, PREVIEW_DIR)
    print(f"PDF written to {OUT_PDF}")
    print(f"Preview rendered to {PREVIEW_DIR}")


if __name__ == "__main__":
    main()

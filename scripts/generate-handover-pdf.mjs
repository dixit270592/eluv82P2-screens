import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mdPath = join(root, "docs", "REPORT_CENTER_DEVELOPER_HANDOVER.md");
const htmlPath = join(root, "docs", "REPORT_CENTER_DEVELOPER_HANDOVER.html");
const pdfPath = join(root, "docs", "REPORT_CENTER_DEVELOPER_HANDOVER.pdf");

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function mdToHtml(md) {
  const lines = md.split("\n");
  const out = [];
  let inCode = false;
  let inTable = false;
  let listOpen = false;

  const closeList = () => {
    if (listOpen) {
      out.push("</ul>");
      listOpen = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith("```")) {
      closeList();
      if (!inCode) {
        out.push("<pre><code>");
        inCode = true;
      } else {
        out.push("</code></pre>");
        inCode = false;
      }
      continue;
    }
    if (inCode) {
      out.push(escapeHtml(line));
      continue;
    }

    if (line.startsWith("|") && line.endsWith("|")) {
      closeList();
      if (!inTable) {
        out.push("<table>");
        inTable = true;
      }
      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) continue;
      const tag = inTable && out[out.length - 1] === "<table>" ? "th" : "td";
      out.push(
        `<tr>${cells.map((c) => `<${tag}>${inline(c)}</${tag}>`).join("")}</tr>`,
      );
      continue;
    } else if (inTable) {
      out.push("</table>");
      inTable = false;
    }

    if (line === "---") {
      closeList();
      out.push("<hr/>");
      continue;
    }
    if (line.startsWith("# ")) {
      closeList();
      out.push(`<h1>${inline(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith("## ")) {
      closeList();
      out.push(`<h2>${inline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("### ")) {
      closeList();
      out.push(`<h3>${inline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("- [ ] ")) {
      if (!listOpen) {
        out.push("<ul class='checklist'>");
        listOpen = true;
      }
      out.push(`<li><input type='checkbox' disabled/> ${inline(line.slice(6))}</li>`);
      continue;
    }
    if (line.startsWith("- ")) {
      if (!listOpen) {
        out.push("<ul>");
        listOpen = true;
      }
      out.push(`<li>${inline(line.slice(2))}</li>`);
      continue;
    }

    closeList();
    if (line === "") {
      out.push("");
      continue;
    }
    out.push(`<p>${inline(line)}</p>`);
  }

  closeList();
  if (inTable) out.push("</table>");
  if (inCode) out.push("</code></pre>");
  return out.join("\n");
}

function inline(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

const md = readFileSync(mdPath, "utf8");
const body = mdToHtml(md);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Report Center — Developer Handover</title>
  <style>
    @page { margin: 18mm 16mm; size: A4; }
    * { box-sizing: border-box; }
    body {
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.45;
      color: #101828;
      max-width: 900px;
      margin: 0 auto;
      padding: 24px;
    }
    h1 { font-size: 22pt; color: #1E2D3D; border-bottom: 2px solid #1FA97A; padding-bottom: 8px; margin-top: 0; }
    h2 { font-size: 14pt; color: #1E2D3D; margin-top: 24px; page-break-after: avoid; }
    h3 { font-size: 12pt; color: #344054; margin-top: 16px; page-break-after: avoid; }
    p { margin: 6px 0 10px; }
    hr { border: none; border-top: 1px solid #E4E7EC; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0 16px; font-size: 10pt; page-break-inside: avoid; }
    th, td { border: 1px solid #D0D5DD; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #F9FAFB; font-weight: 600; }
    code, pre { font-family: Consolas, monospace; font-size: 9pt; }
    pre { background: #F9FAFB; border: 1px solid #E4E7EC; padding: 10px; border-radius: 6px; overflow-x: auto; white-space: pre-wrap; }
    ul { margin: 6px 0 12px 18px; }
    li { margin: 4px 0; }
    .checklist { list-style: none; padding-left: 0; }
    .checklist li { margin: 6px 0; }
    strong { color: #1E2D3D; }
  </style>
</head>
<body>
${body}
</body>
</html>`;

writeFileSync(htmlPath, html, "utf8");

const browsers = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

const browser = browsers.find((p) => existsSync(p));
if (!browser) {
  console.error("No Chrome/Edge found. HTML saved at:", htmlPath);
  console.error("Open the HTML file in a browser and use Print → Save as PDF.");
  process.exit(1);
}

const fileUrl = `file:///${htmlPath.replace(/\\/g, "/")}`;
execSync(
  `"${browser}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${fileUrl}"`,
  { stdio: "inherit" },
);

if (existsSync(pdfPath)) {
  console.log("PDF created:", pdfPath);
} else {
  console.error("PDF generation failed. HTML available at:", htmlPath);
  process.exit(1);
}

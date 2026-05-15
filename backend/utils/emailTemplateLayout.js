/**
 * eConfMate Email Template Layout Engine
 * 
 * Design Architecture:
 * - Background Canvas: #F1F5F9 (cool slate-grey)
 * - Main Container: 600px, centered, white card
 * - Top Accent: 4px gradient bar (#2D9CDB → #0F172A)
 * - Typography: System sans-serif (Inter, Roboto, System UI)
 * - No emojis — uses inline SVG icons
 */

const LOGO_URL = 'https://econfmate.vercel.app/logo_1.png';
const PORTAL_URL = 'econfmate.vercel.app';

// ─── Inline SVG Icons (24px, monochrome stroke, #64748B) ───

const icons = {
  document: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  bell: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  edit: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  clipboard: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  upload: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>`,
  award: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  inbox: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  barchart: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`,
  alertTriangle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
};

// ─── Layout Builder ───

/**
 * Wraps email body content in the eConfMate branded layout.
 *
 * @param {Object} opts
 * @param {string} opts.title       - Headline text (centered, bold)
 * @param {string} opts.icon        - Key from `icons` map (e.g. 'document')
 * @param {string} opts.body        - Inner HTML body content
 * @param {string} [opts.buttonText]  - CTA button label
 * @param {string} [opts.buttonUrl]   - CTA button URL
 * @returns {string} Complete HTML email
 */
function buildEmailLayout({ title, icon, body, buttonText, buttonUrl }) {
  const iconSvg = icons[icon] || icons.document;
  const buttonHtml = buttonText
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:32px auto 0;">
        <tr>
          <td align="center" style="border-radius:6px;background:#0F172A;">
            <a href="https://${PORTAL_URL}" target="_blank" style="display:inline-block;padding:12px 32px;font-family:Inter,Roboto,'Segoe UI',sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;text-transform:uppercase;letter-spacing:0.5px;">${buttonText}</a>
          </td>
        </tr>
      </table>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#F1F5F9;font-family:Inter,Roboto,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#F1F5F9;">
<tr><td align="center" style="padding:40px 16px;">

  <!-- Main Card -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:0;">

    <!-- Gradient Top Bar -->
    <tr>
      <td style="height:4px;background:linear-gradient(90deg,#2D9CDB 0%,#0F172A 100%);font-size:0;line-height:0;">&nbsp;</td>
    </tr>

    <!-- Logo Section -->
    <tr>
      <td align="center" style="padding:40px 40px 24px;">
        <img src="${LOGO_URL}" alt="eConfMate" width="120" style="display:block;width:120px;height:auto;"/>
      </td>
    </tr>

    <!-- Icon -->
    <tr>
      <td align="center" style="padding:0 40px 16px;">
        ${iconSvg}
      </td>
    </tr>

    <!-- Title -->
    <tr>
      <td align="center" style="padding:0 40px 32px;">
        <h1 style="margin:0;font-family:Inter,Roboto,'Segoe UI',sans-serif;font-size:22px;font-weight:700;color:#0F172A;line-height:1.2;">${title}</h1>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding:0 40px;">
        ${body}
      </td>
    </tr>

    <!-- CTA Button -->
    <tr>
      <td style="padding:0 40px;">
        ${buttonHtml}
      </td>
    </tr>

    <!-- Separator + Footer -->
    <tr>
      <td style="padding:40px 40px 32px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td style="border-top:1px dashed #CBD5E1;font-size:0;line-height:0;padding:0;">&nbsp;</td></tr>
        </table>
        <p style="margin:24px 0 0;text-align:center;font-family:Inter,Roboto,'Segoe UI',sans-serif;font-size:13px;color:#94A3B8;">
          <a href="https://${PORTAL_URL}" target="_blank" style="color:#2D9CDB;text-decoration:none;">${PORTAL_URL}</a>
        </p>
      </td>
    </tr>

  </table>
  <!-- /Main Card -->

</td></tr>
</table>
</body>
</html>`;
}

// ─── Reusable content helpers ───

/** Renders a key-value metadata box */
function metadataBox(rows) {
  const rowsHtml = rows
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:6px 12px;font-family:Inter,Roboto,'Segoe UI',sans-serif;font-size:14px;color:#64748B;white-space:nowrap;vertical-align:top;">${label}</td>
          <td style="padding:6px 12px;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:14px;color:#0F172A;font-weight:600;">${value}</td>
        </tr>`
    )
    .join('');

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F8FAFC;border-radius:4px;margin:24px 0;">
    ${rowsHtml}
  </table>`;
}

/** Renders body paragraph text */
function bodyText(html) {
  return `<p style="margin:0 0 16px;font-family:Inter,Roboto,'Segoe UI',sans-serif;font-size:15px;color:#475569;line-height:1.6;text-align:left;">${html}</p>`;
}

/** Renders a highlighted quote/feedback block */
function feedbackBlock(content) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:16px 0;">
    <tr>
      <td style="background:#F8FAFC;border-left:3px solid #2D9CDB;border-radius:4px;padding:16px 20px;font-family:Inter,Roboto,'Segoe UI',sans-serif;font-size:14px;color:#334155;line-height:1.6;font-style:italic;">
        ${content}
      </td>
    </tr>
  </table>`;
}

/** Renders an ordered list */
function orderedList(items) {
  const lis = items.map(item => `<li style="margin:0 0 8px;font-family:Inter,Roboto,'Segoe UI',sans-serif;font-size:15px;color:#475569;line-height:1.6;">${item}</li>`).join('');
  return `<ol style="margin:0 0 16px;padding-left:20px;">${lis}</ol>`;
}

module.exports = {
  buildEmailLayout,
  metadataBox,
  bodyText,
  feedbackBlock,
  orderedList,
  icons,
  PORTAL_URL,
};

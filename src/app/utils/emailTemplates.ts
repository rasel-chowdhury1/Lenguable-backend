const BRAND = '#A9F877';
const DARK  = '#111827';
const YEAR  = new Date().getFullYear();

// ─── Shared layout shell ────────────────────────────────────────────────────
const shell = (
  icon: string,
  accentBg: string,
  accentLabel: string,
  title: string,
  subtitle: string,
  body: string,
) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#111827 0%,#1f2937 100%);border-radius:12px 12px 0 0;padding:36px 40px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td>
                <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:2px;color:${BRAND};text-transform:uppercase;">Lenguable</p>
                <h1 style="margin:0 0 6px;font-size:26px;font-weight:700;color:#ffffff;line-height:1.2;">${title}</h1>
                <p style="margin:0;font-size:14px;color:#9ca3af;">${subtitle}</p>
              </td>
              <td align="right" style="vertical-align:top;">
                <div style="width:54px;height:54px;background:rgba(169,248,119,0.12);border-radius:50%;text-align:center;line-height:54px;font-size:24px;">${icon}</div>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- Accent bar -->
        <tr>
          <td style="background:${accentBg};padding:12px 40px;">
            <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:1.5px;color:${DARK};text-transform:uppercase;">${accentLabel}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 40px;">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:${DARK};border-radius:0 0 12px 12px;padding:22px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td>
                <p style="margin:0;font-size:13px;font-weight:700;color:${BRAND};">Lenguable</p>
                <p style="margin:3px 0 0;font-size:11px;color:#6b7280;">This is an automated message. Please do not reply.</p>
              </td>
              <td align="right">
                <p style="margin:0;font-size:11px;color:#4b5563;">&copy; ${YEAR} Lenguable</p>
              </td>
            </tr></table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ─── 2-column detail card ────────────────────────────────────────────────────
const detailCard = (rows: { label: string; value: string }[][], extra?: string) => `
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:28px;">
  <tr>
    <td colspan="2" style="background:#f9fafb;padding:12px 20px;border-bottom:1px solid #e5e7eb;">
      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#6b7280;text-transform:uppercase;">Class Details</p>
    </td>
  </tr>
  ${rows.map((pair, ri) => `
  <tr>
    ${pair.map((cell, ci) => `
    <td style="padding:14px 20px;width:50%;${ri < rows.length - 1 || extra ? 'border-bottom:1px solid #f3f4f6;' : ''}${ci === 1 ? 'border-left:1px solid #f3f4f6;' : ''}vertical-align:top;">
      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.8px;color:#9ca3af;text-transform:uppercase;">${cell.label}</p>
      <p style="margin:5px 0 0;font-size:15px;font-weight:600;color:#111827;">${cell.value}</p>
    </td>`).join('')}
  </tr>`).join('')}
  ${extra ? `
  <tr>
    <td colspan="2" style="padding:14px 20px;">
      ${extra}
    </td>
  </tr>` : ''}
</table>`;

// ─── Single-column info list ─────────────────────────────────────────────────
const infoList = (rows: { label: string; value: string; highlight?: boolean }[]) => `
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:28px;">
  ${rows.map(({ label, value, highlight }, i) => `
  <tr style="${highlight ? 'background:#f0fdf4;' : i % 2 === 0 ? 'background:#f9fafb;' : 'background:#ffffff;'}">
    <td style="padding:12px 20px;width:38%;font-size:12px;font-weight:700;letter-spacing:0.5px;color:#6b7280;text-transform:uppercase;${i < rows.length - 1 ? 'border-bottom:1px solid #f3f4f6;' : ''}border-right:1px solid #f3f4f6;">${label}</td>
    <td style="padding:12px 20px;font-size:14px;font-weight:600;color:${highlight ? '#15803d' : '#111827'};${i < rows.length - 1 ? 'border-bottom:1px solid #f3f4f6;' : ''}">${value}</td>
  </tr>`).join('')}
</table>`;

// ─── Dark CTA button ─────────────────────────────────────────────────────────
const darkBtn = (href: string, text: string) => `
<table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
  <tr>
    <td style="border-radius:8px;background:#111827;">
      <a href="${href}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#A9F877;text-decoration:none;letter-spacing:0.3px;">${text} &rarr;</a>
    </td>
  </tr>
</table>`;

// ─── Greeting paragraph ───────────────────────────────────────────────────────
const greeting = (name: string, msg: string) =>
  `<p style="margin:0 0 28px;font-size:16px;color:#374151;line-height:1.7;">Hi <strong style="color:#111827;">${name}</strong>,<br/>${msg}</p>`;


// ════════════════════════════════════════════════════════════════════════════
// Templates
// ════════════════════════════════════════════════════════════════════════════

export const bookingConfirmation = (d: {
  recipientName: string;
  teacherName: string;
  studentName: string;
  studentEmail: string;
  formattedDate: string;
  formattedTime: string;
  meetLink: string;
}) => shell(
  '&#10003;',
  BRAND,
  '&#10003;&nbsp; Booking Confirmed',
  'Class Booking Confirmed',
  'Your class has been successfully scheduled',
  `${greeting(d.recipientName, 'Your class has been confirmed. Here are the details for your upcoming session.')}
  ${detailCard([
    [{ label: 'Date', value: d.formattedDate }, { label: 'Time', value: d.formattedTime }],
    [{ label: 'Teacher', value: d.teacherName }, { label: 'Student', value: d.studentName }],
  ], `<p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.8px;color:#9ca3af;text-transform:uppercase;">Student Email</p>
      <p style="margin:5px 0 0;font-size:15px;font-weight:600;color:#111827;">${d.studentEmail}</p>`)}
  ${darkBtn(d.meetLink, 'Join Class Now')}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
    <tr><td style="padding:16px 20px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1px;color:#6b7280;text-transform:uppercase;">Before your class</p>
      <p style="margin:0 0 5px;font-size:13px;color:#374151;">&#10003;&nbsp; Test your microphone and camera</p>
      <p style="margin:0 0 5px;font-size:13px;color:#374151;">&#10003;&nbsp; Find a quiet space with good internet</p>
      <p style="margin:0;font-size:13px;color:#374151;">&#10003;&nbsp; Join a few minutes early</p>
    </td></tr>
  </table>`,
);

export const cancellationNotification = (d: {
  recipientName: string;
  cancelledBy: string;
  teacherName: string;
  studentName: string;
  formattedDate: string;
  formattedTime: string;
  reason: string;
  refunded: boolean;
}) => shell(
  '&#10005;',
  '#fee2e2',
  '&#9888;&nbsp; Class Cancelled',
  'Class Cancelled',
  'A scheduled class has been cancelled',
  `${greeting(d.recipientName, `Your class has been cancelled by the <strong style="color:#111827;">${d.cancelledBy}</strong>. Please review the details below.`)}
  ${detailCard([
    [{ label: 'Date', value: d.formattedDate }, { label: 'Time', value: d.formattedTime }],
    [{ label: 'Teacher', value: d.teacherName }, { label: 'Student', value: d.studentName }],
  ])}
  ${infoList([
    { label: 'Cancelled By', value: d.cancelledBy.charAt(0).toUpperCase() + d.cancelledBy.slice(1) },
    { label: 'Reason', value: d.reason },
    {
      label: 'Credit Refunded',
      value: d.refunded ? 'Yes — 1 credit returned to student' : 'No — cancelled within 24 hours',
      highlight: d.refunded,
    },
  ])}
  <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
    If you have any questions about this cancellation, please contact our support team.
  </p>`,
);

export const forgotPassword = (d: { name: string; resetUILink: string }) => shell(
  '&#128274;',
  '#dbeafe',
  '&#128274;&nbsp; Account Security',
  'Password Reset Request',
  'We received a request to reset your password',
  `${greeting(d.name, 'We received a password reset request for your Lenguable account. Click the button below to create a new password.')}
  ${darkBtn(d.resetUILink, 'Reset My Password')}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef9c3;border-radius:8px;border:1px solid #fde68a;">
    <tr><td style="padding:16px 20px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:1px;color:#92400e;text-transform:uppercase;">&#9888; Important</p>
      <p style="margin:0;font-size:13px;color:#78350f;line-height:1.6;">This link expires in <strong>10 minutes</strong>. If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.</p>
    </td></tr>
  </table>`,
);

export const otp = (d: { name: string; otp: string }) => shell(
  '&#128737;',
  BRAND,
  '&#128737;&nbsp; Verification Required',
  'Your Verification Code',
  'Use this code to complete your sign-in',
  `${greeting(d.name, 'Use the one-time code below to verify your identity. Do not share this code with anyone.')}
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
    <tr>
      <td align="center" style="background:#f9fafb;border:2px dashed #e5e7eb;border-radius:10px;padding:32px 20px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:2px;color:#6b7280;text-transform:uppercase;">One-Time Code</p>
        <p style="margin:0;font-size:42px;font-weight:700;color:#111827;letter-spacing:10px;font-family:'Courier New',monospace;">${d.otp}</p>
      </td>
    </tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef9c3;border-radius:8px;border:1px solid #fde68a;">
    <tr><td style="padding:14px 20px;">
      <p style="margin:0;font-size:13px;color:#78350f;">&#9201;&nbsp; This code is valid for <strong>2 minutes</strong>. Do not share it with anyone.</p>
    </td></tr>
  </table>`,
);

export const reminder = (d: {
  recipientName: string;
  timeLabel: string;
  date: string;
  formattedDate: string;
  formattedTime: string;
  teacherName: string;
  studentName: string;
  meetLink?: string;
}) => shell(
  '&#128276;',
  BRAND,
  `&#9200;&nbsp; Starting in &mdash; ${d.timeLabel}`,
  'Class Reminder',
  'Your upcoming class is approaching',
  `${greeting(d.recipientName, 'This is a friendly reminder that your class is coming up soon. Please make sure you&rsquo;re ready before the session starts.')}
  ${detailCard([
    [{ label: 'Date', value: d.formattedDate }, { label: 'Time', value: d.formattedTime }],
    [{ label: 'Teacher', value: d.teacherName }, { label: 'Student', value: d.studentName }],
  ])}
  ${d.meetLink ? darkBtn(d.meetLink, 'Join Class Now') : ''}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
    <tr><td style="padding:16px 20px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1px;color:#6b7280;text-transform:uppercase;">Quick checklist</p>
      <p style="margin:0 0 5px;font-size:13px;color:#374151;">&#10003;&nbsp; Test your microphone and camera</p>
      <p style="margin:0 0 5px;font-size:13px;color:#374151;">&#10003;&nbsp; Find a quiet spot with a stable connection</p>
      <p style="margin:0;font-size:13px;color:#374151;">&#10003;&nbsp; Join a few minutes early — good luck!</p>
    </td></tr>
  </table>`,
);

export const reviewRequest = (d: {
  studentName: string;
  teacherName: string;
  date: string;
  startTime: string;
  reviewLink: string;
}) => shell(
  '&#11088;',
  '#fef9c3',
  '&#11088;&nbsp; Class Completed',
  'How Was Your Class?',
  'We\'d love to hear your feedback',
  `${greeting(d.studentName, `Your class with <strong style="color:#111827;">${d.teacherName}</strong> has been completed. Your feedback helps our teachers grow and helps other students make great choices.`)}
  ${infoList([
    { label: 'Teacher', value: d.teacherName },
    { label: 'Date',    value: d.date },
    { label: 'Time',    value: d.startTime },
  ])}
  ${darkBtn(d.reviewLink, 'Leave a Review')}
  <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
    Your review takes less than a minute and makes a big difference. Thank you for being part of the Lenguable community!
  </p>`,
);


export const paymentSuccess = (d: {
  studentName: string;
  packageName: string;
  credits: number;
  originalPrice: number;
  discountCode?: string | null;
  discountAmount: number;
  finalAmount: number;
  date: string;
}) => {
  const rows: { label: string; value: string; highlight?: boolean }[] = [
    { label: 'Package',        value: d.packageName },
    { label: 'Credits Added',  value: `${d.credits} credits` },
    { label: 'Original Price', value: `$${d.originalPrice.toFixed(2)}` },
  ];

  if (d.discountCode) {
    rows.push({ label: 'Discount Code',   value: d.discountCode });
    rows.push({ label: 'Discount Saved',  value: `-$${d.discountAmount.toFixed(2)}`, highlight: true });
  }

  rows.push({ label: 'Total Paid', value: `$${d.finalAmount.toFixed(2)}`, highlight: true });
  rows.push({ label: 'Date',       value: d.date });

  return shell(
    '&#10003;',
    BRAND,
    '&#10003;&nbsp; Payment Successful',
    'Payment Confirmed',
    'Your purchase has been processed successfully',
    `${greeting(d.studentName, 'Thank you for your purchase! Your credits have been added to your account and you\'re all set to book classes.')}
    ${infoList(rows)}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;margin-top:8px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1px;color:#15803d;text-transform:uppercase;">&#10003;&nbsp; What's next?</p>
        <p style="margin:0 0 5px;font-size:13px;color:#166534;">Browse available teachers and book your first class.</p>
        <p style="margin:0;font-size:13px;color:#166534;">Your ${d.credits} credits are ready to use immediately.</p>
      </td></tr>
    </table>`,
  );
};

export const templates: Record<string, (data: any) => string> = {
  bookingConfirmation,
  cancellationNotification,
  forgotPassword,
  otp,
  reminder,
  reviewRequest,
  paymentSuccess,
};

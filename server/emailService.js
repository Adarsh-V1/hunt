import path from "node:path";
import nodemailer from "nodemailer";

const ACCEPTED_EXTENSIONS = new Set([".pdf", ".docx"]);
const ACCEPTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const readEnvValue = (...keys) => {
  for (const key of keys) {
    const value = process.env[key];
    if (value) return value;
  }
  return "";
};

const getMimeTypeFromFilename = (filename) => {
  const extension = path.extname(filename || "").toLowerCase();

  if (extension === ".pdf") return "application/pdf";
  if (extension === ".docx")
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  return "";
};

const validateAttachmentFile = (file) => {
  if (!file || !file.buffer) {
    throw new Error("A resume attachment is required.");
  }

  const filename = file.originalname || file.filename || "";
  const extension = path.extname(filename).toLowerCase();

  if (!ACCEPTED_EXTENSIONS.has(extension)) {
    throw new Error("Resume attachments must be PDF or DOCX files.");
  }

  const contentType = ACCEPTED_MIME_TYPES.has(file.mimetype)
    ? file.mimetype
    : getMimeTypeFromFilename(filename);
  if (!contentType) {
    throw new Error("Could not determine the resume attachment type.");
  }

  return {
    filename,
    content: file.buffer,
    contentType,
  };
};

const getSmtpConfig = () => {
  const host = readEnvValue("MAIL_HOST", "SMTP_HOST");
  const portValue = readEnvValue("MAIL_PORT", "SMTP_PORT");
  const user = readEnvValue("MAIL_USER", "SMTP_USER");
  const pass = readEnvValue("MAIL_PASS", "SMTP_PASS");
  const from = readEnvValue("MAIL_FROM", "SMTP_FROM") || user;
  const port = Number.parseInt(portValue, 10);
  const secure = String(readEnvValue("MAIL_SECURE", "SMTP_SECURE") || "")
    .trim()
    .toLowerCase() === "true";

  if (!host) throw new Error("MAIL_HOST is required.");
  if (!Number.isInteger(port) || port <= 0) throw new Error("MAIL_PORT must be a valid number.");
  if (!user) throw new Error("MAIL_USER is required.");
  if (!pass) throw new Error("MAIL_PASS is required.");
  if (!from) throw new Error("MAIL_FROM is required.");

  return { host, port, user, pass, from, secure };
};

const validateRecipientList = (recipientEmail) => {
  const recipients = String(recipientEmail || "")
    .split(/[;,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (!recipients.length) {
    throw new Error("Recipient email is required.");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidRecipient = recipients.find((recipient) => !emailPattern.test(recipient));
  if (invalidRecipient) {
    throw new Error(`Invalid recipient email: ${invalidRecipient}`);
  }

  return recipients.join(", ");
};

const validateTextField = (value, fieldName) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    throw new Error(`${fieldName} is required.`);
  }

  return trimmed;
};

export const sendApplicationEmail = async ({
  companyId,
  recipientEmail,
  subject,
  body,
  companyName,
  roleTarget,
  resumeFile,
}) => {
  const smtp = getSmtpConfig();
  const to = validateRecipientList(recipientEmail);
  const finalSubject = validateTextField(subject, "Subject");
  const finalBody = validateTextField(body, "Body");
  const finalCompanyName = String(companyName || "").trim();
  const finalTargetRole = String(roleTarget || "").trim();
  const attachment = validateAttachmentFile(resumeFile);

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  const message = {
    from: smtp.from,
    to,
    subject: finalSubject,
    text: finalBody,
    replyTo: smtp.user,
    attachments: [
      {
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      },
    ],
  };

  const sendResult = await transporter.sendMail(message);

  return {
    companyId: companyId || "",
    messageId: sendResult.messageId || "",
    response: sendResult.response || "",
    accepted: sendResult.accepted || [],
    rejected: sendResult.rejected || [],
    envelope: sendResult.envelope || null,
    recipientEmail: to,
    companyName: finalCompanyName,
    targetRole: finalTargetRole,
    resumeFileName: attachment.filename,
    from: smtp.from,
  };
};

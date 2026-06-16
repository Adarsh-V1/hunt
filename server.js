import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { sendApplicationEmail } from "./server/emailService.js";
import {
  findTrackerCompany,
  recordApplicationEmailFailure,
  recordApplicationEmailSent,
} from "./server/trackerData.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === "production";
const port = Number.parseInt(process.env.PORT || "4173", 10);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
const ACCEPTED_RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ACCEPTED_RESUME_EXTENSIONS = new Set([".pdf", ".docx"]);

const app = express();

const createValidationError = (message, code = "VALIDATION_ERROR") => {
  const error = new Error(message);
  error.statusCode = 400;
  error.code = code;
  return error;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidRecipientList = (value) =>
  String(value || "")
    .split(/[;,]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .every((email) => EMAIL_PATTERN.test(email));

const classifyEmailSendError = (error) => {
  const message = error?.message || "Failed to send application email.";
  const lowerMessage = message.toLowerCase();

  if (
    error?.code === "EAUTH" ||
    lowerMessage.includes("invalid login") ||
    lowerMessage.includes("authentication failed") ||
    lowerMessage.includes("username and password not accepted") ||
    lowerMessage.includes("535")
  ) {
    return {
      statusCode: 401,
      code: "SMTP_AUTH_FAILED",
      message: "SMTP login failed.",
    };
  }

  if (
    lowerMessage.includes("daily user sending quota exceeded") ||
    lowerMessage.includes("daily sending limit") ||
    lowerMessage.includes("quota exceeded")
  ) {
    return {
      statusCode: 429,
      code: "SMTP_DAILY_LIMIT",
      message: "Daily sending limit reached.",
    };
  }

  return {
    statusCode: 500,
    code: "SMTP_SEND_FAILED",
    message,
  };
};

const isAcceptedResumeFile = (file) => {
  if (!file) return false;

  const filename = String(file.originalname || "").toLowerCase();
  const extension = path.extname(filename);
  const mimeType = String(file.mimetype || "").toLowerCase();

  return (
    ACCEPTED_RESUME_EXTENSIONS.has(extension) &&
    (!mimeType ||
      mimeType === "application/octet-stream" ||
      ACCEPTED_RESUME_MIME_TYPES.has(mimeType))
  );
};

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.post("/api/send-application-email", upload.single("resume"), async (req, res) => {
  let trackerCompany = null;
  let companyIdValue = null;
  let companyName = "";
  let recipientEmail = "";

  try {
    companyIdValue = Number.parseInt(String(req.body.companyId || "").trim(), 10);
    companyName = String(req.body.companyName || "").trim();
    const roleTarget = String(req.body.roleTarget || req.body.targetRole || "").trim();
    recipientEmail = String(req.body.recipientEmail || "").trim();
    const subject = String(req.body.subject || "").trim();
    const body = String(req.body.body || "").trim();

    if (!Number.isInteger(companyIdValue) || companyIdValue <= 0) {
      throw createValidationError("companyId is required.");
    }

    if (!companyName) {
      throw createValidationError("companyName is required.");
    }

    if (!recipientEmail) {
      throw createValidationError("recipientEmail is required.");
    }

    if (!isValidRecipientList(recipientEmail)) {
      throw createValidationError("recipientEmail must be a valid email address.");
    }

    if (!subject) {
      throw createValidationError("subject is required.");
    }

    if (!body) {
      throw createValidationError("body is required.");
    }

    if (!req.file) {
      throw createValidationError("resume file is required.");
    }

    if (!isAcceptedResumeFile(req.file)) {
      throw createValidationError("resume file must be PDF or DOCX.");
    }

    trackerCompany = await findTrackerCompany({ companyId: companyIdValue, companyName });
    if (!trackerCompany) {
      res.status(404).json({
        ok: false,
        error: "Company not found in tracker data.",
        code: "TRACKER_COMPANY_NOT_FOUND",
      });
      return;
    }

    if (Number.isInteger(trackerCompany.id) && trackerCompany.id !== companyIdValue) {
      throw createValidationError("companyId does not match the tracker record.");
    }

    const result = await sendApplicationEmail({
      companyId: companyIdValue,
      recipientEmail,
      subject,
      body,
      companyName,
      roleTarget,
      resumeFile: req.file || null,
    });

    const updatedCompany = await recordApplicationEmailSent({
      companyId: companyIdValue,
      companyName,
      recipientEmail: result.recipientEmail,
      resumeFileName: result.resumeFileName,
      message: "Email sent successfully.",
    });

    res.json({
      ok: true,
      message: "Email sent successfully.",
      result,
      company: updatedCompany,
    });
  } catch (error) {
    const classified = error?.statusCode
      ? {
          statusCode: error.statusCode,
          code: error.code || "VALIDATION_ERROR",
          message: error.message || "Failed to send application email.",
        }
      : classifyEmailSendError(error);

    const shouldRecordFailureNote =
      trackerCompany &&
      !error?.statusCode &&
      classified.code !== "SMTP_AUTH_FAILED";

    if (shouldRecordFailureNote) {
      try {
        await recordApplicationEmailFailure({
          companyId: companyIdValue,
          companyName,
          recipientEmail,
          message: classified.message,
        });
      } catch {
        // Swallow tracker-note failures so the API can return the original SMTP error cleanly.
      }
    }

    res.status(classified.statusCode).json({
      ok: false,
      error: classified.message,
      code: classified.code,
    });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    res.status(400).json({
      ok: false,
      error:
        error.code === "LIMIT_FILE_SIZE"
          ? "Resume attachment is too large. Please keep it under 10 MB."
          : error.message,
    });
    return;
  }

  next(error);
});

if (!isProduction) {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
    },
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use(async (req, res, next) => {
    if (req.originalUrl.startsWith("/api")) {
      return next();
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }

    try {
      const url = req.originalUrl;
      const template = await fs.readFile(path.resolve(__dirname, "index.html"), "utf-8");
      const html = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (error) {
      vite.ssrFixStacktrace(error);
      next(error);
    }
  });
} else {
  const distPath = path.resolve(__dirname, "dist");
  app.use(express.static(distPath));

  app.use(async (req, res, next) => {
    if (req.originalUrl.startsWith("/api")) {
      return next();
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }

    try {
      const html = await fs.readFile(path.resolve(distPath, "index.html"), "utf-8");
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (error) {
      next(error);
    }
  });
}

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  res.status(500).json({
    ok: false,
    error: error?.message || "Unexpected server error.",
  });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Tracker server running on http://localhost:${port}`);
});

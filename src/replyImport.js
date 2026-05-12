const cleanText = (value) => String(value || "").replace(/\s+/g, " ").trim();

const normalizeEmail = (value) => cleanText(value).toLowerCase();

const stripHtml = (value) =>
  cleanText(
    String(value || "")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&#39;/gi, "'")
      .replace(/&quot;/gi, '"'),
  );

const decodeQuotedPrintable = (value) =>
  String(value || "")
    .replace(/=\r?\n/g, "")
    .replace(/=([A-F0-9]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

const decodeBase64 = (value) => {
  const sanitized = String(value || "").replace(/\s+/g, "");
  if (!sanitized || sanitized.length % 4 === 1 || /[^A-Za-z0-9+/=]/.test(sanitized)) {
    return String(value || "");
  }

  try {
    return decodeURIComponent(
      Array.from(atob(sanitized))
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );
  } catch {
    return String(value || "");
  }
};

const extractEmailAddress = (value) => {
  const match = String(value || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return normalizeEmail(match?.[0] || "");
};

const toIsoDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString();
};

const inferSentiment = ({ subject, summary }) => {
  const text = cleanText(`${subject} ${summary}`).toLowerCase();

  if (
    /\b(interview|technical round|coding round|assessment|shortlist|availability|schedule|screening call)\b/.test(
      text,
    )
  ) {
    return "interview";
  }

  if (
    /\b(regret|unfortunately|not selected|not moving forward|reject|declin|position has been filled)\b/.test(
      text,
    )
  ) {
    return "declined";
  }

  if (/\b(thank you for applying|received your application|next steps|move forward)\b/.test(text)) {
    return "positive";
  }

  return "neutral";
};

const summarizeBody = (value) => {
  const cleaned = cleanText(value)
    .replace(/^>.*$/gm, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "";
  return cleaned.slice(0, 320);
};

const parseHeaders = (headerText) => {
  const lines = String(headerText || "").replace(/\r\n/g, "\n").split("\n");
  const headers = [];
  let current = null;

  lines.forEach((line) => {
    if (!line) return;

    if (/^[ \t]/.test(line) && current) {
      current.value += ` ${line.trim()}`;
      return;
    }

    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) return;

    current = {
      name: line.slice(0, separatorIndex).trim(),
      value: line.slice(separatorIndex + 1).trim(),
    };
    headers.push(current);
  });

  return headers;
};

const getHeader = (headers, name) =>
  headers.find((header) => header.name.toLowerCase() === name.toLowerCase())?.value || "";

const parseMimeSection = (sectionText, fallbackContentType = "", fallbackEncoding = "") => {
  const normalized = String(sectionText || "").replace(/\r\n/g, "\n");
  const dividerIndex = normalized.indexOf("\n\n");
  const headerText = dividerIndex === -1 ? "" : normalized.slice(0, dividerIndex);
  const bodyText = dividerIndex === -1 ? normalized : normalized.slice(dividerIndex + 2);
  const headers = parseHeaders(headerText);
  const contentType = getHeader(headers, "Content-Type") || fallbackContentType;
  const encoding = (getHeader(headers, "Content-Transfer-Encoding") || fallbackEncoding).toLowerCase();
  const boundaryMatch = contentType.match(/boundary="?([^";]+)"?/i);

  if (boundaryMatch) {
    const boundary = boundaryMatch[1];
    const parts = bodyText
      .split(`--${boundary}`)
      .map((part) => part.trim())
      .filter((part) => part && part !== "--");

    const preferredPart =
      parts.find((part) => /Content-Type:\s*text\/plain/i.test(part)) ||
      parts.find((part) => /Content-Type:\s*text\/html/i.test(part)) ||
      parts[0] ||
      "";

    return parseMimeSection(preferredPart);
  }

  let decodedBody = bodyText;
  if (encoding.includes("quoted-printable")) {
    decodedBody = decodeQuotedPrintable(decodedBody);
  } else if (encoding.includes("base64")) {
    decodedBody = decodeBase64(decodedBody);
  }

  if (/text\/html/i.test(contentType)) {
    return stripHtml(decodedBody);
  }

  return cleanText(decodedBody);
};

const parseSingleEmailMessage = (messageText, fallbackId) => {
  const normalized = String(messageText || "").replace(/\r\n/g, "\n").trim();
  if (!normalized) return null;

  const dividerIndex = normalized.indexOf("\n\n");
  const headerText = dividerIndex === -1 ? normalized : normalized.slice(0, dividerIndex);
  const bodyText = dividerIndex === -1 ? "" : normalized.slice(dividerIndex + 2);
  const headers = parseHeaders(headerText);
  const fromRaw = getHeader(headers, "From");
  const subject = cleanText(getHeader(headers, "Subject"));
  const date = toIsoDate(getHeader(headers, "Date"));
  const body = parseMimeSection(bodyText, getHeader(headers, "Content-Type"), getHeader(headers, "Content-Transfer-Encoding"));
  const summary = summarizeBody(body) || subject || "Reply imported from local email.";
  const from = extractEmailAddress(fromRaw);

  if (!from && !subject && !summary) return null;

  const sentiment = inferSentiment({ subject, summary });

  return {
    id: cleanText(getHeader(headers, "Message-ID")) || fallbackId,
    from,
    sender: fromRaw || from,
    subject,
    summary,
    snippet: summary,
    date,
    receivedAt: date,
    sentiment,
    status:
      sentiment === "interview" ? "Interview" : sentiment === "declined" ? "Declined" : "",
  };
};

const parseMboxMessages = (rawText) => {
  const normalized = String(rawText || "").replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const chunks = normalized
    .split(/\n(?=From [^\n]+\n)/g)
    .map((chunk) => chunk.replace(/^From [^\n]+\n/, "").trim())
    .filter(Boolean);

  return chunks
    .map((chunk, index) => parseSingleEmailMessage(chunk, `mbox-${index + 1}`))
    .filter(Boolean);
};

const parseJsonResponses = (value) => {
  const payload = JSON.parse(value);
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.responses)
      ? payload.responses
      : Array.isArray(payload.gmailResponses)
        ? payload.gmailResponses
        : Array.isArray(payload.messages)
          ? payload.messages
          : null;

  if (!items) {
    throw new Error("JSON must contain an array, responses, gmailResponses, or messages.");
  }

  return items
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;

      const from = normalizeEmail(
        item.from ||
          item.fromEmail ||
          item.sender ||
          item.author ||
          item.headers?.From ||
          item.matchEmail,
      );
      const sender = item.sender || item.from || item.author || from;
      const subject = cleanText(item.subject || item.title || "");
      const summary = cleanText(item.summary || item.snippet || item.body || item.text || item.preview || subject);
      const date = toIsoDate(item.date || item.receivedAt || item.internalDate || item.headers?.Date);
      const sentiment = item.sentiment || inferSentiment({ subject, summary });

      if (!from && !subject && !summary) return null;

      return {
        id: item.id || item.gmailMessageId || item.messageId || `json-${index + 1}`,
        from,
        sender,
        subject,
        summary,
        snippet: summary,
        date,
        receivedAt: date,
        sentiment,
        status:
          item.status ||
          (sentiment === "interview" ? "Interview" : sentiment === "declined" ? "Declined" : ""),
      };
    })
    .filter(Boolean);
};

const deriveSourceType = (text, fileName) => {
  const trimmed = String(text || "").trim();
  const extension = String(fileName || "").toLowerCase();

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json";
  if (extension.endsWith(".json")) return "json";
  if (extension.endsWith(".mbox")) return "mbox";
  if (extension.endsWith(".eml") || extension.endsWith(".mime")) return "email";
  if (/^From [^\n]+\n/i.test(trimmed) || /\nFrom [^\n]+\n/.test(trimmed)) return "mbox";
  return "email";
};

export function parseReplyImportSource({ text, fileName = "" }) {
  const sourceType = deriveSourceType(text, fileName);
  let responses = [];

  if (sourceType === "json") {
    responses = parseJsonResponses(text);
  } else if (sourceType === "mbox") {
    responses = parseMboxMessages(text);
  } else {
    const single = parseSingleEmailMessage(text, "email-1");
    responses = single ? [single] : [];
  }

  const filteredResponses = responses.filter((response) => response.from || response.sender || response.subject);

  if (!filteredResponses.length) {
    throw new Error(
      "No company replies were found. Use a Gmail Takeout .mbox, a raw .eml message, or JSON with sender email fields.",
    );
  }

  return {
    sourceType,
    responses: filteredResponses,
  };
}

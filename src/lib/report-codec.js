import { allChecks } from "../data/checks.js";
import { findCarrier } from "../data/carriers.js";
import { isValidModelCode } from "../data/devices.js";
import { normalizeAnswers } from "../domain/assessment.js";

const REPORT_VERSION = 1;
const MAX_TOKEN_LENGTH = 12_000;

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function toBase64Url(value) {
  return bytesToBase64(new TextEncoder().encode(value))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function fromBase64Url(value) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  return new TextDecoder("utf-8", { fatal: true }).decode(base64ToBytes(base64 + padding));
}

export function createReport({ modelCode, carrierId, answers, createdAt = new Date().toISOString() }) {
  return {
    version: REPORT_VERSION,
    createdAt,
    device: {
      modelCode: modelCode.trim().toUpperCase().replaceAll(" ", ""),
    },
    carrierId,
    answers: normalizeAnswers(answers),
  };
}

export function validateReport(candidate) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;
  if (candidate.version !== REPORT_VERSION) return null;
  if (!candidate.device || typeof candidate.device.modelCode !== "string") return null;
  if (!isValidModelCode(candidate.device.modelCode)) return null;
  if (!findCarrier(candidate.carrierId)) return null;

  const createdAt = new Date(candidate.createdAt);
  if (Number.isNaN(createdAt.valueOf())) return null;
  if (createdAt.valueOf() > Date.now() + 5 * 60 * 1000) return null;

  const knownIds = new Set(allChecks.map((check) => check.id));
  if (!candidate.answers || typeof candidate.answers !== "object") return null;
  if (Object.keys(candidate.answers).some((id) => !knownIds.has(id))) return null;

  return createReport({
    modelCode: candidate.device.modelCode,
    carrierId: candidate.carrierId,
    answers: candidate.answers,
    createdAt: createdAt.toISOString(),
  });
}

export function encodeReport(report) {
  const validReport = validateReport(report);
  if (!validReport) throw new TypeError("Invalid report");
  return `v${REPORT_VERSION}.${toBase64Url(JSON.stringify(validReport))}`;
}

export function decodeReport(token) {
  if (typeof token !== "string" || token.length > MAX_TOKEN_LENGTH) return null;
  if (!token.startsWith(`v${REPORT_VERSION}.`)) return null;

  try {
    const payload = token.slice(token.indexOf(".") + 1);
    return validateReport(JSON.parse(fromBase64Url(payload)));
  } catch {
    return null;
  }
}

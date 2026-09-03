import { checkGroups } from "../data/checks.js";

const ANSWERS = new Set(["pass", "fail", "unknown"]);

export function normalizeAnswers(input = {}) {
  const normalized = {};

  for (const group of Object.values(checkGroups)) {
    for (const check of group.checks) {
      normalized[check.id] = ANSWERS.has(input[check.id]) ? input[check.id] : "unknown";
    }
  }

  return normalized;
}

export function assessNetwork(inputAnswers) {
  const answers = normalizeAnswers(inputAnswers);
  const coreIds = ["simDetected", "voiceCall", "mobileData"];
  const coreValues = coreIds.map((id) => answers[id]);

  if (coreValues.includes("fail")) {
    return {
      id: "attention",
      label: "ظهرت مشكلة تحتاج تشخيصًا",
      tone: "danger",
    };
  }

  if (coreValues.every((value) => value === "pass") && answers.volteDuringCall === "pass") {
    return {
      id: "verified",
      label: "نجحت اختبارات الشبكة المنفذة",
      tone: "good",
    };
  }

  if (coreValues.some((value) => value === "pass")) {
    return {
      id: "partial",
      label: "نجح جزء من اختبارات الشبكة",
      tone: "warn",
    };
  }

  return {
    id: "unknown",
    label: "لم تُنفذ اختبارات شبكة كافية",
    tone: "neutral",
  };
}

export function assessPurchase(inputAnswers) {
  const answers = normalizeAnswers(inputAnswers);
  const consideredGroups = [checkGroups.network, checkGroups.hardware, checkGroups.locks];
  const checks = consideredGroups.flatMap((group) => group.checks);
  const failed = checks.filter((check) => answers[check.id] === "fail");
  const unknownCritical = checks.filter(
    (check) => check.severity === "critical" && answers[check.id] === "unknown",
  );

  if (failed.some((check) => check.severity === "critical")) {
    return {
      id: "stop",
      label: "توقف ولا تدفع قبل حل المشكلة",
      tone: "danger",
    };
  }

  if (failed.some((check) => check.severity === "high")) {
    return {
      id: "impactful",
      label: "ظهرت ملاحظات مؤثرة",
      tone: "warn",
    };
  }

  if (failed.length > 0) {
    return {
      id: "notes",
      label: "ظهرت ملاحظات تحتاج قرارًا",
      tone: "warn",
    };
  }

  if (unknownCritical.length > 0) {
    return {
      id: "incomplete",
      label: "الفحص غير مكتمل",
      tone: "neutral",
    };
  }

  return {
    id: "clear",
    label: "لم تظهر مشكلة في الفحوص المنفذة",
    tone: "good",
  };
}

export function summarizeAnswers(inputAnswers) {
  const answers = normalizeAnswers(inputAnswers);
  return Object.values(answers).reduce(
    (summary, value) => {
      summary[value] += 1;
      return summary;
    },
    { pass: 0, fail: 0, unknown: 0 },
  );
}

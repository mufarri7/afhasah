import test from "node:test";
import assert from "node:assert/strict";

import { allChecks } from "../src/data/checks.js";
import {
  assessNetwork,
  assessPurchase,
  normalizeAnswers,
  summarizeAnswers,
} from "../src/domain/assessment.js";

function answersWith(value) {
  return Object.fromEntries(allChecks.map((check) => [check.id, value]));
}

test("يعيد القيم غير المعروفة إلى لم يُختبر", () => {
  const answers = normalizeAnswers({ simDetected: "unexpected", voiceCall: "pass" });
  assert.equal(answers.simDetected, "unknown");
  assert.equal(answers.voiceCall, "pass");
  assert.equal(Object.keys(answers).length, allChecks.length);
});

test("يعتبر الفحص الكامل بلا ملاحظات واضحًا ضمن الاختبارات المنفذة", () => {
  const answers = answersWith("pass");
  assert.equal(assessPurchase(answers).id, "clear");
  assert.equal(assessNetwork(answers).id, "verified");
  assert.deepEqual(summarizeAnswers(answers), {
    pass: allChecks.length,
    fail: 0,
    unknown: 0,
  });
});

test("يوقف القرار عند فشل اختبار حرج", () => {
  const answers = answersWith("pass");
  answers.activationComplete = "fail";
  assert.equal(assessPurchase(answers).id, "stop");
});

test("لا يتجاهل فشل الاتصال الحرج عند قرار الشراء", () => {
  const answers = answersWith("pass");
  answers.voiceCall = "fail";
  assert.equal(assessNetwork(answers).id, "attention");
  assert.equal(assessPurchase(answers).id, "stop");
});

test("يميّز الملاحظة المؤثرة عن الملاحظة المتوسطة", () => {
  const high = answersWith("pass");
  high.display = "fail";
  assert.equal(assessPurchase(high).id, "impactful");

  const medium = answersWith("pass");
  medium.audio = "fail";
  assert.equal(assessPurchase(medium).id, "notes");
});

test("لا يمنح نتيجة مكتملة عند ترك اختبار حرج دون تنفيذ", () => {
  assert.equal(assessPurchase(answersWith("unknown")).id, "incomplete");
  assert.equal(assessNetwork(answersWith("unknown")).id, "unknown");
});

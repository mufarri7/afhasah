import test from "node:test";
import assert from "node:assert/strict";

import { allChecks } from "../src/data/checks.js";
import {
  createReport,
  decodeReport,
  encodeReport,
  validateReport,
} from "../src/lib/report-codec.js";

const answers = Object.fromEntries(allChecks.map((check) => [check.id, "pass"]));
const createdAt = "2020-01-01T10:00:00.000Z";

test("يحافظ الترميز وفك الترميز على التقرير", () => {
  const report = createReport({
    modelCode: " sm-s918b/ds ",
    carrierId: "yemen-mobile",
    answers,
    createdAt,
  });
  const decoded = decodeReport(encodeReport(report));
  assert.deepEqual(decoded, report);
  assert.equal(decoded.device.modelCode, "SM-S918B/DS");
});

test("يرفض رقمًا من 15 خانة بدل رقم الطراز", () => {
  const candidate = createReport({
    modelCode: "123456789012345",
    carrierId: "you",
    answers,
    createdAt,
  });
  assert.equal(validateReport(candidate), null);
  assert.throws(() => encodeReport(candidate), TypeError);
});

test("يرفض شبكة غير معروفة أو إجابة دخيلة", () => {
  const report = createReport({ modelCode: "A2881", carrierId: "sabafon", answers, createdAt });
  assert.equal(validateReport({ ...report, carrierId: "unknown" }), null);
  assert.equal(validateReport({ ...report, answers: { ...answers, extra: "pass" } }), null);
});

test("يرفض الروابط التالفة أو الإصدارات غير المدعومة", () => {
  assert.equal(decodeReport("not-a-report"), null);
  assert.equal(decodeReport("v2.e30"), null);
  assert.equal(decodeReport(`v1.${"a".repeat(12_001)}`), null);
});

test("يرفض تاريخًا بعيدًا في المستقبل", () => {
  const report = createReport({
    modelCode: "A2111",
    carrierId: "you",
    answers,
    createdAt: "2999-01-01T00:00:00.000Z",
  });
  assert.equal(validateReport(report), null);
});

import test from "node:test";
import assert from "node:assert/strict";

import { carriers } from "../src/data/carriers.js";
import { devices, isValidModelCode, normalizeModelCode } from "../src/data/devices.js";

test("تستخدم الطرازات أرقامًا صحيحة وفريدة", () => {
  const codes = devices.map((device) => device.code);
  assert.equal(new Set(codes).size, codes.length);
  assert.ok(codes.every(isValidModelCode));
});

test("تعرف النسخ التي تعتمد على eSIM فقط", () => {
  assert.match(devices.find((device) => device.code === "A2649").notice, /eSIM/u);
  assert.match(devices.find((device) => device.code === "A2846").notice, /eSIM/u);
});

test("تطبع رقم الطراز قبل البحث", () => {
  assert.equal(normalizeModelCode(" sm-s918b/ds "), "SM-S918B/DS");
  assert.equal(isValidModelCode("123456789012345"), false);
});

test("تستخدم الشبكات معرفات فريدة", () => {
  const ids = carriers.map((carrier) => carrier.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(ids, ["yemen-mobile", "you", "sabafon", "y-telecom"]);
});

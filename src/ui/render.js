import { answerOptions, checkGroups } from "../data/checks.js";
import { carriers, findCarrier } from "../data/carriers.js";
import { devices, findDevice, normalizeModelCode } from "../data/devices.js";
import { assessNetwork, assessPurchase, summarizeAnswers } from "../domain/assessment.js";
import { element, clear } from "./dom.js";

const answerLabels = new Map(answerOptions.map((option) => [option.value, option.shortLabel]));

function makeField(labelText, hintText, input) {
  const label = element("label", { text: labelText, attributes: { for: input.id } });
  const hint = element("p", { id: `${input.id}-hint`, className: "field-hint", text: hintText });
  input.setAttribute("aria-describedby", hint.id);
  return element("div", { className: "field-group" }, [label, hint, input]);
}

export function renderDeviceStep(container, state, onChange) {
  clear(container);

  const input = element("input", {
    id: "model-code",
    className: "text-input",
    attributes: {
      name: "modelCode",
      type: "text",
      inputmode: "text",
      autocomplete: "off",
      autocapitalize: "characters",
      maxlength: "32",
      placeholder: "مثال: SM-S918U",
      list: "known-models",
      required: "",
    },
  });
  input.value = state.modelCode;

  const dataList = element("datalist", { id: "known-models" });
  for (const device of devices) {
    dataList.append(
      element("option", {
        attributes: { value: device.code, label: `${device.name} — ${device.variant}` },
      }),
    );
  }

  const match = element("div", { className: "model-match", attributes: { hidden: "" } });
  const matchIcon = element("span", { className: "model-match-icon", text: "✓" });
  const matchTitle = element("strong");
  const matchMeta = element("span");
  const matchNotice = element("span", { className: "model-match-warning" });
  match.append(matchIcon, element("div", {}, [matchTitle, matchMeta, matchNotice]));

  function updateMatch() {
    const device = findDevice(input.value);
    state.modelCode = normalizeModelCode(input.value);
    input.value = state.modelCode;
    match.hidden = !device;
    if (device) {
      matchTitle.textContent = device.name;
      matchMeta.textContent = `${device.code} — ${device.variant}`;
      matchNotice.textContent = device.notice ?? "";
      matchNotice.hidden = !device.notice;
    }
    onChange();
  }

  input.addEventListener("input", updateMatch);
  input.addEventListener("blur", updateMatch);

  const carrierLabel = element("p", {
    id: "carrier-group-label",
    className: "group-label",
    text: "الشبكة التي ستختبرها",
  });
  const carrierHint = element("p", {
    id: "carrier-group-hint",
    className: "field-hint",
    text: "النتيجة تخص الشريحة والمكان والإعدادات المستخدمة وقت الفحص.",
  });
  const carrierGrid = element("div", {
    className: "carrier-grid",
    attributes: {
      role: "radiogroup",
      "aria-labelledby": carrierLabel.id,
      "aria-describedby": carrierHint.id,
    },
  });

  for (const carrier of carriers) {
    const radio = element("input", {
      id: `carrier-${carrier.id}`,
      attributes: {
        type: "radio",
        name: "carrier",
        value: carrier.id,
      },
    });
    radio.checked = state.carrierId === carrier.id;
    radio.addEventListener("change", () => {
      state.carrierId = carrier.id;
      onChange();
    });

    const label = element("label", { attributes: { for: radio.id } }, [
      element("span", { className: "carrier-symbol", text: carrier.shortName }),
      element("strong", { text: carrier.name }),
    ]);
    carrierGrid.append(element("div", { className: "carrier-card" }, [radio, label]));
  }

  const carrierGroup = element("div", { className: "field-group" }, [
    carrierLabel,
    carrierHint,
    carrierGrid,
  ]);

  container.append(makeField("رقم الطراز الدقيق", "ستجده في الإعدادات ← حول الهاتف، ولا تدخل IMEI.", input));
  container.append(dataList, match, carrierGroup);
  updateMatch();
}

function createQuestion(check, answers, onAnswer) {
  const titleId = `${check.id}-title`;
  const hintId = `${check.id}-hint`;
  const copy = element("div", { className: "question-copy" }, [
    element("p", { id: titleId, className: "question-title", text: check.title }),
    element("p", { id: hintId, className: "question-hint", text: check.hint }),
  ]);
  const options = element("div", {
    className: "answers",
    attributes: {
      role: "radiogroup",
      "aria-labelledby": titleId,
      "aria-describedby": hintId,
    },
  });

  for (const option of answerOptions) {
    const id = `${check.id}-${option.value}`;
    const input = element("input", {
      id,
      attributes: {
        type: "radio",
        name: check.id,
        value: option.value,
      },
    });
    input.checked = answers[check.id] === option.value;
    input.addEventListener("change", () => onAnswer(check.id, option.value));
    const label = element("label", { text: option.shortLabel, attributes: { for: id, title: option.label } });
    options.append(element("div", { className: "answer-option" }, [input, label]));
  }

  return element("div", { className: "question-card" }, [copy, options]);
}

export function renderQuestionsStep(container, groupId, state, onChange) {
  clear(container);
  const group = checkGroups[groupId];
  const list = element("div", { className: "questions-list" });

  for (const check of group.checks) {
    list.append(
      createQuestion(check, state.answers, (id, value) => {
        state.answers[id] = value;
        onChange();
      }),
    );
  }

  const note = element("div", { className: "step-note" }, [
    element("strong", { text: "مهم" }),
    element("span", { text: group.note }),
  ]);

  if (groupId === "locks") {
    const deliveryGate = element("section", { className: "delivery-gate" }, [
      element("h3", { text: "بوابة التسليم قبل الدفع" }),
      element("ol", {}, [
        element("li", { text: "ينسخ البائع بياناته ثم يزيل حساباته بالطريقة الرسمية." }),
        element("li", { text: "يعيد البائع ضبط الجهاز من الإعدادات أمامك." }),
        element("li", { text: "تُكمل التفعيل بالإنترنت وتتحقق من عدم طلب حساب سابق." }),
      ]),
      element("p", {
        text: "توقف إذا ظهر قفل تنشيط، أو حساب سابق، أو إدارة مؤسسة، أو قفل تمويل، أو رفض البائع إكمال الخطوات.",
      }),
    ]);
    container.append(deliveryGate);
  }

  container.append(list, note);
}

function resultChip(answer) {
  return element("span", {
    className: `result-chip result-${answer}`,
    text: answerLabels.get(answer) ?? "لم يُختبر",
  });
}

function reportSection(title, checks, report) {
  const list = element("ul", { className: "report-list" });
  for (const check of checks) {
    list.append(
      element("li", { className: "report-row" }, [
        element("span", { text: check.title }),
        resultChip(report.answers[check.id]),
      ]),
    );
  }
  return element("section", { className: "report-section" }, [
    element("h3", { text: title }),
    list,
  ]);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ar-YE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function renderReport(container, report, callbacks) {
  clear(container);
  const device = findDevice(report.device.modelCode);
  const carrier = findCarrier(report.carrierId);
  const network = assessNetwork(report.answers);
  const purchase = assessPurchase(report.answers);
  const summary = summarizeAnswers(report.answers);

  const hero = element("div", { className: "report-hero" }, [
    element("div", {}, [
      element("p", { className: "section-kicker", text: "تقرير فحص مؤرخ" }),
      element("h3", { text: device?.name ?? report.device.modelCode }),
      element("p", {
        className: "report-meta",
        text: `${report.device.modelCode} · ${carrier?.name ?? "شبكة غير معروفة"} · ${formatDate(report.createdAt)}`,
      }),
    ]),
    element("div", {
      className: `risk-badge tone-${purchase.tone}`,
      text: purchase.label,
    }),
  ]);

  const summaryGrid = element("div", { className: "summary-grid" }, [
    element("div", { className: "summary-item" }, [
      element("span", { text: "لم تظهر مشكلة" }),
      element("strong", { text: String(summary.pass) }),
    ]),
    element("div", { className: "summary-item" }, [
      element("span", { text: "ظهرت ملاحظة" }),
      element("strong", { text: String(summary.fail) }),
    ]),
    element("div", { className: "summary-item" }, [
      element("span", { text: "حالة الشبكة" }),
      element("strong", { text: network.label }),
    ]),
  ]);

  const actions = element("div", { className: "report-actions" });
  const shareButton = element("button", {
    className: "button button-primary",
    text: "مشاركة التقرير",
    attributes: { type: "button" },
  });
  const printButton = element("button", {
    className: "button button-ghost",
    text: "طباعة أو حفظ PDF",
    attributes: { type: "button" },
  });
  const editButton = element("button", {
    className: "button button-ghost",
    text: "تعديل الفحص",
    attributes: { type: "button" },
  });
  const newButton = element("button", {
    className: "button button-ghost",
    text: "فحص هاتف آخر",
    attributes: { type: "button" },
  });

  shareButton.addEventListener("click", callbacks.onShare);
  printButton.addEventListener("click", () => window.print());
  editButton.addEventListener("click", callbacks.onEdit);
  newButton.addEventListener("click", callbacks.onNew);
  actions.append(shareButton, printButton, editButton, newButton);

  container.append(
    element("div", { className: "report-view" }, [
      hero,
      summaryGrid,
      reportSection(checkGroups.network.title, checkGroups.network.checks, report),
      reportSection(checkGroups.hardware.title, checkGroups.hardware.checks, report),
      reportSection(checkGroups.locks.title, checkGroups.locks.checks, report),
      element("p", {
        className: "report-disclaimer",
        text:
          "يعرض التقرير إجابات أدخلها المستخدم يدويًا عن وقت الفحص، ويمكن تعديلها وإنشاء رابط جديد. وقت التقرير مأخوذ من ساعة الجهاز، وليس إثباتًا مستقلًا. لا يثبت الملكية القانونية، ولا يكشف جميع الأعطال الخفية، ولا يضمن عدم الحظر أو تغير توافق الشبكة مستقبلًا.",
      }),
      actions,
    ]),
  );
}

export function renderInvalidReport(container, onNew) {
  clear(container);
  const button = element("button", {
    className: "button button-primary",
    text: "ابدأ فحصًا جديدًا",
    attributes: { type: "button" },
  });
  button.addEventListener("click", onNew);
  container.append(
    element("div", { className: "error-state" }, [
      element("h3", { text: "تعذر فتح التقرير" }),
      element("p", { text: "الرابط غير مكتمل أو أن صيغة التقرير غير مدعومة." }),
      button,
    ]),
  );
}

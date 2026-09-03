import { allChecks } from "./data/checks.js";
import { isValidModelCode } from "./data/devices.js";
import { normalizeAnswers } from "./domain/assessment.js";
import { createReport, decodeReport, encodeReport } from "./lib/report-codec.js";
import {
  renderDeviceStep,
  renderInvalidReport,
  renderQuestionsStep,
  renderReport,
} from "./ui/render.js";

const steps = [
  { id: "device", title: "بيانات الهاتف" },
  { id: "network", title: "اختبار الشبكة" },
  { id: "hardware", title: "فحص الجهاز" },
  { id: "locks", title: "الحسابات والأقفال" },
];

const content = document.querySelector("#step-content");
const form = document.querySelector("#inspection-form");
const actions = document.querySelector("#form-actions");
const nextButton = document.querySelector("#next-button");
const backButton = document.querySelector("#back-button");
const title = document.querySelector("#checker-title");
const stepLabel = document.querySelector("#step-label");
const progressValue = document.querySelector("#progress-value");
const progressBar = document.querySelector("#progress-bar");
const alert = document.querySelector("#form-alert");
const privacyButton = document.querySelector("#privacy-button");
const privacyDialog = document.querySelector("#privacy-dialog");

function initialAnswers() {
  return Object.fromEntries(allChecks.map((check) => [check.id, "unknown"]));
}

function initialState() {
  return {
    currentStep: 0,
    modelCode: "",
    carrierId: "",
    answers: initialAnswers(),
  };
}

let state = initialState();

function hideAlert() {
  alert.hidden = true;
  alert.textContent = "";
  alert.classList.remove("form-alert-success");
}

function showAlert(message, tone = "danger") {
  alert.textContent = message;
  alert.classList.toggle("form-alert-success", tone === "success");
  alert.hidden = false;
  alert.focus();
}

function updateHeader(stepIndex) {
  const step = steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);
  title.textContent = step.title;
  stepLabel.textContent = `الخطوة ${stepIndex + 1} من ${steps.length}`;
  progressValue.textContent = `${progress}%`;
  progressBar.style.width = `${progress}%`;
}

function renderCurrentStep() {
  hideAlert();
  actions.hidden = false;
  form.hidden = false;
  updateHeader(state.currentStep);
  backButton.hidden = state.currentStep === 0;
  nextButton.textContent = state.currentStep === steps.length - 1 ? "أنشئ التقرير" : state.currentStep === 0 ? "ابدأ الفحص" : "التالي";

  const step = steps[state.currentStep];
  if (step.id === "device") {
    renderDeviceStep(content, state, hideAlert);
  } else {
    renderQuestionsStep(content, step.id, state, hideAlert);
  }
}

function validateDeviceStep() {
  if (!isValidModelCode(state.modelCode)) {
    showAlert("أدخل رقم طراز يحتوي على حرف كما يظهر في صفحة «حول الهاتف»، وليس رقم IMEI.");
    document.querySelector("#model-code")?.focus();
    return false;
  }
  if (!state.carrierId) {
    showAlert("اختر الشبكة التي ستستخدمها في الاختبار.");
    return false;
  }
  return true;
}

function makeShareUrl(report) {
  const baseUrl = window.location.href.split("#")[0];
  return `${baseUrl}#report=${encodeReport(report)}`;
}

async function shareReport(report) {
  const url = makeShareUrl(report);
  const shareData = {
    title: `تقرير فحص ${report.device.modelCode}`,
    text: "فحص هذا الهاتف على «افحصه»: شاهد ما تم اختباره وما ظهرت فيه ملاحظات.",
    url,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    showAlert("تم نسخ رابط التقرير.", "success");
  } catch {
    const input = document.createElement("textarea");
    input.value = url;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.append(input);
    let copied = false;
    try {
      input.select();
      copied = document.execCommand?.("copy") === true;
    } finally {
      input.remove();
    }
    showAlert(
      copied ? "تم نسخ رابط التقرير." : "تعذر النسخ تلقائيًا. استخدم خيار نسخ الرابط من المتصفح.",
      copied ? "success" : "danger",
    );
  }
}

function showReport(report, updateLocation = true) {
  title.textContent = "نتيجة الفحص";
  stepLabel.textContent = "تقرير قابل للمشاركة";
  progressValue.textContent = "100%";
  progressBar.style.width = "100%";
  actions.hidden = true;
  hideAlert();
  if (updateLocation) history.replaceState(null, "", `#report=${encodeReport(report)}`);

  renderReport(content, report, {
    onShare: () => shareReport(report),
    onEdit: () => {
      history.replaceState(null, "", window.location.pathname + window.location.search);
      state.currentStep = steps.length - 1;
      renderCurrentStep();
    },
    onNew: startNewInspection,
  });
  title.focus({ preventScroll: true });
}

function startNewInspection() {
  state = initialState();
  history.replaceState(null, "", window.location.pathname + window.location.search);
  renderCurrentStep();
  document.querySelector("#inspection")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

nextButton.addEventListener("click", () => {
  hideAlert();
  if (state.currentStep === 0 && !validateDeviceStep()) return;

  if (state.currentStep < steps.length - 1) {
    state.currentStep += 1;
    renderCurrentStep();
    title.focus({ preventScroll: true });
    return;
  }

  const report = createReport({
    modelCode: state.modelCode,
    carrierId: state.carrierId,
    answers: normalizeAnswers(state.answers),
  });
  showReport(report);
});

backButton.addEventListener("click", () => {
  if (state.currentStep === 0) return;
  state.currentStep -= 1;
  renderCurrentStep();
  title.focus({ preventScroll: true });
});

form.addEventListener("submit", (event) => event.preventDefault());

privacyButton.addEventListener("click", () => privacyDialog.showModal());

function loadFromLocation() {
  const marker = "#report=";
  if (!window.location.hash.startsWith(marker)) {
    renderCurrentStep();
    return;
  }

  const report = decodeReport(window.location.hash.slice(marker.length));
  if (!report) {
    title.textContent = "رابط غير صالح";
    stepLabel.textContent = "تعذر قراءة التقرير";
    progressValue.textContent = "—";
    progressBar.style.width = "0";
    actions.hidden = true;
    renderInvalidReport(content, startNewInspection);
    return;
  }

  state = {
    currentStep: steps.length - 1,
    modelCode: report.device.modelCode,
    carrierId: report.carrierId,
    answers: report.answers,
  };
  showReport(report, false);
}

loadFromLocation();

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(new URL("../sw.js", import.meta.url).href).catch(() => {});
  });
}

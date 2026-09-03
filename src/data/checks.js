export const answerOptions = Object.freeze([
  { value: "pass", label: "تم الاختبار — لم تظهر مشكلة", shortLabel: "لم تظهر مشكلة" },
  { value: "fail", label: "تم الاختبار — ظهرت ملاحظة", shortLabel: "ظهرت ملاحظة" },
  { value: "unknown", label: "لم أختبر", shortLabel: "لم يُختبر" },
]);

export const checkGroups = Object.freeze({
  network: {
    title: "اختبار الشبكة",
    note:
      "استخدم الشريحة التي ستعمل على هذا الهاتف، وعطّل Wi‑Fi والشريحة الثانية أثناء الاختبار.",
    checks: [
      {
        id: "simDetected",
        title: "تعرّف الهاتف على الشريحة",
        hint: "ظهرت الشبكة ولم تظهر رسالة تمنع استخدام الشريحة.",
        severity: "critical",
      },
      {
        id: "voiceCall",
        title: "نجحت مكالمة صادرة وواردة",
        hint: "اختبر سماعة الأذن والميكروفون ومكبر الصوت، ولا تستخدم رقم طوارئ.",
        severity: "critical",
      },
      {
        id: "mobileData",
        title: "عملت بيانات الهاتف",
        hint: "أوقف Wi‑Fi وافتح صفحة خفيفة باستخدام بيانات الشريحة.",
        severity: "high",
      },
      {
        id: "volteDuringCall",
        title: "استمرت 4G والبيانات أثناء المكالمة",
        hint: "نجاحها يدعم عمل VoLTE لهذه الشريحة والمكان والإعدادات وقت الفحص.",
        severity: "medium",
      },
    ],
  },
  hardware: {
    title: "فحص الجهاز",
    note:
      "نفّذ الاختبارات على الهاتف نفسه. ظهور انتفاخ أو سخونة غير طبيعية يعني إيقاف الفحص وعدم توصيل الشاحن.",
    checks: [
      {
        id: "batterySafety",
        title: "الهيكل والبطارية بلا علامة خطر ظاهرة",
        hint: "لا انتفاخ، لا انفصال في الهيكل، ولا سخونة غير طبيعية.",
        severity: "critical",
      },
      {
        id: "display",
        title: "الشاشة بلا خطوط أو بقع أو احتراق ظاهر",
        hint: "اعرض الأبيض والأسود والرمادي والألوان الأساسية وغيّر السطوع.",
        severity: "high",
      },
      {
        id: "touch",
        title: "اللمس يستجيب في جميع الحواف",
        hint: "اسحب عنصرًا أو ارسم خطوطًا على كامل مساحة الشاشة.",
        severity: "high",
      },
      {
        id: "cameras",
        title: "الكاميرات والتركيز والفلاش تعمل",
        hint: "اختبر الأمامية وكل مستوى تصوير متاح وصوّر مقطعًا قصيرًا.",
        severity: "medium",
      },
      {
        id: "audio",
        title: "التسجيل والسماعات واضحان",
        hint: "سجّل عبارة قصيرة ثم اختبر سماعة الأذن ومكبر الصوت.",
        severity: "medium",
      },
      {
        id: "charging",
        title: "بدأ الشحن واستمر دون انقطاع",
        hint: "استخدم شاحنًا وكابلًا معروفين بالعمل، ولا تحرك المنفذ بعنف.",
        severity: "high",
      },
      {
        id: "buttonsSensors",
        title: "الأزرار والدوران والاهتزاز تعمل",
        hint: "اختبر أزرار الصوت والقفل وتدوير الشاشة والاهتزاز.",
        severity: "medium",
      },
      {
        id: "biometrics",
        title: "البصمة أو Face ID يعملان",
        hint: "أضف اختبارًا مؤقتًا فقط بعد موافقة المالك، ثم احذفه.",
        severity: "medium",
      },
      {
        id: "partsHistory",
        title: "رُوجع سجل قطع الغيار والخدمة إن كان متاحًا",
        hint: "راجع سجل القطع من إعدادات الجهاز، ولا تعتبر غياب السجل إثباتًا على أن الجهاز لم يُفتح.",
        severity: "high",
      },
    ],
  },
  locks: {
    title: "الحسابات والأقفال",
    note:
      "قبل الدفع، يزيل البائع حساباته بنفسه ويُكمل التفعيل الرسمي أمامك. لا تطلب منه كلمة مرور أو رمز تحقق.",
    checks: [
      {
        id: "accountsRemoved",
        title: "أزال البائع حساباته من الجهاز",
        hint: "حساب Apple أو Google وحساب الشركة المصنعة لم يعد مرتبطًا بالجهاز.",
        severity: "critical",
      },
      {
        id: "managementClear",
        title: "لا تظهر إدارة مؤسسة أو ملف عمل",
        hint: "لا توجد Remote Management أو Work Profile أو رسالة أن الجهاز مُدار.",
        severity: "critical",
      },
      {
        id: "financingClear",
        title: "لا يظهر قفل تمويل أو Knox Guard",
        hint: "عدم ظهور رسالة لا يثبت انتهاء التمويل، لكنه جزء ضروري من الفحص.",
        severity: "critical",
      },
      {
        id: "ownershipMatch",
        title: "تطابقت هوية الجهاز مع العبوة أو الفاتورة",
        hint: "طابق رقم الطراز وآخر 4 أرقام فقط من IMEI دون إدخال الرقم في التقرير.",
        severity: "high",
      },
      {
        id: "activationComplete",
        title: "اكتمل الإعداد بعد إعادة الضبط الرسمية",
        hint: "نفّذها البائع بعد النسخ الاحتياطي، ثم اتصل الجهاز بالإنترنت دون طلب حساب سابق.",
        severity: "critical",
      },
    ],
  },
});

export const allChecks = Object.freeze(
  Object.values(checkGroups).flatMap((group) => group.checks),
);

export const checkById = new Map(allChecks.map((check) => [check.id, check]));

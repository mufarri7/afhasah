export const devices = Object.freeze([
  {
    code: "SM-G998U1",
    name: "Galaxy S21 Ultra 5G",
    variant: "نسخة الولايات المتحدة المفتوحة",
    brand: "Samsung",
  },
  {
    code: "SM-G998B/DS",
    name: "Galaxy S21 Ultra 5G",
    variant: "النسخة العالمية ثنائية الشريحة",
    brand: "Samsung",
  },
  {
    code: "SM-N986N",
    name: "Galaxy Note20 Ultra 5G",
    variant: "نسخة كوريا",
    brand: "Samsung",
  },
  {
    code: "SM-S908U1",
    name: "Galaxy S22 Ultra 5G",
    variant: "نسخة الولايات المتحدة المفتوحة",
    brand: "Samsung",
  },
  {
    code: "SM-S908B/DS",
    name: "Galaxy S22 Ultra 5G",
    variant: "النسخة العالمية ثنائية الشريحة",
    brand: "Samsung",
  },
  {
    code: "SM-S908N",
    name: "Galaxy S22 Ultra 5G",
    variant: "نسخة كوريا",
    brand: "Samsung",
  },
  {
    code: "SM-S918U1",
    name: "Galaxy S23 Ultra 5G",
    variant: "نسخة الولايات المتحدة المفتوحة",
    brand: "Samsung",
  },
  {
    code: "SM-S918B/DS",
    name: "Galaxy S23 Ultra 5G",
    variant: "النسخة العالمية ثنائية الشريحة",
    brand: "Samsung",
  },
  {
    code: "SM-S918N",
    name: "Galaxy S23 Ultra 5G",
    variant: "نسخة كوريا",
    brand: "Samsung",
  },
  {
    code: "A2111",
    name: "iPhone 11",
    variant: "نسخة الولايات المتحدة وكندا",
    brand: "Apple",
  },
  {
    code: "A2221",
    name: "iPhone 11",
    variant: "نسخة أسواق دولية",
    brand: "Apple",
  },
  {
    code: "A2172",
    name: "iPhone 12",
    variant: "نسخة الولايات المتحدة",
    brand: "Apple",
  },
  {
    code: "A2403",
    name: "iPhone 12",
    variant: "نسخة أسواق دولية",
    brand: "Apple",
  },
  {
    code: "A2482",
    name: "iPhone 13",
    variant: "نسخة الولايات المتحدة",
    brand: "Apple",
  },
  {
    code: "A2631",
    name: "iPhone 13",
    variant: "نسخة كندا واليابان والمكسيك والسعودية",
    brand: "Apple",
  },
  {
    code: "A2649",
    name: "iPhone 14",
    variant: "نسخة الولايات المتحدة وبورتوريكو",
    brand: "Apple",
    notice: "هذه النسخة تعتمد على eSIM فقط ولا تحتوي على درج شريحة فعلية.",
  },
  {
    code: "A2881",
    name: "iPhone 14",
    variant: "نسخة كندا واليابان والمكسيك والسعودية",
    brand: "Apple",
  },
  {
    code: "A2846",
    name: "iPhone 15",
    variant: "نسخة الولايات المتحدة وبورتوريكو",
    brand: "Apple",
    notice: "هذه النسخة تعتمد على eSIM فقط ولا تحتوي على درج شريحة فعلية.",
  },
  {
    code: "A3089",
    name: "iPhone 15",
    variant: "نسخة كندا واليابان والمكسيك والسعودية",
    brand: "Apple",
  },
]);

export function normalizeModelCode(value) {
  return value.trim().toUpperCase().replaceAll(" ", "");
}

export function isValidModelCode(value) {
  const code = normalizeModelCode(value);
  return /^(?=.*[A-Z])[A-Z0-9._+\-/]{2,32}$/u.test(code);
}

export function findDevice(value) {
  const code = normalizeModelCode(value);
  return devices.find((device) => device.code === code) ?? null;
}

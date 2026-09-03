export const carriers = Object.freeze([
  {
    id: "yemen-mobile",
    name: "يمن موبايل",
    shortName: "YM",
  },
  {
    id: "you",
    name: "YOU",
    shortName: "YOU",
  },
  {
    id: "sabafon",
    name: "سبأفون",
    shortName: "S",
  },
  {
    id: "y-telecom",
    name: "واي تيليكوم (هدهد)",
    shortName: "Y",
  },
]);

export function findCarrier(id) {
  return carriers.find((carrier) => carrier.id === id) ?? null;
}

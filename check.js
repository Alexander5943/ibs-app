// Kontrollskript: node tests/check.js
const { FOODS, ibsVerdict } = require("./foods.js");
const { RECIPES } = require("./recipes.js");

let errors = 0;
function fail(msg) { console.error("FEL: " + msg); errors++; }

// 1. Unika ID:n och rimliga värden
const ids = new Set();
for (const f of FOODS) {
  if (ids.has(f.id)) fail("Dubblett-ID: " + f.id);
  ids.add(f.id);
  for (const k of ["kcal", "protein", "carbs", "fat", "fiber"]) {
    if (typeof f[k] !== "number" || f[k] < 0) fail(f.id + " har ogiltigt " + k);
  }
  // Grov kalorikontroll: 4*P + 4*C + 9*F ska vara nära kcal (+-30 %, minst +-25 kcal)
  const est = 4 * f.protein + 4 * f.carbs + 9 * f.fat;
  if (Math.abs(est - f.kcal) > Math.max(25, f.kcal * 0.3)) {
    fail(f.id + ": kcal " + f.kcal + " stämmer dåligt med makron (uppskattat " + Math.round(est) + ")");
  }
}

// 2. Matlådor: giltiga ingredienser och inom FODMAP-gräns
console.log("\nMatlådor (per portion):");
for (const r of RECIPES) {
  let kcal = 0, protein = 0;
  for (const i of r.ingredients) {
    const f = FOODS.find((x) => x.id === i.id);
    if (!f) { fail(r.id + ": okänd ingrediens " + i.id); continue; }
    const v = ibsVerdict(f, i.g);
    if (v.level !== "green") fail(r.id + ": " + f.name + " " + i.g + " g ger " + v.level + " (gräns " + f.safeG + " g)");
    kcal += (f.kcal * i.g) / 100;
    protein += (f.protein * i.g) / 100;
  }
  console.log("  " + r.title.padEnd(48) + Math.round(kcal) + " kcal, " + Math.round(protein) + " g protein");
}

// 3. Bedömningslogik
const ris = FOODS.find((x) => x.id === "ris");
const apple = FOODS.find((x) => x.id === "apple");
const kiwi = FOODS.find((x) => x.id === "kiwi");
const checks = [
  [ibsVerdict(ris, 500).level, "green", "ris 500 g"],
  [ibsVerdict(apple, 10).level, "red", "äpple 10 g"],
  [ibsVerdict(kiwi, 150).level, "green", "kiwi 150 g"],
  [ibsVerdict(kiwi, 200).level, "yellow", "kiwi 200 g"],
  [ibsVerdict(kiwi, 300).level, "red", "kiwi 300 g"],
];
for (const [got, want, label] of checks) {
  if (got !== want) fail(label + ": fick " + got + ", väntade " + want);
}

console.log(errors ? "\n" + errors + " fel." : "\nAlla kontroller OK (" + FOODS.length + " livsmedel, " + RECIPES.length + " matlådor).");
process.exit(errors ? 1 : 0);

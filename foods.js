// Livsmedelsdatabas. Alla näringsvärden är per 100 g (ungefärliga).
// safeG = ungefärlig max-mängd (gram) som räknas som lågt FODMAP i en måltid.
//   null = ingen känd gräns (inga FODMAP att räkna med)
//   0    = undvik (hög FODMAP även i liten mängd)
// Gränserna är riktvärden baserade på allmänna low-FODMAP-riktlinjer.
// Kontrollera alltid mot Monash University FODMAP-appen, värdena uppdateras där.

function f(id, name, kcal, protein, carbs, fat, fiber, safeG, note) {
  return { id, name, kcal, protein, carbs, fat, fiber, safeG, note: note || "" };
}

const FOODS = [
  // Protein
  f("kyckling", "Kycklingbröst, tillagad", 165, 31, 0, 3.6, 0, null),
  f("kalkon", "Kalkon (bröst/färs), tillagad", 150, 29, 0, 3, 0, null),
  f("notfars", "Nötfärs 10 %, stekt", 217, 26, 0, 12, 0, null, "Kolla att färsen inte är kryddad med lök eller vitlök."),
  f("lax", "Lax, tillagad", 206, 22, 0, 12, 0, null),
  f("torsk", "Torsk, tillagad", 105, 23, 0, 0.9, 0, null),
  f("tonfisk", "Tonfisk i vatten (konserv)", 116, 26, 0, 1, 0, null),
  f("agg", "Ägg, tillagat", 155, 13, 1.1, 11, 0, null),
  f("tofu", "Fast tofu", 144, 17, 3, 9, 2.3, 170, "Fast tofu är ok. Mjuk silken-tofu har mer FODMAP."),

  // Kolhydrater
  f("ris", "Ris, kokt (vitt)", 130, 2.7, 28, 0.3, 0.4, null),
  f("potatis", "Potatis, kokt", 87, 1.9, 20, 0.1, 1.8, null),
  f("quinoa", "Quinoa, kokt", 120, 4.4, 21, 1.9, 2.8, 155),
  f("gfpasta", "Glutenfri pasta, kokt", 158, 3.3, 32, 1, 1.5, 145),
  f("vetepasta", "Vetepasta, kokt", 158, 5.8, 31, 0.9, 1.8, 70, "Vete innehåller fruktaner. Glutenfri pasta går bättre."),
  f("havregryn", "Havregryn (torra)", 370, 13, 60, 7, 10, 50, "Större portioner kan ge gaser."),
  f("gfbrod", "Glutenfritt bröd", 250, 3, 45, 5, 4, 70, "Kolla att det inte innehåller inulin, lök eller honung."),
  f("vetebrod", "Vanligt vetebröd", 260, 9, 48, 3, 3, 25, "Fruktaner i vete."),
  f("sotpotatis", "Sötpotatis, kokt", 86, 1.6, 20, 0.1, 3, 75),

  // Mejeri och fett
  f("lfmjolk", "Laktosfri mjölk", 45, 3.4, 4.8, 1.5, 0, 250),
  f("mjolk", "Komjölk (med laktos)", 46, 3.4, 4.8, 1.5, 0, 60, "Laktos. Välj laktosfri mjölk."),
  f("lfyoghurt", "Laktosfri yoghurt, naturell", 62, 4.5, 4.5, 3, 0, 170),
  f("hardost", "Hårdost (t.ex. cheddar, Herrgård)", 400, 25, 0.5, 33, 0, 40, "Lagrad ost har lite laktos. Fettrik."),
  f("feta", "Fetaost", 264, 14, 4, 21, 0, 40),
  f("smor", "Smör", 717, 0.9, 0.1, 81, 0, 19, "Fettrikt. Stora mängder kan trigga magen."),
  f("olivolja", "Olivolja", 884, 0, 0, 100, 0, null),
  f("vitlokso", "Vitlöksolja (infuserad)", 884, 0, 0, 100, 0, null, "Ger vitlökssmak utan FODMAP. Fruktaner löser sig inte i olja."),

  // Baljväxter, nötter, frön
  f("jordnotssmor", "Jordnötssmör", 588, 25, 20, 50, 6, 32),
  f("chia", "Chiafrön", 486, 17, 42, 31, 34, 24, "Bra löslig fiber. Börja med lite."),
  f("valnot", "Valnötter", 654, 15, 14, 65, 7, 30),
  f("linser", "Linser, konserv (sköljda)", 116, 9, 20, 0.4, 8, 46, "Skölj väl. Små portioner."),
  f("kikartor", "Kikärtor, konserv (sköljda)", 139, 7, 22, 2.6, 6, 42, "Skölj väl. Små portioner."),
  f("vitabonor", "Vita bönor / kidneybönor", 127, 9, 23, 0.5, 6, 0, "Mycket GOS. Undvik."),
  f("cashew", "Cashewnötter", 553, 18, 30, 44, 3, 0, "Mycket GOS och fruktaner. Undvik."),

  // Frukt
  f("banan", "Banan, fast/lite grön", 89, 1.1, 23, 0.3, 2.6, 100, "Mogen banan har mer fruktos. Håll dig till ca 35 g då."),
  f("blabar", "Blåbär", 57, 0.7, 14, 0.3, 2.4, 40),
  f("jordgubbar", "Jordgubbar", 32, 0.7, 7.7, 0.3, 2, 65),
  f("apelsin", "Apelsin", 47, 0.9, 12, 0.1, 2.4, 130),
  f("kiwi", "Kiwi", 61, 1.1, 15, 0.5, 3, 150, "Kan hjälpa vid förstoppning (IBS-C)."),
  f("apple", "Äpple", 52, 0.3, 14, 0.2, 2.4, 0, "Fruktos och sorbitol."),
  f("avokado", "Avokado", 160, 2, 9, 15, 7, 30, "Sorbitol. Fettrik."),

  // Grönsaker
  f("morot", "Morot", 41, 0.9, 10, 0.2, 2.8, null),
  f("zucchini", "Zucchini", 17, 1.2, 3.1, 0.3, 1, 65),
  f("gurka", "Gurka", 15, 0.7, 3.6, 0.1, 0.5, null),
  f("tomat", "Tomat", 18, 0.9, 3.9, 0.2, 1.2, 75),
  f("krossadtomat", "Krossade tomater (burk)", 32, 1.6, 5, 0.3, 1.5, 90),
  f("spenat", "Babyspenat", 23, 2.9, 3.6, 0.4, 2.2, 75),
  f("paprika", "Röd paprika", 31, 1, 6, 0.3, 2.1, 45),
  f("broccoli", "Broccoli (huvud)", 34, 2.8, 7, 0.4, 2.6, 75),
  f("gronkal", "Grönkål", 49, 4.3, 9, 0.9, 3.6, 75),
  f("sallad", "Sallad (isberg/romaine)", 15, 1.4, 2.9, 0.2, 1.3, null),
  f("salladslok", "Salladslök (bara gröna delen)", 32, 1.8, 7.3, 0.2, 2.6, 45),
  f("blomkal", "Blomkål", 25, 1.9, 5, 0.3, 2, 0, "Mannitol och fruktaner."),
  f("lok", "Lök (gul/röd)", 40, 1.1, 9, 0.1, 1.7, 0, "Fruktaner. Använd salladslökens gröna del istället."),
  f("vitlok", "Vitlök", 149, 6.4, 33, 0.5, 2.1, 0, "Fruktaner. Använd vitlöksolja istället."),
  f("svamp", "Champinjoner", 22, 3.1, 3.3, 0.3, 1, 0, "Mannitol."),

  // Övrigt
  f("sojasas", "Sojasås", 53, 8, 5, 0.6, 0.8, 32),
  f("honung", "Honung", 304, 0.3, 82, 0, 0.2, 0, "Överskott av fruktos."),
  f("kaffe", "Kaffe, svart", 2, 0.3, 0, 0, 0, 250, "Koffein kan irritera magen, särskilt vid IBS-D."),
];

// Bedömning av ett livsmedel i en viss mängd.
// level: "green" | "yellow" | "red"
function ibsVerdict(food, grams) {
  const fatG = (food.fat * grams) / 100;
  const extras = [];
  if (fatG > 25) extras.push("Fettrik portion (" + Math.round(fatG) + " g fett). Mycket fett kan trigga besvär hos vissa.");
  if (food.note) extras.push(food.note);

  if (food.safeG === 0) {
    return { level: "red", title: "Undvik", text: "Hög FODMAP, även i små mängder.", extras };
  }
  if (food.safeG === null || food.safeG === undefined) {
    return { level: "green", title: "Bra för magen", text: "Lågt FODMAP. Ingen känd gräns.", extras };
  }
  const ratio = grams / food.safeG;
  if (ratio <= 1) {
    return { level: "green", title: "Bra för magen", text: "Inom säker mängd (max ca " + food.safeG + " g).", extras, ratio };
  }
  if (ratio <= 1.5) {
    return { level: "yellow", title: "Lite för mycket", text: "Över säker mängd (max ca " + food.safeG + " g). Risk för symtom.", extras, ratio };
  }
  return { level: "red", title: "För mycket", text: "Långt över säker mängd (max ca " + food.safeG + " g).", extras, ratio };
}

if (typeof module !== "undefined") module.exports = { FOODS, ibsVerdict };

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

  // ===== Utökad lista (typiska värden per 100 g, ungefärliga) =====

  // Kött och chark
  f("flaskfile", "Fläskfilé, tillagad", 143, 26, 0, 4, 0, null),
  f("flaskkotlett", "Fläskkotlett, stekt", 230, 27, 0, 13, 0, null),
  f("skinka", "Skinka, kokt (pålägg)", 107, 17, 1, 4, 0, null, "Kolla att den inte har lök eller vitlök i kryddningen."),
  f("bacon", "Bacon, stekt", 531, 37, 1.4, 42, 0, null, "Fettrikt och salt."),
  f("falukorv", "Falukorv / grillkorv", 250, 11, 8, 20, 0.5, 60, "Innehåller ofta lök, vitlök och bindemedel. Kolla ingredienslistan."),
  f("kottbullar", "Köttbullar, färdiga", 220, 13, 10, 14, 0.8, 0, "Färdiga köttbullar har ofta lök. Gör egna med lökfri färs."),
  f("lammkott", "Lamm, tillagat", 280, 25, 0, 20, 0, null),
  f("entrecote", "Entrecôte / biff, stekt", 252, 27, 0, 16, 0, null),
  f("oxfile", "Oxfilé, stekt", 200, 28, 0, 9, 0, null),
  f("kycklinglar", "Kycklinglår, tillagat", 210, 26, 0, 11, 0, null),
  f("kycklingfars", "Kycklingfärs, stekt", 190, 24, 0, 10, 0, null),
  f("kalkonpalagg", "Kalkonskivor (pålägg)", 105, 18, 1.5, 2.5, 0, null, "Kolla att den inte har lök eller vitlök."),
  f("leverpastej", "Leverpastej", 280, 12, 6, 23, 0.5, 30, "Innehåller ofta lök. Fettrik."),
  f("aggvita", "Äggvita", 52, 11, 0.7, 0.2, 0, null),

  // Fisk och skaldjur
  f("sej", "Sej / kolja, tillagad", 105, 23, 0, 1, 0, null),
  f("rakor", "Räkor, kokta", 100, 24, 0, 0.5, 0, null),
  f("rokt-lax", "Rökt lax", 183, 21, 0, 11, 0, null, "Salt."),
  f("sardiner", "Sardiner i olja (konserv)", 203, 25, 0, 11.5, 0, null),
  f("fiskpinnar", "Fiskpinnar, stekta", 218, 12, 20, 10, 1.2, 100, "Panering av vete (fruktaner). Glutenfria finns."),
  f("sill", "Sill, inlagd", 196, 12, 10, 12, 0, 50, "Ofta lök. Kolla lagen."),
  f("musslor", "Blåmusslor, kokta", 82, 12, 4, 2, 0, null),
  f("makrill-tomat", "Makrill i tomatsås (konserv)", 194, 13, 4, 14, 0.3, 80, "Tomatsåsen kan innehålla lök."),

  // Mejeri och alternativ
  f("filmjolk-lf", "Filmjölk / fil, laktosfri", 46, 3.3, 4.7, 1.5, 0, null),
  f("filmjolk", "Filmjölk / fil, vanlig (med laktos)", 46, 3.4, 4.8, 1.5, 0, 60, "Laktos. Välj laktosfri."),
  f("grekyoghurt", "Grekisk yoghurt (med laktos)", 124, 4.5, 4, 10, 0, 60, "Laktos. Laktosfri finns."),
  f("kvarg", "Kvarg, naturell", 60, 11, 3.5, 0.2, 0, 100, "Laktosfri finns."),
  f("keso", "Keso (cottage cheese)", 96, 12, 3, 4, 0, 40),
  f("mozzarella", "Mozzarella", 251, 18, 2, 19, 0, 60),
  f("parmesan", "Parmesan", 408, 36, 3, 28, 0, 40),
  f("brie", "Brie / vitmögelost", 338, 21, 0.5, 28, 0, 40),
  f("prastost", "Prästost / hushållsost", 351, 27, 0, 27, 0, 40, "Lagrad ost har lite laktos."),
  f("farskost", "Färskost, naturell", 243, 5, 4, 23, 0, 40, "Laktosfri finns."),
  f("ricotta", "Ricotta", 173, 11, 3, 13, 0, 40),
  f("mesost", "Mesost / messmör", 340, 10, 45, 12, 0, 20, "Mycket laktos."),
  f("glass", "Glass, vanilj", 199, 3, 22, 11, 0, 30, "Laktos och socker. Fettrik."),
  f("havredryck", "Havredryck", 42, 0.4, 6.7, 1.5, 0.8, 125, "Större mängder kan ge besvär."),
  f("sojadryck", "Sojadryck (av sojaprotein)", 40, 3.3, 2.5, 1.8, 0.5, 250, "Välj en gjord på sojaprotein. Dryck av hela sojabönor är hög i FODMAP."),
  f("mandeldryck", "Mandeldryck, osötad", 18, 0.7, 0.5, 1.5, 0.2, 250),
  f("risdryck", "Risdryck", 47, 0.1, 9.4, 1, 0, 250),
  f("kokosmjolk", "Kokosmjölk (konserv)", 197, 2, 3, 21, 0, 120, "Fettrik."),
  f("matlagningsgradde", "Matlagningsgrädde 15 %", 163, 3, 4, 15, 0, 100, "Fettrik."),
  f("vispgradde", "Vispgrädde 40 %", 380, 2, 3, 40, 0, 60, "Mycket fett."),
  f("cremefraiche", "Crème fraiche", 195, 3, 3, 19, 0, 60, "Fettrik."),

  // Fett, såser och smaksättare
  f("margarin", "Margarin / matfett 80 %", 720, 0, 0, 80, 0, null, "Fettrikt."),
  f("rapsolja", "Rapsolja", 884, 0, 0, 100, 0, null),
  f("kokosolja", "Kokosolja", 884, 0, 0, 100, 0, null),
  f("majonnas", "Majonnäs", 708, 0.5, 1, 78, 0, null, "Fettrik. Kolla att den inte har lök- eller vitlöksextrakt."),
  f("ketchup", "Ketchup", 109, 1, 26, 0.1, 0.5, 15, "Kan innehålla lök och fruktossirap."),
  f("senap", "Senap", 63, 4, 5, 3, 3, null),
  f("tomatpure", "Tomatpuré", 78, 4.3, 14, 0.5, 4, 30),
  f("buljong", "Buljongtärning", 215, 6, 20, 12, 0, 10, "Innehåller ofta lök eller vitlök. Välj en lökfri."),
  f("sylt", "Sylt (jordgubb/hallon)", 242, 0.4, 60, 0.1, 1, 40),
  f("socker", "Socker", 400, 0, 100, 0, 0, null, "Vanligt socker tolereras ofta bättre än fruktos, men det är bara socker."),
  f("lonnsirap", "Lönnsirap", 260, 0, 67, 0, 0, 40),
  f("hummus", "Hummus", 237, 7, 14, 17, 5, 30, "Kikärtor och ofta vitlök."),
  f("falafel", "Falafel", 342, 13, 32, 18, 5, 0, "Kikärtor, lök och vitlök."),

  // Bröd, spannmål och snacks
  f("surdegsbrod", "Surdegsbröd (dinkel)", 229, 9, 45, 1.5, 3, 90, "Surdeg bryter ned en del fruktaner."),
  f("ragbrod", "Rågbröd, mörkt", 214, 6, 43, 2, 7, 35, "Råg innehåller mycket fruktaner."),
  f("knackebrod", "Knäckebröd (råg)", 306, 10, 62, 2, 14, 25, "Råg innehåller mycket fruktaner."),
  f("tortilla", "Tortilla (vete)", 295, 8, 50, 7, 3, 50),
  f("riskakor", "Riskakor", 379, 8, 80, 3, 3, 60),
  f("cornflakes", "Cornflakes", 371, 7, 84, 0.8, 3, 40),
  f("musli", "Müsli (med torkad frukt)", 360, 9, 60, 7, 8, 30, "Torkad frukt och honung är hög i FODMAP."),
  f("grot", "Havregrynsgröt, kokt på vatten", 71, 2.5, 12, 1.4, 1.7, 250),
  f("couscous", "Couscous, kokt", 109, 3.8, 23, 0.2, 1.4, 50, "Gjord på vete."),
  f("bulgur", "Bulgur, kokt", 88, 3, 18.6, 0.2, 4.5, 45, "Gjord på vete."),
  f("bovete", "Bovete / gryn, kokt", 99, 3.4, 20, 0.6, 2.7, null),
  f("hirs", "Hirs, kokt", 118, 3.5, 23.7, 1, 1.3, null),
  f("polenta", "Polenta (majsgryn), kokt", 69, 1.6, 15, 0.3, 1, null),
  f("brunt-ris", "Brunt ris, kokt", 122, 2.7, 25.6, 1, 1.8, null),
  f("risnudlar", "Risnudlar, kokta", 105, 0.9, 25, 0.2, 0.5, null),
  f("aggnudlar", "Äggnudlar, kokta", 136, 4.5, 25, 2, 1.2, 70, "Gjorda på vete."),
  f("pannkaka", "Pannkaka (vete)", 175, 6, 22, 7, 0.8, 80),
  f("vetemjol", "Vetemjöl", 350, 10, 73, 1.2, 3, 30),
  f("pommes", "Pommes frites, ugnsbakade", 150, 2.5, 25, 4.5, 2.5, null, "Fett från fritering/olja kan trigga hos vissa."),
  f("popcorn", "Popcorn, poppat (utan smör)", 396, 12, 78, 4, 14, 70),
  f("chips", "Potatischips", 530, 6, 50, 34, 4, 50, "Smaksatta chips har ofta lök eller vitlök. Fettrika."),

  // Nötter och frön
  f("linfro", "Linfrö", 566, 18, 29, 42, 27, 20, "Mal eller blötlägg för bättre effekt."),
  f("solroskarnor", "Solroskärnor", 623, 21, 20, 51, 9, 30),
  f("pumpafron", "Pumpafrön", 605, 30, 11, 49, 6, 23),
  f("sesamfron", "Sesamfrön", 614, 18, 23, 50, 12, 20),
  f("mandlar", "Mandlar", 622, 21, 22, 50, 12, 12, "Större mängder är hög i GOS."),
  f("hasselnotter", "Hasselnötter", 677, 15, 17, 61, 10, 15),
  f("jordnotter", "Jordnötter", 609, 26, 16, 49, 8, 28),
  f("pistage", "Pistagenötter", 560, 20, 28, 45, 10, 0, "Mycket GOS och fruktaner."),
  f("pekannotter", "Pekannötter", 740, 9, 14, 72, 10, 20),
  f("macadamia", "Macadamianötter", 772, 8, 14, 76, 9, 40),
  f("paranotter", "Paranötter", 707, 14, 12, 67, 8, 40),
  f("morkchoklad", "Mörk choklad 70 %", 532, 8, 35, 40, 11, 30),
  f("mjolkchoklad", "Mjölkchoklad", 530, 7, 58, 30, 3, 30, "Innehåller laktos."),

  // Baljväxter och soja
  f("tempeh", "Tempeh", 211, 19, 9, 11, 0, 100),
  f("edamame", "Edamamebönor", 129, 12, 9, 5, 5, 90),
  f("grona-artor", "Gröna ärtor", 72, 5, 12, 0.4, 5, 40, "GOS och mannitol."),
  f("sockerartor", "Sockerärtor", 41, 2.8, 7, 0.2, 2.5, 15),
  f("gronabonor", "Gröna bönor / haricots verts", 29, 1.8, 5, 0.2, 3, 75),
  f("majs", "Sockermajs, kokt", 96, 3.4, 21, 1.5, 2.4, 75),

  // Grönsaker
  f("aubergine", "Aubergine", 30, 1, 6, 0.2, 3, 75),
  f("fankal", "Fänkål", 35, 1.2, 7, 0.2, 3, 75),
  f("selleri", "Selleri (stjälk)", 17, 0.7, 3, 0.2, 1.6, 15, "Mannitol."),
  f("palsternacka", "Palsternacka", 79, 1.2, 18, 0.3, 5, 75),
  f("rodbeta", "Rödbeta", 48, 1.6, 10, 0.2, 2.8, 20, "Fruktaner och GOS."),
  f("kalrot", "Kålrot", 39, 1.1, 8.6, 0.2, 2.3, 75),
  f("vitkal", "Vitkål", 30, 1.3, 6, 0.1, 2.5, 75),
  f("rodkal", "Rödkål", 35, 1.4, 7, 0.2, 2.1, 75),
  f("kinakal", "Pak choi / kinakål", 17, 1.5, 2.2, 0.2, 1, null),
  f("brysselkal", "Brysselkål", 52, 3.4, 9, 0.3, 3.8, 30, "Fruktaner och GOS i större mängd."),
  f("sparris", "Sparris", 20, 2.2, 3.9, 0.1, 2.1, 0, "Fruktos och fruktaner."),
  f("kronartskocka", "Kronärtskocka", 53, 3, 11, 0.2, 5, 0, "Fruktaner och inulin."),
  f("purjolok", "Purjolök, bara det gröna", 37, 1.5, 7, 0.3, 2.5, 65, "Det vita är hög i FODMAP."),
  f("radisor", "Rädisor", 16, 0.7, 3.4, 0.1, 1.6, null),
  f("ruccola", "Ruccola", 31, 2.6, 3.7, 0.7, 1.6, null),
  f("schalottenlok", "Schalottenlök", 78, 2.5, 17, 0.1, 3.2, 0, "Fruktaner."),
  f("persilja", "Persilja", 43, 3, 6, 0.8, 3.3, null),
  f("graslok", "Gräslök", 35, 3.3, 4.4, 0.7, 2.5, null),
  f("ingefara", "Ingefära, färsk", 86, 1.8, 18, 0.8, 2, null),
  f("kantareller", "Kantareller", 35, 1.5, 6, 0.5, 5, null),
  f("shiitake", "Shiitake", 41, 2.2, 7, 0.5, 2.5, 0, "Mannitol."),
  f("pumpa", "Pumpa (butternut)", 48, 1, 11, 0.1, 2, 30, "Hokkaido tolereras ofta i större mängd."),
  f("korsbarstomat", "Körsbärstomater", 18, 0.9, 3.9, 0.2, 1.2, 75),
  f("soltorkade", "Soltorkade tomater", 307, 14, 56, 3, 12, 8),
  f("oliver", "Oliver", 126, 0.8, 6, 11, 3, 50, "Salta."),
  f("gron-paprika", "Grön paprika", 22, 0.9, 4.6, 0.2, 1.7, 75),
  f("chili", "Chili", 40, 1.9, 9, 0.4, 1.5, null, "Stark mat kan irritera magen hos vissa."),

  // Frukt och bär
  f("druvor", "Vindruvor", 77, 0.7, 18, 0.2, 0.9, 75),
  f("ananas", "Ananas", 55, 0.5, 13, 0.1, 1.4, 140),
  f("cantaloupe", "Cantaloupemelon", 37, 0.8, 8, 0.2, 0.9, 120),
  f("vattenmelon", "Vattenmelon", 30, 0.6, 7.6, 0.2, 0.4, 0, "Fruktos och mannitol."),
  f("mandarin", "Mandarin / clementin", 58, 0.8, 13, 0.3, 1.8, 90),
  f("grapefrukt", "Grapefrukt", 42, 0.8, 11, 0.1, 1.6, 100),
  f("citron", "Citron", 29, 1.1, 9, 0.3, 2.8, null),
  f("paron", "Päron", 62, 0.4, 15, 0.1, 3.1, 0, "Fruktos och sorbitol."),
  f("persika", "Persika", 39, 0.9, 10, 0.3, 1.5, 0, "Sorbitol."),
  f("plommon", "Plommon", 46, 0.7, 11, 0.3, 1.4, 0, "Sorbitol."),
  f("korsbar", "Körsbär", 63, 1, 16, 0.2, 2.1, 0, "Fruktos och sorbitol."),
  f("mango", "Mango", 67, 0.8, 15, 0.4, 1.6, 40),
  f("hallon", "Hallon", 59, 1.2, 12, 0.7, 6.5, 60),
  f("bjornbar", "Björnbär", 43, 1.4, 10, 0.5, 5, 0, "Polyoler."),
  f("papaya", "Papaya", 43, 0.5, 11, 0.3, 1.7, 140),
  f("rabarber", "Rabarber", 21, 0.9, 4.5, 0.2, 1.8, 130),
  f("russin", "Russin", 332, 3, 79, 0.5, 4.5, 13, "Fruktos."),
  f("apelsinjuice", "Apelsinjuice", 45, 0.7, 10, 0.2, 0.2, 125),
  f("appeljuice", "Äppeljuice", 45, 0.1, 11, 0.1, 0.2, 0, "Fruktos och sorbitol."),

  // Drycker
  f("vatten", "Vatten", 0, 0, 0, 0, 0, null),
  f("te", "Te, svart (osötat)", 1, 0, 0.2, 0, 0, 250, "Starkt te kan ge besvär hos vissa."),
  f("pepparmynta", "Pepparmyntste", 1, 0, 0.2, 0, 0, null),
  f("cola", "Cola", 42, 0, 10.6, 0, 0, 250, "Kolsyra kan ge gaser."),
  f("lightlask", "Läsk, light (sötningsmedel)", 1, 0, 0.1, 0, 0, 250, "Sötningsmedel som sorbitol och xylitol kan ge diarré."),
  f("vassle", "Vassleprotein (isolat), pulver", 366, 86, 2, 1.5, 0, 30, "Koncentrat innehåller laktos. Isolat har mycket lite."),
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

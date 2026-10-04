(function () {
  "use strict";

  const KEY = "ibs-koll-v1";
  const DEFAULTS = { log: {}, custom: [], boxes: [], settings: { type: "", kcalGoal: 2000, proteinGoal: 90 } };

  const TYPE_TIPS = {
    D: "IBS-D: Begränsa koffein, sötningsmedel (sorbitol, xylitol) och mycket fet mat. Ät regelbundet.",
    C: "IBS-C: Drick mycket vatten. Havre, kiwi och chiafrön (löslig fiber) kan hjälpa. Rör på dig.",
    M: "IBS-M: Ät regelbundet och ändra en sak i taget så att du ser vad som påverkar dig.",
  };

  // ---------- Lagring ----------
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s) {
        return {
          log: s.log || {},
          custom: s.custom || [],
          boxes: s.boxes || [],
          settings: Object.assign({}, DEFAULTS.settings, s.settings || {}),
        };
      }
    } catch (e) { /* ignorera */ }
    return JSON.parse(JSON.stringify(DEFAULTS));
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignorera */ }
  }

  const state = load();
  const ui = { date: todayStr(), query: "", selectedId: null, servings: 4 };

  // ---------- Hjälpfunktioner ----------
  function todayStr() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function r1(n) { return Math.round(n * 10) / 10; }
  function r0(n) { return Math.round(n); }
  function allFoods() { return FOODS.concat(state.custom); }
  function foodById(id) { return allFoods().find((x) => x.id === id); }
  function dayEntries(date) { return state.log[date] || []; }
  function $(sel, root) { return (root || document).querySelector(sel); }

  function nutrition(food, grams) {
    const k = grams / 100;
    return { kcal: food.kcal * k, protein: food.protein * k, carbs: food.carbs * k, fat: food.fat * k, fiber: food.fiber * k };
  }
  function sumNutrition(list) {
    const t = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    list.forEach(({ food, grams }) => {
      const n = nutrition(food, grams);
      for (const k in t) t[k] += n[k];
    });
    return t;
  }
  function levelOf(food) {
    if (food.safeG === 0) return "red";
    if (food.safeG === null || food.safeG === undefined) return "green";
    return "yellow"; // beror på mängd
  }
  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }

  // ---------- Flikar ----------
  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b === btn));
      document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
      $("#view-" + btn.dataset.tab).classList.add("active");
      if (btn.dataset.tab === "today") { updateTotals(); updateLog(); }
      if (btn.dataset.tab === "recipes") renderRecipes();
      if (btn.dataset.tab === "settings") renderSettings();
      window.scrollTo(0, 0);
    });
  });

  // ---------- IDAG ----------
  function renderToday() {
    const root = $("#view-today");
    root.innerHTML = `
      <div class="card">
        <label for="date">Datum</label>
        <input type="date" id="date" value="${ui.date}" />
      </div>

      <div class="card" id="totals-card"></div>

      <div class="card">
        <h2>Lägg till mat</h2>
        <label for="q">Sök livsmedel</label>
        <input type="text" id="q" placeholder="t.ex. ris, lax, banan" autocomplete="off" value="${esc(ui.query)}" />
        <div id="results"></div>
        <div id="selected"></div>
        <div id="check"></div>
      </div>

      <div class="card">
        <h2>Dagens mat</h2>
        <div id="log"></div>
        <div id="daytips"></div>
        <div id="savebox" style="display:none">
          <h3>Gör en matlåda av dagens mat</h3>
          <div class="row">
            <div><label for="mb-name">Namn</label><input type="text" id="mb-name" placeholder="t.ex. Kycklinglåda" /></div>
            <div><label for="mb-n">Antal portioner</label>
              <select id="mb-n">${[1, 2, 3, 4, 5, 6, 8, 10].map((n) => `<option value="${n}" ${n === 4 ? "selected" : ""}>${n}</option>`).join("")}</select>
            </div>
          </div>
          <div class="why" style="margin:6px 0">Mängderna i listan delas på antal portioner. Matlådan hamnar under fliken Matlådor.</div>
          <div class="actions"><button class="btn" id="mb-save">Spara som matlåda</button></div>
        </div>
      </div>

      <div class="card">
        <details>
          <summary>Lägg till eget livsmedel</summary>
          <div class="grid2">
            <div style="grid-column: 1 / -1"><label>Namn</label><input type="text" id="c-name" /></div>
            <div><label>kcal / 100 g</label><input type="number" id="c-kcal" min="0" step="any" /></div>
            <div><label>Protein / 100 g</label><input type="number" id="c-protein" min="0" step="any" /></div>
            <div><label>Kolhydrater / 100 g</label><input type="number" id="c-carbs" min="0" step="any" /></div>
            <div><label>Fett / 100 g</label><input type="number" id="c-fat" min="0" step="any" /></div>
            <div><label>Fiber / 100 g</label><input type="number" id="c-fiber" min="0" step="any" /></div>
            <div>
              <label>FODMAP</label>
              <select id="c-fodmap">
                <option value="low">Lågt (ingen gräns)</option>
                <option value="limited">Begränsad mängd</option>
                <option value="high">Högt (undvik)</option>
              </select>
            </div>
            <div id="c-limit-wrap" style="grid-column: 1 / -1; display:none">
              <label>Max säker mängd (gram)</label><input type="number" id="c-limit" min="1" step="any" />
            </div>
          </div>
          <div class="actions"><button class="btn" id="c-save">Spara livsmedel</button></div>
        </details>
      </div>
    `;

    $("#date").addEventListener("change", (e) => {
      ui.date = e.target.value || todayStr();
      updateTotals(); updateLog();
    });
    $("#q").addEventListener("input", (e) => { ui.query = e.target.value; updateResults(); });
    $("#c-fodmap").addEventListener("change", (e) => {
      $("#c-limit-wrap").style.display = e.target.value === "limited" ? "block" : "none";
    });
    $("#c-save").addEventListener("click", saveCustomFood);
    $("#mb-save").addEventListener("click", saveBox);

    updateTotals(); updateResults(); updateSelected(); updateLog();
  }

  function updateTotals() {
    const entries = dayEntries(ui.date)
      .map((e) => ({ food: foodById(e.foodId), grams: e.grams }))
      .filter((x) => x.food);
    const t = sumNutrition(entries);
    const kg = state.settings.kcalGoal, pg = state.settings.proteinGoal;
    const kp = kg ? Math.min(100, (t.kcal / kg) * 100) : 0;
    const pp = pg ? Math.min(100, (t.protein / pg) * 100) : 0;
    $("#totals-card").innerHTML = `
      <div class="totals">
        <div class="total"><div class="num">${r0(t.kcal)}</div><div class="lbl">kcal</div></div>
        <div class="total"><div class="num">${r1(t.protein)}</div><div class="lbl">protein (g)</div></div>
        <div class="total"><div class="num">${r1(t.carbs)}</div><div class="lbl">kolhydrater (g)</div></div>
        <div class="total"><div class="num">${r1(t.fat)}</div><div class="lbl">fett (g)</div></div>
      </div>
      <div class="goal-line">Fiber: <b>${r1(t.fiber)} g</b></div>
      <div class="goal-line">Kalorier: ${r0(t.kcal)} av ${kg} kcal<div class="bar"><span style="width:${kp}%"></span></div></div>
      <div class="goal-line">Protein: ${r1(t.protein)} av ${pg} g<div class="bar"><span style="width:${pp}%"></span></div></div>
    `;
  }

  function updateResults() {
    const box = $("#results");
    const q = ui.query.trim().toLowerCase();
    if (!q) { box.innerHTML = ""; return; }
    const rank = (f) => { const n = f.name.toLowerCase(); return n.startsWith(q) ? 0 : n.split(/[\s,(/]+/).some((w) => w.startsWith(q)) ? 1 : 2; };
    const hits = allFoods()
      .filter((f) => f.name.toLowerCase().includes(q))
      .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, "sv"))
      .slice(0, 25);
    if (!hits.length) {
      box.innerHTML = '<div class="empty">Inga träffar. Lägg till som eget livsmedel nedan.</div>';
      return;
    }
    box.innerHTML = '<div class="results">' + hits.map((f) =>
      `<button class="result" data-action="pick" data-id="${esc(f.id)}"><span class="dot ${levelOf(f)}"></span>${esc(f.name)}</button>`
    ).join("") + "</div>";
  }

  function updateSelected() {
    const box = $("#selected");
    const check = $("#check");
    const food = ui.selectedId ? foodById(ui.selectedId) : null;
    if (!food) { box.innerHTML = ""; check.innerHTML = ""; return; }
    const defaultG = food.safeG ? Math.min(food.safeG, 150) : 100;
    box.innerHTML = `
      <div class="selected-food">
        <b>${esc(food.name)}</b>
        <button class="icon-btn" data-action="unpick" aria-label="Avmarkera">✕</button>
      </div>
      <div class="row" style="margin-top:10px">
        <div><label for="grams">Mängd (gram)</label><input type="number" id="grams" min="1" step="any" value="${defaultG}" /></div>
        <div style="align-self:end"><button class="btn" id="add-btn" style="width:100%">Lägg till</button></div>
      </div>
      ${food.safeG ? `<div class="actions"><button class="btn secondary small" data-action="safe">Sätt till säker mängd (${food.safeG} g)</button></div>` : ""}
    `;
    $("#grams").addEventListener("input", updateCheck);
    $("#add-btn").addEventListener("click", addEntry);
    updateCheck();
  }

  function updateCheck() {
    const food = foodById(ui.selectedId);
    const grams = parseFloat($("#grams").value);
    const box = $("#check");
    if (!food || !(grams > 0)) { box.innerHTML = ""; return; }
    const v = ibsVerdict(food, grams);
    const n = nutrition(food, grams);
    box.innerHTML = `
      <div class="verdict ${v.level}">
        <div class="v-title">${v.title}</div>
        <div>${esc(v.text)}</div>
        ${v.extras.length ? "<ul>" + v.extras.map((x) => `<li>${esc(x)}</li>`).join("") + "</ul>" : ""}
      </div>
      <div class="macros">${r0(n.kcal)} kcal · ${r1(n.protein)} g protein · ${r1(n.carbs)} g kolhydrater · ${r1(n.fat)} g fett · ${r1(n.fiber)} g fiber</div>
    `;
  }

  function addEntry() {
    const grams = parseFloat($("#grams").value);
    if (!ui.selectedId || !(grams > 0)) return;
    addToLog(ui.date, ui.selectedId, grams);
    ui.selectedId = null; ui.query = "";
    $("#q").value = "";
    updateResults(); updateSelected(); updateTotals(); updateLog();
    toast("Tillagd");
  }

  function addToLog(date, foodId, grams) {
    if (!state.log[date]) state.log[date] = [];
    state.log[date].push({ id: Date.now() + "-" + Math.random().toString(36).slice(2, 7), foodId, grams });
    save();
  }

  function updateLog() {
    const box = $("#log");
    const tips = $("#daytips");
    const entries = dayEntries(ui.date);
    const sb = $("#savebox");
    if (sb) sb.style.display = entries.length ? "block" : "none";
    if (!entries.length) {
      box.innerHTML = '<div class="empty">Inget inlagt än.</div>';
      tips.innerHTML = "";
      return;
    }
    box.innerHTML = entries.map((e) => {
      const food = foodById(e.foodId);
      if (!food) return "";
      const v = ibsVerdict(food, e.grams);
      const n = nutrition(food, e.grams);
      return `
        <div class="entry">
          <span class="dot ${v.level}" title="${esc(v.title)}"></span>
          <div class="main">
            <div class="name">${esc(food.name)} · ${r0(e.grams)} g</div>
            <div class="meta">${r0(n.kcal)} kcal · ${r1(n.protein)} g protein · ${esc(v.title)}</div>
          </div>
          <button class="icon-btn" data-action="del" data-id="${esc(e.id)}" aria-label="Ta bort">🗑</button>
        </div>`;
    }).join("");

    // Dagens tips
    let html = "";
    const near = entries.filter((e) => {
      const f = foodById(e.foodId);
      return f && f.safeG && e.grams / f.safeG >= 0.7;
    });
    if (near.length >= 3) {
      html += '<div class="tip warn">Flera livsmedel ligger nära sin gräns idag. FODMAP läggs ihop under dagen. Sprid ut dem eller minska någon portion.</div>';
    }
    const type = state.settings.type;
    if (type && TYPE_TIPS[type]) html += `<div class="tip">${esc(TYPE_TIPS[type])}</div>`;
    tips.innerHTML = html;
  }

  function saveCustomFood() {
    const name = $("#c-name").value.trim();
    if (!name) { toast("Skriv ett namn"); return; }
    const num = (id) => Math.max(0, parseFloat($(id).value) || 0);
    const kind = $("#c-fodmap").value;
    let safeG = null;
    if (kind === "high") safeG = 0;
    if (kind === "limited") {
      safeG = parseFloat($("#c-limit").value);
      if (!(safeG > 0)) { toast("Ange max säker mängd"); return; }
    }
    state.custom.push({
      id: "custom-" + Date.now(), name,
      kcal: num("#c-kcal"), protein: num("#c-protein"), carbs: num("#c-carbs"),
      fat: num("#c-fat"), fiber: num("#c-fiber"), safeG, note: "Eget livsmedel",
    });
    save();
    toast("Livsmedel sparat");
    renderToday();
  }

  // Klick-hantering för Idag
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const a = el.dataset.action;
    if (a === "pick") {
      ui.selectedId = el.dataset.id; ui.query = "";
      $("#q").value = ""; updateResults(); updateSelected();
    } else if (a === "unpick") {
      ui.selectedId = null; updateSelected();
    } else if (a === "safe") {
      const food = foodById(ui.selectedId);
      if (food && food.safeG) { $("#grams").value = food.safeG; updateCheck(); }
    } else if (a === "del") {
      state.log[ui.date] = dayEntries(ui.date).filter((x) => x.id !== el.dataset.id);
      save(); updateTotals(); updateLog();
    } else if (a === "recipe-log") {
      const r = findRecipe(el.dataset.id);
      if (!r) return;
      r.ingredients.forEach((i) => addToLog(ui.date, i.id, i.g));
      toast("1 portion tillagd i loggen (" + ui.date + ")");
    } else if (a === "recipe-copy") {
      copyIngredients(el.dataset.id);
    } else if (a === "box-del") {
      const b = state.boxes.find((x) => x.id === el.dataset.id);
      if (b && confirm('Ta bort matlådan "' + b.title + '"?')) {
        state.boxes = state.boxes.filter((x) => x.id !== b.id);
        save(); drawRecipes();
      }
    }
  });

  // ---------- MATLÅDOR ----------
  function recipeNutrition(r) {
    return sumNutrition(r.ingredients.map((i) => ({ food: foodById(i.id), grams: i.g })).filter((x) => x.food));
  }

  function renderRecipes() {
    const root = $("#view-recipes");
    root.innerHTML = `
      <div class="card">
        <h2>IBS-vänliga matlådor</h2>
        <p class="why" style="margin-top:0">Förslagen håller sig inom låga FODMAP-gränser per portion. Egna matlådor kan du skapa under fliken Idag. Välj hur många lådor du vill laga, så räknas inköpslistan om.</p>
        <label for="servings">Antal matlådor</label>
        <select id="servings">
          ${[1, 2, 3, 4, 5, 6, 8, 10].map((n) => `<option value="${n}" ${n === ui.servings ? "selected" : ""}>${n}</option>`).join("")}
        </select>
      </div>
      <div id="recipe-list"></div>
    `;
    $("#servings").addEventListener("change", (e) => { ui.servings = parseInt(e.target.value, 10); drawRecipes(); });
    drawRecipes();
  }

  function findRecipe(id) {
    return RECIPES.find((x) => x.id === id) || state.boxes.find((x) => x.id === id);
  }

  // Slå ihop dagens poster per livsmedel och dela på antal portioner.
  function saveBox() {
    const entries = dayEntries(ui.date).filter((e) => foodById(e.foodId));
    if (!entries.length) { toast("Lägg till mat först"); return; }
    const n = parseInt($("#mb-n").value, 10) || 1;
    const totals = {};
    entries.forEach((e) => { totals[e.foodId] = (totals[e.foodId] || 0) + e.grams; });
    const ingredients = Object.keys(totals).map((id) => ({ id, g: Math.round((totals[id] / n) * 10) / 10 }));
    const name = $("#mb-name").value.trim() || "Matlåda " + ui.date;
    state.boxes.unshift({
      id: "box-" + Date.now(), title: name, portions: n, ingredients,
      meal: "Egen matlåda", tags: ["Egen"], why: "", extras: [], steps: [],
    });
    save();
    $("#mb-name").value = "";
    toast("Matlåda sparad. Se fliken Matlådor.");
  }

  // Sammanfattning av IBS-läget för en matlåda (per portion).
  function boxVerdict(r) {
    const rank = { green: 0, yellow: 1, red: 2 };
    let worst = "green"; const issues = [];
    r.ingredients.forEach((i) => {
      const f = foodById(i.id);
      if (!f) return;
      const v = ibsVerdict(f, i.g);
      if (rank[v.level] > rank[worst]) worst = v.level;
      if (v.level !== "green") issues.push(f.name + " (" + v.title.toLowerCase() + ")");
    });
    return { level: worst, issues };
  }

  function recipeCard(r, mine) {
    const n = recipeNutrition(r);
    let why = esc(r.why || "");
    let verdictHtml = "";
    if (mine) {
      const v = boxVerdict(r);
      const txt = v.level === "green" ? "Bra för magen. Alla ingredienser ligger inom säker mängd per portion."
        : v.level === "yellow" ? "Ser över: " + v.issues.join(", ") + "."
        : "Se upp: " + v.issues.join(", ") + ".";
      verdictHtml = `<div class="verdict ${v.level}"><div class="v-title">${v.level === "green" ? "Grön" : v.level === "yellow" ? "Gul" : "Röd"} matlåda</div><div>${esc(txt)}</div></div>`;
      why = r.portions + " portioner när du sparade den.";
    }
    return `
      <div class="card recipe">
        <h2>${esc(r.title)}</h2>
        <div class="tags"><span class="tag">${esc(r.meal)}</span>${r.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        <div class="why">${why}</div>
        ${verdictHtml}
        <div class="nutri">
          <span><b>${r0(n.kcal)}</b> kcal</span>
          <span><b>${r1(n.protein)}</b> g protein</span>
          <span><b>${r1(n.carbs)}</b> g kolh.</span>
          <span><b>${r1(n.fat)}</b> g fett</span>
          <span><b>${r1(n.fiber)}</b> g fiber</span>
        </div>
        <div class="why">Per portion. Inköp för ${ui.servings} ${ui.servings === 1 ? "låda" : "lådor"}:</div>
        <h3>Ingredienser</h3>
        <ul class="ing">
          ${r.ingredients.map((i) => {
            const f = foodById(i.id);
            const dot = f ? `<span class="dot ${ibsVerdict(f, i.g).level}"></span> ` : "";
            return `<li><span>${dot}${esc(f ? f.name : i.id)}</span><b>${r0(i.g * ui.servings)} g</b></li>`;
          }).join("")}
          ${r.extras.map((x) => `<li><span>${esc(x)}</span><span class="why">efter smak</span></li>`).join("")}
        </ul>
        ${r.steps.length ? `<h3>Så gör du</h3><ol class="steps">${r.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>` : ""}
        <div class="actions">
          <button class="btn" data-action="recipe-log" data-id="${r.id}">Ät 1 portion idag</button>
          <button class="btn secondary" data-action="recipe-copy" data-id="${r.id}">Kopiera inköpslista</button>
          ${mine ? `<button class="btn danger" data-action="box-del" data-id="${r.id}">Ta bort</button>` : ""}
        </div>
      </div>`;
  }

  function drawRecipes() {
    let html = "";
    if (state.boxes.length) {
      html += '<h2 class="section-title">Mina matlådor</h2>' + state.boxes.map((b) => recipeCard(b, true)).join("");
      html += '<h2 class="section-title">Förslag</h2>';
    }
    html += RECIPES.map((r) => recipeCard(r, false)).join("");
    $("#recipe-list").innerHTML = html;
  }

  function copyIngredients(id) {
    const r = findRecipe(id);
    if (!r) return;
    const lines = [r.title + " (" + ui.servings + " portioner)"];
    r.ingredients.forEach((i) => {
      const f = foodById(i.id);
      lines.push("- " + (f ? f.name : i.id) + ": " + r0(i.g * ui.servings) + " g");
    });
    r.extras.forEach((x) => lines.push("- " + x));
    const text = lines.join("\n");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast("Inköpslista kopierad"), () => toast("Kunde inte kopiera"));
    } else {
      toast("Kopiering stöds inte här");
    }
  }

  // ---------- INSTÄLLNINGAR ----------
  function renderSettings() {
    const s = state.settings;
    $("#view-settings").innerHTML = `
      <div class="card">
        <h2>Din IBS</h2>
        <label for="s-type">Typ (valfritt)</label>
        <select id="s-type">
          <option value="" ${s.type === "" ? "selected" : ""}>Vet ej / ingen</option>
          <option value="D" ${s.type === "D" ? "selected" : ""}>IBS-D (diarré)</option>
          <option value="C" ${s.type === "C" ? "selected" : ""}>IBS-C (förstoppning)</option>
          <option value="M" ${s.type === "M" ? "selected" : ""}>IBS-M (blandad)</option>
        </select>
      </div>
      <div class="card">
        <h2>Dagsmål</h2>
        <div class="grid2">
          <div><label for="s-kcal">Kalorier (kcal)</label><input type="number" id="s-kcal" min="0" value="${s.kcalGoal}" /></div>
          <div><label for="s-protein">Protein (g)</label><input type="number" id="s-protein" min="0" value="${s.proteinGoal}" /></div>
        </div>
      </div>
      <div class="card">
        <h2>Data</h2>
        <p class="why" style="margin-top:0">All data sparas bara i din webbläsare.</p>
        <div class="actions">
          <button class="btn secondary" id="export-btn">Exportera (JSON)</button>
          <button class="btn danger" id="reset-btn">Rensa all data</button>
        </div>
      </div>
      <div class="card">
        <h2>Om gränserna</h2>
        <p class="why" style="margin-top:0">Grön = bra för magen. Gul = lite över säker mängd. Röd = undvik eller för mycket. Gränserna är ungefärliga och kan skilja sig från Monash-appen. Hos många fungerar det att testa en ny mat i taget och föra anteckningar.</p>
      </div>
    `;
    $("#s-type").addEventListener("change", (e) => { state.settings.type = e.target.value; save(); });
    $("#s-kcal").addEventListener("change", (e) => { state.settings.kcalGoal = Math.max(0, parseFloat(e.target.value) || 0); save(); });
    $("#s-protein").addEventListener("change", (e) => { state.settings.proteinGoal = Math.max(0, parseFloat(e.target.value) || 0); save(); });
    $("#export-btn").addEventListener("click", exportData);
    $("#reset-btn").addEventListener("click", () => {
      if (confirm("Rensa all data? Det går inte att ångra.")) {
        localStorage.removeItem(KEY);
        location.reload();
      }
    });
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ibs-koll-" + todayStr() + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  // ---------- Start ----------
  renderToday();

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();

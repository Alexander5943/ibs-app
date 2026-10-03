# IBS-koll

En enkel app för dig med IBS. Logga det du äter och få koll på näring och magen.

## Funktioner

- **Näringsberäkning:** Ange livsmedel och mängd i gram. Appen räknar ut kalorier, protein, kolhydrater, fett och fiber. Du ser dagssumman och framsteg mot dina mål.
- **IBS-bedömning:** Varje livsmedel får grön, gul eller röd bedömning utifrån mängden, baserat på lågt FODMAP-riktlinjer. Du får också varningar för fettrika portioner och tips om vad som kan trigga magen.
- **Matlådor:** 9 recept som är bra för IBS, med ingredienser per portion, näring och steg. Välj antal lådor så skalas inköpslistan. Lägg en portion i dagens logg med ett klick.
- **Egna livsmedel:** Lägg till mat som saknas, med egen FODMAP-gräns.
- **Privat:** All data sparas lokalt i din webbläsare. Ingen server, inga konton.
- **Mobilvänlig:** Fungerar som en app på telefonen (PWA).

## Köra appen

Ingen installation behövs. Öppna `index.html` i en webbläsare, eller starta en lokal server:

```bash
python3 -m http.server 8000
# öppna http://localhost:8000
```

### Lägg på telefonen

Publicera mappen med GitHub Pages (Settings → Pages → Deploy from branch → `main`). Öppna sedan sidan på telefonen och välj "Lägg till på hemskärmen".

## Testa

```bash
node check.js
```

Kontrollerar att alla livsmedel har giltiga värden, att alla matlådor håller sig inom FODMAP-gränserna och att bedömningslogiken fungerar.

## Struktur

```
index.html          sidan
styles.css          utseende
app.js              logik och gränssnitt
foods.js            livsmedel, näring och FODMAP-gränser
recipes.js          matlådor
sw.js, manifest     offline och installation på telefon
icon.svg            ikon
check.js            kontrollskript
```

## Viktigt

Appen ersätter inte läkare eller dietist. Näringsvärden och FODMAP-gränser är ungefärliga riktvärden. Kontrollera alltid mot Monash University FODMAP-appen, som uppdateras löpande. Har du långvariga besvär, blod i avföringen eller oförklarlig viktnedgång ska du kontakta vården.

## Lägga till livsmedel

Lägg till en rad i `foods.js`:

```js
f("id", "Namn", kcal, protein, kolhydrater, fett, fiber, safeG, "anteckning")
```

Alla värden är per 100 g. `safeG` är max säker mängd i gram, `null` om ingen gräns finns och `0` om livsmedlet bör undvikas.

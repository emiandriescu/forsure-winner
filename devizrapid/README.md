# DevizRapid

**Generator de oferte și devize PDF pentru firme de instalații** (electrice, HVAC, sanitare, PSI).
Aplicație web 100% în browser — fără server, fără costuri de hosting, fără cont necesar pentru a începe.

> Obiectiv de business: **~25 clienți × €40/lună = €1000/lună**. Nu ai nevoie de mii de utilizatori, ci de ~25 de firme mici cărora le rezolvi o durere reală: să facă oferte frumoase, rapid, fără Excel.

---

## Ce face acum (MVP funcțional)

- **Catalog de prețuri** — articolele tale recurente (manoperă, materiale, echipamente, servicii). Le adaugi o dată, le refolosești în orice ofertă. Buton „Încarcă exemple" pentru instalații electrice.
- **Date firmă** — logo, CUI, Reg. Com., IBAN, contact. Apar automat în antetul fiecărei oferte.
- **Editor oferte** — client, articole din catalog sau scrise pe loc, cantități, discount %, cotă TVA configurabilă (21/19/11/9/5/0), observații.
- **Calcul automat** — subtotal, discount, TVA, total — în timp real.
- **PDF profesional** — generat prin print-to-PDF, cu diacritice românești perfecte, antet, semnături, footer cu IBAN.
- **Istoric oferte** — listă, deschidere, **dublare** (refaci o ofertă similară în 5 secunde), ștergere.
- **Export / Import** — copie de siguranță în JSON. **Datele sunt salvate doar în browserul tău** — fă export regulat.

## Structura fișierelor

| Fișier | Ce e |
|--------|------|
| `index.html` + `landing.css` | **Pagina de prezentare** (ce văd clienții la `sowilo.ro/devizrapid/`) |
| `app.html` + `style.css` + `app.js` | **Aplicația** propriu-zisă (butonul „Încearcă gratuit" duce aici) |
| `GHID-PASI.md` | **Ghidul tău pas-cu-pas** — exact ce ai TU de făcut ca să ajungi la primii clienți |

## Cum rulezi

Deschide `index.html` în browser (pagina de prezentare) sau `app.html` direct (aplicația). Pentru a o pune online gratuit, vezi pașii din **`GHID-PASI.md`** (publicare prin GitHub Pages la `sowilo.ro/devizrapid/`).

👉 **Începe de la `GHID-PASI.md`** — acolo e tot planul concret spre 1000 €/lună.

---

## Roadmap spre €1000/lună

### Faza 1 — Validare (acum → 2 săptămâni) — **NU scrie cod nou**
Scopul nu e o aplicație perfectă, ci să afli dacă oamenii plătesc.
1. Pune-o online (link public).
2. Folosește-o tu, la SOWILO, pentru ofertele reale. Dacă te ajută pe tine, ajută și pe alții.
3. Vorbește cu **10 firme mici de instalații** (grupuri Facebook de electricieni/instalatori, contacte din branșă, furnizori). Arată-le. Întreabă: *„Ai plăti €40/lună pentru asta?"*
4. Dacă ≥3 din 10 zic „da, când pot plăti?" → ai semnal. Treci la Faza 2.

### Faza 2 — Transformă-l în SaaS real (când ai validare)
Ce trebuie adăugat ca să poți încasa abonamente:
- **Conturi + cloud** (datele să nu mai stea doar local): cea mai rapidă cale e **Supabase** (auth + bază de date, plan gratuit generos) sau **Firebase**. Migrarea e ușoară — `state`-ul aplicației e deja un singur obiect JSON.
- **Plăți recurente**: **Stripe** sau, pentru România/UE fără firmă de plăți proprie, **Lemon Squeezy / Paddle** (ei sunt „merchant of record" — se ocupă de TVA/facturi UE în locul tău). Abonament €40/lună, trial 14 zile.
- **Limită free vs. plătit**: ex. gratis = max 3 oferte/lună; plătit = nelimitat + logo + export. Asta creează motivul de upgrade.

### Faza 3 — Creștere spre 25+ clienți
- **SEO/conținut**: articole „cum faci o ofertă de instalații electrice", șablon gratuit → captezi firme care caută pe Google.
- **Reclame mici**: €100-200 test pe Facebook/Google targetat pe „firme instalații România".
- **Funcții care cresc valoarea** (poți cere mai mult de €40): conversie ofertă → factură, semnătură electronică a clientului, șabloane pe domenii (PSI / HVAC / sanitare), generare deviz pe articole de normativ.

### Idei de extindere a nișei (cresc prețul/clientul)
- Modul **P118** (desfumare/stingere/hidranți) — exact expertiza SOWILO — ca add-on premium.
- Generare automată **memoriu tehnic** și liste de cantități.

---

## Structură cod

| Fișier | Rol |
|--------|-----|
| `index.html` | Structura UI (taburi, modale, print view) |
| `style.css` | Stil aplicație + stil document PDF (`@media print`) |
| `app.js` | Toată logica: state în `localStorage`, catalog, oferte, calcule, PDF, export/import |

Fără build, fără dependențe, fără framework — ușor de întreținut și de extins.

## Limitări actuale (conștiente, pentru MVP)
- Datele stau în `localStorage` (un browser, un dispozitiv). De aceea există Export/Import. Cloud-ul vine în Faza 2, **după** validare.
- Fără conturi și fără plăți încă — se adaugă doar când există cerere reală (vezi roadmap).

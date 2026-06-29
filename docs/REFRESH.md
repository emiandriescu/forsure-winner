# Reîmprospătarea documentului `tendinte-mep.md`

Acest fișier conține (1) un **prompt reutilizabil** pe care îl rulezi ca să actualizezi
`docs/tendinte-mep.md` cu noutățile din domeniu și (2) **instrucțiuni** pentru a programa
reîmprospătarea automată **trimestrială** în Claude Code pe web.

Documentul rămâne de uz intern — reîmprospătarea deschide doar un **PR draft**, nu publică nimic online.

---

## 1. De ce nu un „loop" intern

Claude Code pe web rulează într-un mediu **efemer**: containerul se reciclează după inactivitate, iar
un cron/`/loop` pornit într-o sesiune **expiră în maxim 7 zile**. Deci o reîmprospătare reală la 3 luni
**nu** se poate face dintr-o sesiune. Soluția corectă e o **sesiune programată recurentă** (trigger la
nivel de platformă) care pornește o sesiune nouă, rulează promptul de mai jos și deschide un PR draft.

---

## 2. Promptul de reîmprospătare (copiază-l ca atare în sesiunea programată)

> **Context:** Ești într-o sesiune de reîmprospătare a documentului `docs/tendinte-mep.md` din acest repo
> — un radar tehnologic MEP în limba română, organizat pe rubrici de instalație, cu clasificare
> ✅ matur / 📈 tendință reală / ⚠️ hype. Documentul e de **uz intern** (SOWILO SRL) — **nu** publica nimic
> online; la final deschizi doar un **PR draft**.
>
> **Sarcină:**
> 1. Citește `docs/tendinte-mep.md` ca să înțelegi structura, rubricile și clasificările actuale.
> 2. Pentru **fiecare rubrică** (1–10) și pentru ancorele de reglementare, fă research web pe noutățile
>    apărute **de la data „Ultima actualizare" din document până azi**. Țintește surse autoritare și
>    recente: ASHRAE, REHVA, CIBSE, EHPA, Eurovent, producători majori, reglementări UE (EUR-Lex, Comisia
>    Europeană, ECHA) și RO (Monitorul Oficial, legislatie.just.ro, mdlpa.ro, anre.ro, afm.ro, energie.gov.ro).
> 3. Verifică în special elementele marcate *incert* din document și **declanșatoarele de reglementare cu
>    termen în calendar** (vezi secțiunea „Cele mai apropiate declanșatoare de reglementare"): confirmă ce
>    s-a întâmplat între timp (ex. stadiul transpunerii EPBD în RO, mandatul solar, F-Gas, restricția PFAS,
>    P118, scheme de finanțare PNRR/Fond Modernizare/Casa Verde, ediții noi de normative/standarde).
> 4. Actualizează documentul: corectează clasificările care s-au schimbat, adaugă tehnologii/teme noi
>    relevante, actualizează datele de reglementare, **adaugă/actualizează sursele** cu link + an. Păstrează
>    stilul, legenda și structura existente. Marchează explicit ce nu se poate confirma din sursă primară.
> 5. Schimbă „**Ultima actualizare**" din antet la data curentă.
> 6. Adaugă la începutul documentului (sub antet) un mini-**changelog**: „## Modificări față de ediția
>    anterioară (AAAA-LL-ZZ)" cu 5–15 puncte despre ce s-a schimbat (clasificări mutate, teme noi, termene
>    de reglementare împlinite). Dacă există deja un changelog de la rularea precedentă, păstrează-l ca
>    istoric (mută-l mai jos sub un sub-titlu „Istoric") și pune noul changelog deasupra.
> 7. Fă research-ul cu agenți în paralel pe grupuri de rubrici (ca să fie rapid și aprofundat).
> 8. Comite pe un **branch nou** `claude/mep-refresh-AAAA-LL` și deschide un **PR draft** către `main`
>    (NU face merge, NU publica pe site). În descrierea PR-ului, rezumă changelogul.
>
> **Reguli:** nu inventa cifre; orice afirmație nouă cu sursă; necunoscutele rămân marcate *incert*. Nu
> atinge codul site-ului (HTML/CSS/JS) — doar `docs/`.

---

## 3. Cum programezi reîmprospătarea trimestrială (Claude Code web)

1. Intră în Claude Code pe web și deschide repo-ul **`emiandriescu/forsure-winner`**.
2. Creează un **trigger / sesiune programată recurentă** (scheduled session) pe acest repo. În
   configurarea triggerului:
   - **Cadență:** trimestrial (la fiecare 3 luni). Sugestie de date: 1 mar / 1 iun / 1 sep / 1 dec.
   - **Prompt:** lipește integral promptul din secțiunea 2 de mai sus.
   - **Branch de pornire:** `main` (sesiunea va crea singură branch-ul `claude/mep-refresh-...`).
3. Salvează. La fiecare declanșare, sesiunea rulează research-ul, actualizează documentul și deschide un
   PR draft pe care îl revizuiești și îl închizi/mergi manual când ești mulțumit.

Documentația oficială pentru sesiuni/triggere programate:
**https://code.claude.com/docs/en/claude-code-on-the-web**

> Dacă interfața nu oferă (încă) programare recurentă pentru repo-ul tău, alternativa e să rulezi manual
> promptul din secțiunea 2 o dată pe trimestru — efectul e identic (PR draft cu actualizările).

---

## 4. Ce să prioritizezi la fiecare rulare

Domeniul se mișcă cel mai repede pe reglementare. La fiecare reîmprospătare, verifică în primul rând:

- **Transpunerea EPBD reformat în România** (corpul principal al Directivei 2024/1275) — cel mai important
  element incert; caută legea de modificare a Legii 372/2005 în Monitorul Oficial.
- **Termene UE cu impact pe proiectare:** mandat solar (praguri 2026–2030), F-Gas (GWP-150 monobloc 2027),
  restricția PFAS la ECHA (decizie ~2027), ZEB 2028/2030, raportare GWP pe ciclu de viață.
- **Normative & standarde RO/EU noi:** ediții/erate la P118, I5/I7/I9/I13, Mc 001, SR EN (54, 12101, 12845,
  16798, 378); tranziția CPR (UE) 2024/3110.
- **Scheme de finanțare RO:** sesiuni noi PNRR / Fondul de Modernizare / Casa Verde / Termoficare și
  termenele lor (mai ales termenul-limită PNRR).
- **Produse/maturitate:** ce a trecut din 📈 în ✅ sau din ⚠️ în 📈 (ex. pompe de căldură HT, BACnet/SC,
  detecție video AI, stocare baterii/ESS, instrumente AI de proiectare).

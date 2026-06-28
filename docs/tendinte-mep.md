# Tendințe tehnologice în instalațiile MEP — radar SOWILO

> **Ultima actualizare:** 28 iunie 2026
> **Scop:** un document de referință intern, actualizat periodic, care separă tendințele
> reale din instalații (mecanice, electrice, sanitare + securitate la incendiu) de soluțiile
> mature care merită adoptate acum și de cele aflate doar în zona de „hype". Accent pe piața
> din România și pe tipurile de proiecte SOWILO (birouri, rezidențial, monumente, retail,
> industrial, depozite, spitale, învățământ).

## Cum citești acest document (legendă)

| Simbol | Semnificație | Ce faci cu el |
|--------|--------------|----------------|
| ✅ | **Matur / soluție bună** — dovedit, standardizat, deseori deja cerut de reglementare | Adoptă acum ca standard de proiectare |
| 📈 | **Tendință reală** — adopție în creștere, valoare confirmată dar cu rezerve | Adoptă selectiv, pe proiectele potrivite; urmărește evoluția |
| ⚠️ | **Hype / imatur** — supra-promovat, de nișă, sau fără justificare tehnică/economică încă | Pilotează sau doar monitorizează; nu construi oferta pe el |

**Notă de metodă:** clasificările se bazează pe research web din 2025–2026 (ASHRAE, REHVA,
CIBSE, EHPA, Eurovent, reglementări UE și RO, producători). Cifrele de tip „economie de X%"
sau dimensiuni de piață provenite de la furnizori sunt **orientative, nu de proiectare**.
Acolo unde o afirmație nu a putut fi verificată din sursă primară, este marcată explicit ca
*incertă* — de confirmat înainte de a o folosi într-un proiect ștampilat sau o ofertă.

---

## Ancore de reglementare (valabile transversal)

Aceste reglementări determină majoritatea tendințelor de mai jos. Le grupăm aici ca să nu le
repetăm în fiecare rubrică:

- **EPBD reformat — Directiva (UE) 2024/1275**: în vigoare din 28 mai 2024, termen de
  transpunere **29 mai 2026** (deja depășit). Clădiri cu emisii zero (ZEB) pentru clădiri
  publice noi din **1 ian 2028** și toate clădirile noi din **1 ian 2030**; obligația **solar
  fotovoltaic** eșalonată 2026–2030; raportarea **GWP pe ciclu de viață** pentru clădiri noi
  >1.000 m² din 2028, toate din 2030; **BACS** (automatizare) obligatoriu pentru clădiri
  nerezidențiale >290 kW (acum), prag scăzut la >70 kW până în 2029.
  > ⚠️ **De verificat:** stadiul real al transpunerii în România (Monitorul Oficial). Termenul
  > de 29 mai 2026 a trecut; detaliul național (praguri, date exacte) este incert. Baza RO:
  > Legea 372/2005, modificată prin Legea 238/2024; metodologia Mc 001-2022.
- **F-Gas — Regulamentul (UE) 2024/573**: limite de GWP pe agenți frigorifici (vezi HVAC).
- **EED — Directiva (UE) 2023/1791**: redefinește „termoficarea eficientă" (vezi termice).
- **DWD — Directiva (UE) 2020/2184** (apă potabilă): planuri de management al riscului
  obligatorii **până la 31 dec 2026** (vezi sanitare — Legionella).
- **NIS2** transpus în România (OUG 155/2024; Legea 124/2025; Ordinele DNSC 1 și 2/2025, în
  vigoare din 20 aug 2025): securitatea cibernetică OT/BMS este acum **obligație legală**.
- **Securitate la incendiu RO:** **P118-1/2025** (publicat în M.Of. 10 mar 2025, în vigoare
  ~8–10 mai 2025) înlocuiește ediția veche; detecția rămâne pe **P118/3-2015**, iar
  ventilarea/desfumarea se corelează cu **I5-2022**.

---

## 1. Instalații electrice

| Tehnologie | Verdict |
|------------|---------|
| KNX / DALI-2 (control iluminat) | ✅ |
| Fotovoltaic pe acoperiș + stocare | ✅ |
| Încărcare EV + management dinamic al sarcinii | ✅ (V2G 📈) |
| Iluminat human-centric / tunable-white | 📈 (beneficiile „de sănătate" sunt hype) |
| BIPV (fotovoltaic integrat în anvelopă) | 📈 (cifre de piață slabe) |
| Întrerupătoare cu semiconductor (SSCB) | 📈 (imatur pentru AC uzual) |
| Iluminat PoE (Power-over-Ethernet) | ⚠️ |
| Microrețele DC / alimentare DC în clădiri | ⚠️ |

### Soluții bune, mature (✅)
- **KNX / DALI-2** este coloana vertebrală standardizată și interoperabilă pentru controlul
  iluminatului comercial în UE. DALI-2 (interoperabilitate certificată) + KNX/BACnet rămâne
  alegerea conservatoare, aliniată la cerința EPBD de BACS și control zonal/pe prezență.
- **Fotovoltaic pe acoperiș + stocare**: bancabil, module ~22% randament (2025), amortizare
  ~4–9 ani. Economia depinde acum de **autoconsum** (un kWh autoconsumat valorează de 2–8× unul
  exportat), deci stocarea devine regula, nu opțiunea. **Relevanță RO foarte mare:** Legea
  255/2024 face stocarea practic obligatorie pentru prosumatorii fotovoltaici până la 31 dec
  2027 (altfel plafon de export 3 kW). România avea ~3,35 GW / ~288k prosumatori în nov. 2025.
- **Încărcare EV + management dinamic al sarcinii (DLM)**: AC/DC matur și acum cerut de
  reglementare (AFIR, ISO 15118-20 din vara 2025). DLM este valoarea reală de inginerie — evită
  supradimensionarea branșamentului și e deseori elementul critic de proiectare.

### Tendințe reale, de adoptat selectiv (📈)
- **Iluminat human-centric / tunable-white**: tehnologia (CCT reglabil + control) e matură;
  beneficiile de confort vizual și coordonare energetică sunt reale. **Atenție:** afirmațiile
  „circadian / productivitate / sănătate" rămân contestate științific (chiar și noul standard
  ANSI/IES RP-46-25 a fost criticat). Vinde-l pe confort + energie + conformitate EPBD, nu ca
  intervenție medicală dovedită. Diferențiator pentru birouri/healthcare premium.
- **BIPV (fotovoltaic integrat în fațadă/anvelopă)**: real și în creștere, dar costisitor
  (~€200–625/m² vs ~$2,56/W pentru fotovoltaic clasic) și cu randament mai slab pe fațadă.
  Justificat doar când oricum se cumpăra o anvelopă premium sau lipsește suprafața de acoperiș.
  Cifrele de piață sunt inconsistente între consultanți (*incerte*). Niciun semnal specific RO.
- **V2G / încărcare bidirecțională**: emergent, nu matur — afirmațiile de „comercializare
  completă 2025" sunt parțial hype. Proiectează pentru **pregătire V2G**, nu miza pe venituri.
- **Întrerupătoare cu semiconductor (SSCB)**: se livrează deja (Siemens SENTRON 3QD2, apr. 2026;
  Infineon SiC), dar aproape exclusiv în nișe DC/data-center. Cost ~2,5–3× față de cele clasice;
  MCB/MCCB rămân alegerea rațională pentru distribuția AC obișnuită. **Standard dedicat în lucru**
  (prEN IEC 60947-10:2025, draft). Pilotează doar în contexte DC / PV-baterie / EV / data-center.

### Doar hype / imatur (⚠️)
- **Iluminat PoE**: promovat de un deceniu drept „următorul mare lucru", adopția a subperformat
  constant. Funcționează în birouri/educație greenfield, dar costul inițial e cu ~25–40% mai mare
  și ecosistemul de instalatori e subțire. *Fără dovezi de adopție notabilă în RO/UE.* Atinge și
  granița electric vs IT (responsabilitate contractor) — neacoperit explicit de normativul I7.
- **Microrețele DC / alimentare DC în clădiri**: argumentul fizic (pierderi de conversie) e real,
  dar pentru clădiri obișnuite e imatur — fără standarde mature pentru niveluri de tensiune,
  protecție și conectori, iar protecția la defect e mai grea. Pilot doar în data-center/EV/
  industrial. Răspunsul pe partea de AC (PV + invertor hibrid cu stocare + DLM la EV) oferă ~90%
  din beneficiu astăzi, cu echipamente conforme.

**Reglementare RO/UE pentru electrice:** normativul **I7-2011** (actualizat prin Ordin 959/2023)
referă SR EN 60947-2 dar nu are prevederi pentru SSCB, PoE sau monitorizare pe circuit (lacune de
confirmat local). Pragurile EPBD/BACS împing direct KNX/DALI-2 și monitorizarea pe circuit.

---

## 2. Instalații sanitare

| Tehnologie | Verdict |
|------------|---------|
| Contorizare digitală a apei | ✅ |
| Pompe de circulație de înaltă eficiență (ECM) | ✅ |
| Vane independente de presiune (PICV) | ✅ |
| Materiale PEX / PP-R (și PP-RCT) | ✅ |
| Robineți touchless / senzori | ✅ |
| Control Legionella (cu strat digital) | ✅ control / 📈 digital |
| Recuperarea apei (ploaie / gri) | ✅ ploaie / 📈 gri |
| Detecție inteligentă a scurgerilor | 📈 |
| BIM pentru coordonarea conductelor | ✅ (digital twins ⚠️) |

### Soluții bune, mature (✅)
- **Contorizare digitală a apei**: cea mai solidă temă sanitară. Tehnologie LPWA matură (NB-IoT,
  LoRaWAN), economii demonstrate până la ~25% și reducere a pierderilor de rețea până la ~30%.
  **Avertisment onest:** economiile cer feedback/facturare către consumator, nu doar hardware AMI.
  **Vânt din spate:** Strategia UE de reziliență a apei (4 iun 2025), inițiativa „Smart Water
  Metering for All" + plan de digitalizare a apei așteptate în 2026. România nu e lider — oportunitate.
- **Pompe de circulație ECM**: practic o bază obligatorie prin reglementare, nu o tendință — EEI
  ≤ 0,23 din 2015 (Reg. UE 622/2012). Orice circulator nou (Grundfos, Wilo) e deja ECM. Valoarea
  de inginerie e în dimensionarea și modul de control corecte.
- **Vane independente de presiune (PICV)**: debit constant indiferent de variațiile de presiune →
  maximizează delta-T la baterii, scad energia de pompare, elimină vanele separate de echilibrare,
  accelerează punerea în funcțiune. Mai relevante pe partea HVAC hidronic decât pe apa potabilă.
- **PEX / PP-R**: termoplaste consacrate, standardizate (EN ISO 15874/15875). Noutatea reală e
  **PP-RCT** (cristalinitate modificată → presiuni PN20/25 mai mari, pereți mai subțiri) — o
  îmbunătățire incrementală, nu o schimbare de paradigmă. „Smart/hibrid" e marketing.
- **Robineți touchless / senzori**: maturi de 20+ ani, fiabili, economii reale de apă 30–50%.
  WC-urile „smart" au ROI clar doar în hoteluri/healthcare; narațiunea „baia care monitorizează
  sănătatea" e hype. Electronica durează ~5–10 ani vs zeci de ani ceramica (mentenanță mai mare).
- **Control Legionella**: obligația de reglementare e reală și se înăsprește — **DWD (UE) 2020/2184**
  cere planuri de management al riscului **până la 31 dec 2026**, declanșator comercial apropiat
  pentru spitale, hoteluri, cămine. Stratul digital (senzori IoT clip-on de temperatură, flushing
  inteligent) e 📈: reduce munca de logare, **dar nu înlocuiește** evaluarea de risc, flushingul
  anti-stagnare și testarea de cultură — monitorizarea de temperatură singură nu previne Legionella.

### Tendințe reale, de adoptat selectiv (📈)
- **Recuperarea apei**: colectarea apei de ploaie e matură și cu risc redus; **reutilizarea apei
  gri** e mai complexă, iar constrângerea e economică, nu inginerească (amortizare ~10–13 ani).
  > ⚠️ **Capcană de reglementare:** Reg. (UE) 2020/741 vizează **irigarea agricolă, NU reutilizarea
  > la nivel de clădire** — confuzie frecventă. Apa gri/de ploaie în clădiri e slab reglementată
  > în UE și RO; proiectează conservator, cu standarde proprii și dezinfecție/mentenanță robuste.
- **Detecție inteligentă a scurgerilor**: valoarea reală e monitorizarea continuă fixă care prinde
  scurgeri lente/ascunse înainte de daune. Elementul dovedit e senzorul de debit/vibrație + vană de
  închidere automată (mai fiabil decât acustica pură în clădire). Zgomotul HVAC degradează acuratețea
  acustică. Cifrele de furnizor („cu 96% mai multe scurgeri detectate") sunt marketing.

### De adoptat ca standard vs. de tratat cu scepticism
- **BIM pentru coordonarea conductelor (detecție coliziuni)**: matur, ROI pozitiv — ar trebui să fie
  **livrabil standard la SOWILO** (Navisworks, Revit, Revizto, ACC), reduce refacerile și RFI-urile.
- **Digital twins pentru instalații sanitare** ⚠️: încă supraevaluate și imature; valoare reală doar
  când rezolvă o problemă operațională preexistentă (detecție scurgeri, date de mentenanță FM).

---

## 3. Instalații termice și HVAC

| Tehnologie | Verdict |
|------------|---------|
| Agenți frigorifici cu GWP redus (F-Gas) | ✅ (obligatoriu) |
| Recuperare de căldură pe ventilare (MVHR/ERV) | ✅ |
| Ventilare controlată după cerere (CO₂/IAQ) | ✅ |
| Încălzire/răcire radiantă, TABS | ✅ |
| Chillere cu lagăre magnetice (oil-free) | ✅ |
| Pompe de căldură (inclusiv temperatură înaltă) | 📈 (nucleu matur) |
| DOAS (aer proaspăt dedicat) | 📈 |
| Termoficare 4G / 5G | 📈 (4G acum, 5G selectiv) |
| Stocare termică | ✅ rezervoare/UTES → ⚠️ PCM/termochimic |
| IAQ post-COVID / ASHRAE 241 | 📈 (voluntar, nu obligatoriu) |

### Soluții bune, mature (✅)
- **Agenți frigorifici cu GWP redus**: nu e o „tendință de evaluat", ci mandat sub **Reg. (UE)
  2024/573**. Limită de proiectare cheie: split <3 kg → **GWP-750 din 1 ian 2025**; sisteme
  mari/monobloc → **GWP-150 din 2027** (această distincție 2025-vs-2027 e des raportată greșit).
  Hartă practică: **R-32 (~675) și R-454B (~466)** trec pragurile 2025/2026 dar pică limita 2027 →
  tranziție pentru splituri/VRF; **R-290 (~3) și CO₂/R-744** sunt de viitor → standard pentru
  monobloc nou și ACM. Inflamabilitatea e constrângerea reală (IEC 60335-2-40 Ed.7): tabele de
  scalare după volumul camerei, detecție de scurgeri, fără surse de aprindere. *Tonajele de cotă și
  plafoanele de încărcare exacte — de verificat în textul primar.*
- **Recuperare de căldură (MVHR/ERV)**: practic obligatorie prin Ecodesign (Reg. UE 1253/2014, ≥73%
  pentru majoritatea unităților nerezidențiale bidirecționale). Întrebarea vie 2025–2026 e
  **entalpic vs senzitiv** (Eurovent REC 17-14 „Moisture recovery", ed. 1, 2025). Pentru clima RO
  (iarnă rece / vară umedă) roțile entalpice se justifică în multe clădiri comerciale, dar au **risc
  de contaminare/transfer de miros** — evită-le pentru exhaustare de healthcare/lab; păstrează
  recuperarea senzitivă cu plăci/contracurent ca implicit acolo unde nu trebuie transfer de umiditate.
- **Ventilare controlată după cerere (DCV, CO₂/IAQ)**: economii documentate de 24–46% din energia de
  ventilare; ASHRAE 62.1-2022 cere senzori de ±40 ppm ±3%. EPBD reformat o împinge puternic (monitorizare
  CO₂/PM). Riscul real nu e conceptul, ci **driftul senzorilor NDIR** (recalibrare la 12–24 luni) —
  specifică senzori de clasă 62.1-2022, plasare corectă în zona de respirație și buget de recalibrare.
- **Încălzire/răcire radiantă și TABS**: dovedite și standardizate (ISO 18566). Temperatura joasă de
  încălzire (~30–35 °C) și înaltă de răcire (~16–18 °C) sunt exact unde COP-ul pompei de căldură e
  maxim — cuplajul canonic sub electrificarea EPBD. Riscul real e **condensul în mod răcire** —
  menține suprafața peste punctul de rouă și decuplează sarcina latentă cu un **DOAS**. Pentru verile
  umede din sudul RO, nu dimensiona radiantul singur pentru sarcina latentă.
- **Chillere cu lagăre magnetice (oil-free)**: tehnologie dovedită de ~30 ani (Danfoss Turbocor).
  Avantajul de eficiență se concentrează la **sarcină parțială** — afirmațiile „40–50% IPLV mai bun"
  sunt marketing de caz optim (*incerte*). Specifică unde **orele de sarcină parțială domină**
  (data-center, comercial mare). Aliniere F-Gas bună (R-1234ze GWP ~1, A2L → impact pe camera de mașini,
  EN 378). Capex mare, service local mai subțire în RO.

### Tendințe reale, de adoptat selectiv (📈)
- **Pompe de căldură**: nucleul (aer-apă/aer-aer/hibrid) e matur; ce e cu adevărat emergent e
  **monoblocul R-290 de temperatură înaltă (75–80 °C)** pentru înlocuirea cazanelor în retrofit
  (Carrier 61AQ până la 75 °C la −7 °C, funcționare până la −25 °C; Daikin modular R-290). Banda de
  75–80 °C lasă **caloriferele existente pe loc** — pârghie concretă pentru fondul comercial vechi din
  RO. Piața UE a scăzut ~23% în 2024, apoi a revenit la ~10% creștere în 2025 — dar e elastică la
  subvenții, nu un breakthrough tehnologic. Eficiența scade ~10–25% sub −10 °C → proiectează **bivalent/
  backup** pentru iernile continentale RO; planifică în jurul **deficitului acut de instalatori**.
- **DOAS (aer proaspăt dedicat)**: decuplează ventilarea de sarcina senzibilă, evită supraventilarea.
  Cel mai bun caz e cuplat cu terminale radiante/grinzi reci (aer primar cu punct de rouă jos →
  previne condensul). În RO rămâne adopție selectivă (birouri, healthcare, laboratoare, școli cu
  ocupare variabilă). Conform cu **I5-2022**.
- **Termoficare 4G/5G**: adoptă **4GDH (temperatură joasă) acum** ca upgrade mainstream; tratează
  **5GDH/buclele ambientale ca piloturi greenfield selective**. **Relevanță RO majoră:** SACET-ul
  vechi, de temperatură înaltă și cu pierderi mari (București = cel mai mare sistem DH din UE) e cel
  mai bine servit de **4GDH** — reducerea temperaturilor de rețea, repararea pierderilor, integrarea
  de geotermal/căldură reziduală în topologia existentă. 5GDH integral nu se potrivește unei rețele
  degradate de temperatură înaltă. Finanțare alocată (~€388M PNRR + ~€361M Fondul de Modernizare;
  €200M geotermal București). Bankwatch semnalează dependența continuă de gaz ca risc de conformitate EED.

### Stocare termică — verdict împărțit
- **Rezervoare de apă (senzitive)**: ✅ practică standard pe orice proiect cu pompă de căldură/DH.
- **Stocare subterană (ATES/BTES)**: ✅ pentru stocare sezonieră; necesită due-diligence geologic.
- **Stocare cu gheață**: ✅ dar de nișă — doar cu sarcină mare de răcire + diferență de tarif zi/noapte.
- **PCM (latent) și termochimic**: ⚠️ multă cercetare în 2025, dar încă la nivel de lab/pilot la scară
  de clădire. Cere date de teren măsurate; nu le specifica implicit.

### IAQ post-COVID / ASHRAE 241 (📈, dar voluntar)
**ASHRAE 241-2023** (controlul aerosolilor infecțioși) e riguros tehnic, dar **rămâne voluntar peste
tot**, fără adopție în cod în UE/RO. Driverul efectiv obligatoriu în RO/UE e **EPBD reformat** (Art. 13
pune IEQ în lege; monitorizare IAQ pentru ZEB nerezidențiale), corelat cu **EN 16798-1/2** (bazat pe
confort/CO₂, nu pe transmisie de aerosoli). Practic: proiectează după 241 voluntar pentru spitale/școli/
laboratoare, cu **UV-C în zona superioară (dovedit) + filtre MERV-A ≥11**. **Far-UVC 222 nm rămâne pe
lista de monitorizare (⚠️)** — eficacitate bună în lab, dar întrebări de siguranță (ozon/UFP) deschise.

---

## 4. Detecție incendiu

> Reglementare: detecția în RO curge prin **P118/3-2015** (modificat prin Ordin 6025/2018), care cere
> conformitate SR EN 54 a componentelor și proiectare de sistem SR EN 54-13. Tranziția **CPR (UE)
> 2024/3110** (aplicabil din 8 ian 2026) schimbă modul de marcare CE — vechile hEN rămân baza CE până
> apar standarde noi în OJEU.

| Tehnologie | Verdict |
|------------|---------|
| Detecție prin aspirație (ASD / VESDA) | ✅ |
| Detectoare wireless adresabile (EN 54-25) | ✅ (nișă/hibrid) |
| Detectoare multi-criteriu (multi-senzor) | ✅ (3 criterii) |
| Detecție video cu AI (fum/flacără) | 📈 (suplimentar, nu primar EN 54) |

### Soluții bune, mature (✅)
- **Detecție prin aspirație (ASD/VESDA)**: standardul de aur pentru avertizare foarte timpurie în
  spații cu debit mare de aer și valoare ridicată (data-center, clean room, telecom, depozite,
  monumente cu trasee ascunse). Acoperită de **EN 54-20** (clase de sensibilitate A/B/C), acceptată
  sub P118/3. Nu e o tendință „de urmărit", e o unealtă implicită pentru aplicația potrivită. „AI"-ul
  din marketingul ASD e de fapt discriminare avansată de particule (mai puține alarme false) — valoare
  reală, dar nu paradigmă nouă. **prEN 54-20** e în revizuire (draft, de urmărit). Specifică după riscul
  real de debit, nu implicit (cost).
- **Detectoare wireless adresabile**: **EN 54-25** e obligatorie și mai mulți producători livrează
  sisteme certificate (Hochiki Ekho, Notifier Agile, Hyfire). Dovedite ca instalații permanente în
  zona lor — clădiri mici/medii, retrofit, monumente, situri cu azbest, bucle hibride. Limite vs cablat:
  ciclul de viață al bateriilor (un sistem de ~500 dispozitive ≈ 50–100 schimburi de baterii/an),
  interferențe RF, plafon real de scară pentru high-rise. În RO permise dacă componentele sunt **SR EN
  54-25** certificate (poziționate pentru clădiri fără infrastructură de cablu — muzee, clădiri istorice).
  *Lansări „complet wireless la scară" (ex. Ajax EN54, nov. 2025) — fără istoric independent încă; urmărește, nu specifica pe proiecte mari.*
- **Detectoare multi-criteriu (fum+căldură (+CO))**: produse de la toți marii producători, testate față
  de EN 54-29/30/31, cu respingere reală a alarmelor false confirmată de un studiu independent BRE × FIA.
  Implicitul sensibil pentru sisteme EN 54 moderne. **Nuanță de conformitate:** părțile 29/30/31 **nu**
  sunt armonizate CPR — producătorii marchează CE prin părțile mono-funcție (EN 54-5 căldură, EN 54-7
  fum) și folosesc 29/30/31 pentru aprobare voluntară (VdS/LPCB). Celulele CO au viață finită (~10 ani).
  P118/3-2015 recunoaște explicit detectoarele multi-senzor.

### Tendințe reale, de adoptat selectiv (📈)
- **Detecție video cu AI (fum/flacără)**: a trecut din hype în realitate pentru spații mari/deschise/
  înalte/inaccesibile (tuneluri, hangare, depozite, stații de deșeuri) unde camera „vede" focul la
  sursă. **Fapt de reglementare esențial:** **nu există parte EN 54 pentru detecția video** — doar
  ISO/TS 7240-29 (specificație tehnică, nivel inferior unei EN armonizate). Există certificări parțiale
  (FM 3232/3260, UL 268B doar fum, VdS, iar din 2025 **BRE/LPCB LPS 1976** pentru flacără video). În
  RO/UE este realist un **strat suplimentar sau de inginerie de incendiu, nu detecție primară de cod**.
  Tratează orice afirmație de „conformitate P118 ca sistem primar" drept neverificată. Se descurcă slab
  la abur, ceață, praf, scântei de sudură, întuneric, ocluzie. Cifrele de furnizor („0,5% alarme false",
  „de 3× mai rapid ca ASD") sunt marketing de laborator.

---

## 5. Stingere incendiu

> Reglementare RO: **P118/2-2025** referă seriile SR EN (ex. SR EN 14972 pentru ceață de apă, SR EN
> 12845 pentru sprinklere, EN 15004/EN 12094 pentru stingere cu gaze).

| Tehnologie | Verdict |
|------------|---------|
| Ceață de apă (water mist, HP/LP) | ✅ |
| Gaze inerte (IG-541 / IG-55) | ✅ |
| Sprinklere ESFR (depozite) | ✅ |
| Reducerea oxigenului / hipoxic (prevenție) | 📈 |
| Stingere baterii litiu / ESS | 📈 |
| FK-5-1-12 / Novec 1230 (pentru proiecte noi, lungă durată) | ⚠️ (risc de reglementare) |

### Soluții bune, mature (✅)
- **Ceață de apă (water mist)**: HPWM (>35 bar, ex. Marioff HI-FOG) e FM-Approved și standardizată EN;
  marele câștigător pe termen scurt din restrângerea agenților „clean". FM Approved pentru data-center,
  deployment-uri reale 2025–2026. Până la ~90% reducere a consumului de apă vs sprinklere clasice.
  **Potrivire RO foarte bună:** P118/2-2025 referă deja seria **SR EN 14972** → direct specificabilă, fără
  gol de reglementare. Avantajul cheie față de agenții PFAS al căror viitor e acum incert.
- **Gaze inerte (IG-541 Inergen / IG-55 Argonite)**: dovedite, listate NFPA 2001 / ISO 14520 / EN 15004,
  reduc O₂ la ~12–12,5%. **Avantaj decisiv 2026:** NU sunt PFAS, ODP/GWP zero, complet în afara restricției
  ECHA. Pe măsură ce FK-5-1-12 și HFC-urile (FM-200) intră sub presiune, gazul inert e pariul cu cel mai
  mic risc de reglementare pentru spații electronice/speciale ocupate. Compromisuri de comunicat
  clientului: bănci mari de butelii, timpi de descărcare mai lungi (~60–120 s), nivel acustic ridicat
  (~140 dB → necesită duze silențioase), ventilare obligatorie de suprapresiune.
- **Sprinklere ESFR**: standardul de îngrijire pentru depozite/stocare înaltă (NFPA 13 / EN). **Atenție:**
  ESFR e **neiertător** — reguli stricte de obstrucții, incompatibil cu draft curtains, rafturile cu
  poliță plină forțează oricum sprinklere în raft. În RO se proiectează sub **SR EN 12845**.

### Tendințe reale, de adoptat selectiv (📈)
- **Sisteme de reducere a oxigenului / hipoxice (prevenție)**: mențin permanent O₂ la ~15–16% ca focul
  să nu poată porni — prevenție, nu stingere. Potrivire: data-center, depozite automate high-bay, arhive,
  depozite frigorifice. Momentum real în 2025 (WAGNER OxyReduct F-Line a primit aprobare FM). „Emergent"
  pentru că: capex + cost de funcționare continuu (generare N₂ 24/7), guvernanță de sănătate ocupațională
  pentru mediu cu O₂ redus, ROI doar pentru active de mare valoare. Acoperit de **EN 16750** / CEN/TR 16832.
  > ⚠️ **De verificat:** tratarea explicită în P118/2-2025 a sistemelor permanente de reducere a oxigenului
  > nu a fost confirmată — probabil necesită acceptare ISU / echivalență inginerească. Confirmă înainte de a specifica.
- **Stingere baterii litiu / ESS**: cea mai dinamică zonă. **NFPA 855 (ediția 2026)** e referința actuală
  (aliniere cu detecția NFPA 72, teste la scară mare LSFT, acoperire pentru chimii non-litiu). **Limitare
  de comunicat:** odată pornit ambalajul termic într-o celulă, **niciun sistem de stingere nu îl oprește**
  — stingerea/apa țintesc propagarea, răcirea și protecția unităților adiacente, nu ambalajul termic în
  sine. Prevenția exploziei (ventilare de deflagrație NFPA 68/69, detecție gaze) e la fel de importantă.
  Fii sceptic la orice furnizor care pretinde că „stinge" un incendiu de baterie. Relevant pentru pipeline-ul
  RO crescând de BESS și solar+stocare — merită construită expertiză internă acum.

### Doar hype / de evitat ca alegere implicită (⚠️)
- **FK-5-1-12 / Novec 1230 pentru active noi de lungă durată în UE**: substanța funcționează bine, dar
  traiectoria legală/de aprovizionare e problema. **3M a oprit toată producția de PFAS la final 2025**
  (inclusiv Novec 1230 de marcă); FK-5-1-12 continuă prin producători generici, dar ancora de aprovizionare
  a dispărut. **FK-5-1-12 este clasificat PFAS de UE** → în scopul restricției REACH. Ultimele etape ECHA
  (2026) susțin o restricție PFAS la nivel UE cu derogări țintite (propunere de tranziție 18 luni + derogare
  12 ani pentru agenți de stingere „curați" fără alternative). **Decizie a Comisiei realist în 2027**
  (*timing incert, inferat*). **Ghid practic:** utilizabil azi și o derogare de 12 ani cumpără timp mediu,
  dar fiecare specificație nouă în UE poartă povară de conformitate (planuri de management, monitorizare),
  risc de preț/aprovizionare și expunere reputațională. Pentru active noi de lungă durată, preferă gaz inert
  sau ceață de apă; dacă alegi FK-5-1-12, documentează rațiunea („fără alternativă compatibilă cu activul")
  și o strategie de ieșire. *(Notă: spumele de stingere (FFF) sunt reglementate separat, Reg. UE 2025/1988.)*

---

## 6. Desfumare (evacuare fum și gaze fierbinți)

> Reglementare RO: **P118/1-2025** (în vigoare ~mai 2025) recunoaște explicit atât evacuarea naturală-
> organizată cât și mecanică și comanda manuală centralizată (UCMS). RO transpune seria EN 12101 prin SR EN.
> *Notă: sursele RO consultate au returnat 403 la fetch direct; detaliile (strat de fum 1,80 m, tubulatură
> EI/REI 60, UCMS) sunt consistente între mai multe surse dar de confirmat în textul oficial MDLPA.*

| Tehnologie | Verdict |
|------------|---------|
| Presurizare casa scării / sas (PDS) | ✅ (aplică EN 12101-13, doar suprapresiune) |
| Simulare CFD a fumului (FDS) | ✅ unealtă (cu scepticism) |
| Surse de alimentare panou (EN 12101-10) | ✅ |
| Panouri de control integrate (EN 12101-9) | 📈 (în flux) |
| Ventilare naturală vs mecanică | ✅ ambele (selecția e decizia de inginerie) |
| Surogate AI/ML pentru CFD | ⚠️ |

### Soluții bune, mature (✅)
- **Presurizare (PDS)**: tehnică de siguranță dovedită de zeci de ani (~50 Pa suprapresiune în scara
  protejată). Schimbarea cheie post-2022 e restructurarea standardelor: calculul a trecut în **EN
  12101-13:2022**, care **a eliminat sistemele de depresiune, permițând doar suprapresiune** — schimbare
  reală pe care inginerii RO trebuie s-o aplice. Pentru clădirile înalte/foarte înalte sub P118/1-2025,
  presurizarea scărilor și a sasurilor de pompieri e soluție consacrată, aliniată la cod.
- **Simulare CFD (FDS)**: standardul de-facto pentru proiectarea bazată pe performanță (FDS 6.10.1, NIST,
  mar. 2025). Matur și acceptat de autorități, **dar cu scepticism disciplinat**: un studiu de validare
  din 2025 confirmă că FDS **supraestimează** concentrația de fum când se neglijează depunerea — rezultate
  greșite sunt ușor de produs. P118/1-2025 rămâne în mare prescriptiv, deci CFD se justifică pentru
  **geometrii complexe/atipice, atrii, compartimente mari și derogări**, nu pentru proiecte de rutină.
- **Surse de alimentare / panouri**: **EN 12101-10** (surse) e partea matură, armonizată CPR — obligatorie
  pentru conformitate.

### Tendințe reale / în flux (📈)
- **Panouri de control integrate (EN 12101-9)**: partea în mișcare — există de mult doar ca **prEN 12101-9**
  (draft), cu ISO 21927-9 acoperind cerințele. Tendința către panouri integrate, monitorizate, cu raportare
  de defect (vs simple controlere AOV) e reală și se accelerează. Specifică panouri cu marcare CE la EN
  12101-10 + logică de control la (pr)EN 12101-9 / ISO 21927-9, plus UCMS-ul cerut de P118/1-2025.
  *De urmărit CEN/TC 191 pentru finalizarea EN 12101-9 — stadiul armonizat e incert.*
- **Naturală vs mecanică**: niciuna nu e „emergentă" sau hype — ambele sunt consacrate și permise de
  P118/1-2025. **Naturală (NSVS):** cost mic, mentenanță mică, fără dependență de energie — cea mai bună
  unde există acces la fațadă/acoperiș și geometrie simplă. **Mecanică (MSVS):** independentă de vânt,
  performanță predictibilă, compactă — pentru layout-uri adânci/complexe/landlocked și clădiri înalte, la
  capex și mentenanță mai mari. Sub-tendința reală de urmărit: **extracție mecanică + presurizare în clădiri
  înalte cu o singură scară**, împinsă de înăsprirea codurilor post-Grenfell.

### Doar hype / imatur (⚠️)
- **Surogate AI/ML pentru CFD** („predicție AI a curgerii fumului"): apar în literatura academică 2024–2025,
  **fără acceptare de reglementare**, nedeployabile pentru semnătura de proiect azi.

---

## 7. BMS și automatizarea clădirilor

> Driver-cheie nou: **NIS2** (transpus în RO, în vigoare din 20 aug 2025) face securitatea cibernetică
> OT/BMS o **obligație legală**, nu opțională. Pragurile EPBD/BACS (>290 kW acum, >70 kW până în 2029)
> împing automatizarea și FDD în scopul obligatoriu.

| Tehnologie | Verdict |
|------------|---------|
| Senzori IoT + controlere edge | ✅ |
| BACnet/IP | ✅ (implicit) |
| KNX / KNX Secure | ✅ |
| Modbus | ✅ (legacy, prin gateway securizat) |
| Securitate OT (NIS2 / IEC 62443) | ✅ + cerut legal |
| FDD (detecție/diagnoză defecte) bazat pe reguli | ✅ |
| Cloud vs on-prem (hibrid) | ✅ |
| Control pe prezență / DCV | ✅ |
| BACnet/SC (Secure Connect) | 📈 (va deveni implicit) |
| Thread / LoRaWAN | 📈 (nișă/retrofit) |
| AI/ML pentru optimizare HVAC & mentenanță predictivă | 📈 (cifre umflate de hype) |
| Clădiri grid-interactive (GEB) | 📈 (condus de SUA, devreme pentru RO) |
| Matter pentru comercial | ⚠️ |

### Soluții bune, mature (✅)
- **Senzori IoT + controlere edge**: practică standard; procesarea locală ajută latența și manipularea
  datelor sub NIS2. Procentele de economie de la furnizori sunt orientative, nu ținte de proiectare.
- **BACnet/IP** rămâne coloana vertebrală de-facto pentru HVAC/BMS comercial UE — alegerea implicită.
  **KNX/KNX Secure** e punctul forte european (lighting/room control). **Modbus** ubicuu, fără securitate
  nativă → în spatele unui backbone securizat, prin gateway.
- **Securitate OT (NIS2 / IEC 62443)**: elementul cu **prioritate maximă și cel mai puțin hype**.
  Proiectează la IEC 62443, segmentează BMS de IT, preferă BACnet/SC + KNX Secure.
- **FDD bazat pe reguli**: dovedit (~10% economie anuală mediană, amortizare ~2 ani, LBNL). Fii sceptic la
  „AI FDD" premium fără date independente. Mandatul BACS din EPBD aduce FDD în scop.
- **Cloud vs on-prem (hibrid)**: compromis stabilizat — on-prem pentru critic-la-latență/entități esențiale
  NIS2, cloud pentru analitică multi-sit. **Control pe prezență / DCV**: 10–40% economii de ventilare
  (PIR ok pentru iluminat; HVAC proporțional cere senzori mai buni — cost + GDPR).

### Tendințe reale, de adoptat selectiv (📈)
- **BACnet/SC (Secure Connect)**: TLS 1.3, răspunsul corect pentru integrare securizată NIS2/CRA, dar
  onboarding de certificate și tooling imatur fac deployment-ul complex. Specifică pentru proiecte noi/
  securizate; bugetează efortul de punere în funcțiune. Va deveni implicit.
- **Thread / LoRaWAN**: LoRaWAN e bun pentru **retrofit** wireless ieftin (sub-contorizare, prezență), dar
  latența de ordinul minutelor → nepotrivit pentru bucle de control; suplimentează cablatul, nu îl înlocui.
  Thread e o plasă IP de putere mică credibilă (legată de Matter), încă de nișă în comercial.
- **AI/ML pentru optimizare HVAC & mentenanță predictivă**: valoare reală (MPC, detecție anomalii), dar
  cifrele de titlu („−35% energie", „96,3% acuratețe", „amortizare 3–6 luni") sunt **afirmații de furnizor
  neverificate**. Adoptă selectiv pe clădiri mari cu date de bază; cere M&V măsurat.
- **Clădiri grid-interactive (GEB)**: concept solid, dar dovezile sunt specifice SUA; cifra „$100–200 mld"
  **nu se aplică României**. Proiectează pentru **pregătire DR**, nu supra-investi ca funcție de venit RO actual.

### Doar hype / imatur (⚠️)
- **Matter pentru clădiri comerciale**: real în smart-home, doar **poziționat** pentru comercial (o plasă
  Thread de 200 noduri e demo de laborator). Nu proiecta proiecte comerciale în jurul lui; reanalizează în 2–3 ani.

---

## 8. Digitalizare și proiectare

| Tehnologie | Verdict |
|------------|---------|
| BIM / openBIM (IFC) | ✅ (adoptă acum) |
| Detecție coliziuni (clash detection) | ✅ |
| Mediu comun de date (CDE, ISO 19650) | ✅ |
| Scan-to-BIM / captură realitate (as-built) | ✅ |
| Prefabricare MEP / modular offsite | 📈 |
| AI generativ pentru proiectare/rutare | 📈 (cu inginer în buclă) |
| LLM-uri / copiloți pentru ingineri | 📈 productivitate / ⚠️ judecată autonomă |
| Digital twins pentru clădiri | ⚠️ (nucleu real îngust) |

### Soluții bune, mature (✅)
- **BIM / openBIM (IFC)**: IFC4 = EN ISO 16739; UE împinge openBIM/ISO 19650 în achiziții publice. România
  nu are mandat general încă, dar BIM apare în licitațiile mari de infrastructură (CNIR), cu o foaie de
  parcurs națională 2025–2028. Necesitate de pregătire pentru achiziții.
- **Detecție coliziuni**: matură — ar trebui să fie **livrabil standard la SOWILO**, nu aspirație; reduce
  fiabil refacerile și RFI-urile.
- **Mediu comun de date (CDE)**: coloana vertebrală ISO 19650, platforme mature — aproape obligatoriu pentru
  lucrări cofinanțate UE. Fii sceptic la marketingul de „CDE cu AI agentic". *(Notă: zona de rezidență a
  datelor UE la unele platforme, ex. Procore, planificată abia toamna 2026 — semnal GDPR.)*
- **Scan-to-BIM / captură realitate**: acuratețe dovedită (laser ~1–2 mm); ideal pentru retrofit UE.
  Generarea complet automată a modelului din scanare e încă imatură — necesită QA manual.

### Tendințe reale, de adoptat selectiv (📈)
- **Prefabricare MEP / modular offsite**: câștiguri reale de productivitate, condus de deficitul de forță de
  muncă; depinde de BIM de calitate (întărește openBIM). Adoptă selectiv unde repetiția proiectului justifică.
- **AI generativ pentru proiectare & rutare**: **detecția coliziunilor = adoptă acum** (matură); rutarea
  generativă / auto-layout („Autodesk Assistant", Revit 2026, tech preview) = pilotează cu inginer în buclă.
- **LLM-uri / copiloți**: utili pentru documentație, specificații, scripturi (Dynamo/Python). Rata de
  halucinație ~10–20% (mai mare la interogări specializate) → **niciodată** pentru calcule, dimensionări sau
  conformitate neverificate. *Atenție: AI Act UE poate fi aplicabil.*

### Doar hype / imatur (⚠️)
- **Digital twins pentru clădiri**: elementul cel mai supra-promovat. Valoare reală doar în cazuri operaționale
  înguste (FDD, mentenanță predictivă) cu date curate conectate. Dimensiunile de piață („$26 mld până în 2033")
  sunt promoționale. **Pentru o firmă de proiectare e în mare o preocupare FM din aval** — livrează date BIM/IFC
  curate, nu cumpăra un „twin".

---

## 9. Eficiență energetică și decarbonizare

> Aceasta e rubrica cu cea mai mare densitate de reglementare. Vezi și ancorele de la început (EPBD, F-Gas,
> EED). Mesajul-cheie: termenele sunt fixate prin lege — **construiește capabilitatea acum**.

| Temă | Verdict |
|------|---------|
| nZEB → ZEB (clădiri emisii zero) | ✅ nZEB → 📈 ZEB |
| Pompe de căldură (electrificare) | ✅ (adoptă acum) |
| Fotovoltaic on-site / mandat solar UE | ✅ PV / 📈 mandat |
| M&V (IPMVP / M&V automat) | ✅ IPMVP / 📈 automat |
| Certificate de performanță energetică (EPC) | ✅ / 📈 reformă (scală A–G) |
| Carbon încorporat vs operațional | 📈 (se formalizează) |
| Carbon pe tot ciclul de viață (WLC) | 📈 (devine obligatoriu) |
| Electrificarea clădirilor / eliminarea cazanelor | 📈 |
| Demand response / flexibilitate | 📈 (≈hype pentru proiectul comercial tipic azi) |
| Smart Readiness Indicator (SRI) | ⚠️ |
| Pașapoarte de renovare / jurnale digitale | ⚠️→📈 (voluntar, infrastructură imatură) |

### Soluții bune, de adoptat acum (✅ / 📈 cu termen fix)
- **nZEB → ZEB**: nZEB e baza legală din 2021. **ZEB** (zero emisii din combustibil fosil on-site) e ținta
  mandatată: clădiri publice noi din **1 ian 2028**, toate clădirile noi din **1 ian 2030**. Proiectează la
  **pregătire ZEB** acum. Driverul de reglementare central.
- **Pompe de căldură**: cea mai dovedită tehnologie de decarbonizare, activatorul central al ZEB. **Calitatea
  de proiectare (dimensionare, temperaturi de tur) e decisivă** — instalările proaste sunt un risc real. Vezi
  detaliile din §3 (HVAC).
- **Fotovoltaic on-site / mandat solar UE**: PV pe acoperiș matur. **Mandatul solar eșalonat**: public/
  nerezidențial nou >250 m² până la **31 dec 2026**; public existent >2.000 m² (2027), >750 m² (2028), >250 m²
  (2030); nerezidențial existent >500 m² la renovare majoră (2027); rezidențial nou (2029); parcări acoperite
  noi (2029). Integrează în proiectare/avizare **acum**. *România fiind țară cu iradiere mare, exceptările de
  fezabilitate vor fi rare → PV implicit pentru nerezidențial nou >250 m².*
- **M&V (IPMVP)**: matur pentru ESCO/EPC (IPMVP Core Concepts 2022). Baselining automat din date de contor e
  real și valoros, **dar** „AI M&V" complet automat e parțial hype — ajustările non-rutiniere cer expert.
  Adoptă automatizarea selectiv, unde există date de contor inteligent.
- **Certificate de performanță energetică (EPC)**: obligatorii și consacrate; reforma EPBD aduce **scala
  armonizată A–G** (Clasa A = doar ZEB; Clasa G = cele mai slabe 15%) și șablon comun. **Relevanță RO:**
  România folosește azi **A–F** (Mc 001-2022) → trecerea la **A–G** e o schimbare substanțială de
  metodologie și bază de date. *Stadiul șablonului RO actualizat — de verificat la MDLPA/ANRE.*

### Tendințe reale care se formalizează (📈)
- **Carbon încorporat vs operațional**: distincția e standardizată (EN 15978, RICS WLCA ed. 2). Pe măsură ce
  rețeaua se decarbonizează, **carbonul încorporat ajunge să domine** ciclul de viață → nu mai poate fi ignorat
  la proiectare. Procentul „X% din ciclul de viață" e orientativ (depinde de mixul de rețea/tip de clădire).
- **Carbon pe tot ciclul de viață (WLC)**: nu e speculație — e cerință UE cu date fixe. **GWP pe ciclu de viață
  calculat și raportat în EPC pentru clădiri noi >1.000 m² din 2028, toate din 2030** (EPBD Art. 7, metodologie
  EN 15978 + Level(s) Ind. 1.2). Până în 2027 statele membre trebuie să dezvolte o foaie de parcurs pentru valori-
  limită. **Postura corectă: construiește capabilitatea LCA acum** (software, date EPD, personal instruit) —
  decalajul de competențe e problema reală, nu reglementarea. *Datele EPD sunt slabe în RO — gol de acoperit.*
- **Electrificarea clădirilor / eliminarea cazanelor fosile**: direcție blocată în lege UE — **fără subvenții
  pentru cazane fosile standalone din 1 ian 2025**, țintă de eliminare ~2040, interdicție de cazane noi pe gaz
  în clădiri publice din 2028. Sistemele hibride (pompă de căldură + cazan) rămân eligibile la subvenție — carve-
  out-ul cheie. **Context RO:** ~2,5 mil. locuințe pe gaz, ~1,2 mil. pe termoficare, ~3,5 mil. (rural) pe combustibil
  solid; abordare **graduală** — proiectează hibrid/electric-ready, nu presupune eliminarea totală a gazului.
- **Demand response / flexibilitate**: împingere de politică UE reală (cod de rețea DR în 2026, ținte naționale
  2027), **dar** <10% din consumatori pe tarife dinamice. Pentru o clădire comercială RO tipică e o considerație
  de „pregătire/viitor", **nu o sursă bancabilă de venit azi**. Proiectează infrastructură pregătită pentru
  flexibilitate (contoare inteligente, sarcini controlabile, stocare-ready); nu miza economia proiectului pe DR.

### Doar hype / imatur (⚠️)
- **Smart Readiness Indicator (SRI)**: rămâne **schemă voluntară** sub EPBD reformat, încă în faze de test.
  Momentele decisive sunt în viitor (raport Comisie iun. 2026, posibil act delegat 2027, limitat la nerezidențial
  >290 kW). România **nu** e printre țările oficiale de test (deși a participat prin proiecte UE, ex. SRI-ENACT).
  Pentru o firmă RO în 2026: **urmărește, nu adopta**, decât dacă devine mandat național.
- **Pașapoarte de renovare / jurnale digitale de clădire**: schema de pașaport trebuie să existe până la 29 mai
  2026, **dar utilizarea e voluntară** pentru proprietari, jurnalele sunt „când sunt stabilite", iar infrastructura
  digitală interoperabilă UE e la ani de maturitate. Nu supra-investi încă; monitorizează. (Rescalarea EPC A–G de
  mai sus e partea **reală și obligatorie** a acestei reforme.)

---

## Verdict rapid (sumar transversal)

### De adoptat acum (mature, deseori cerute de reglementare)
- KNX/DALI-2; fotovoltaic + stocare (Legea 255/2024); încărcare EV + DLM
- Contorizare digitală a apei; pompe ECM; PICV; PEX/PP-R(CT); robineți touchless; control Legionella
- Agenți frigorifici cu GWP redus (R-290/CO₂ ca implicit de viitor); recuperare de căldură; DCV; radiant + DOAS;
  chillere oil-free (pe sarcină parțială); pompe de căldură (calitate-critică)
- Detecție ASD, wireless EN 54-25, multi-criteriu; ceață de apă, gaz inert, ESFR; presurizare PDS (EN 12101-13)
- Securitate OT (NIS2/IEC 62443); BACnet/IP; FDD bazat pe reguli; BIM + clash detection + CDE; scan-to-BIM
- Pregătire ZEB (2028/2030); mandat solar; capabilitate WLC/LCA

### De urmărit / adoptat selectiv (📈)
- Iluminat human-centric (pe confort/energie, nu „sănătate"); BIPV; SSCB; V2G-readiness
- Reutilizare apă gri; detecție scurgeri; strat digital Legionella; detecție video AI (suplimentar)
- Pompe de căldură HT R-290; DOAS; termoficare 4GDH (București/SACET); IAQ ASHRAE 241 (voluntar)
- BACnet/SC; LoRaWAN/Thread (retrofit); AI/ML HVAC (cu M&V); prefabricare MEP; AI generativ (inginer în buclă)
- Hipoxic/reducere O₂; stingere baterii litiu/ESS; electrificare (hibrid); demand-response-readiness

### De evitat ca alegere implicită / doar monitorizare (⚠️)
- Iluminat PoE; microrețele DC în clădiri obișnuite
- FK-5-1-12 / Novec 1230 pentru active noi de lungă durată (risc PFAS/REACH)
- Surogate AI pentru CFD; Matter pentru comercial; digital twins ca achiziție de firmă de proiectare
- LLM-uri pentru orice output ingineresc neverificat; SRI; far-UVC 222 nm; PCM/termochimic la scară de clădire

### Cele mai mari capcane de hype (scepticism justificat)
1. Cifrele de economie/ROI de la furnizori (AI HVAC, „−35% energie") — orientative, nu de proiectare.
2. Digital twins ca produs de cumpărat de o firmă de proiectare — livrează date BIM/IFC curate în loc.
3. „Conformitate ca sistem primar" pentru detecția video AI — nu există parte EN 54; e strat suplimentar în RO.
4. „Sănătate/circadian" la iluminatul HCL; „health monitoring" la WC-uri smart.
5. Reg. (UE) 2020/741 ≠ reutilizarea apei în clădire (e doar irigare agricolă).

### Cele mai apropiate declanșatoare de reglementare (de urmărit în calendar)
- **31 dec 2026** — planuri de management al riscului Legionella (DWD); primul prag al mandatului solar UE (>250 m²).
- **8 ian 2026** — aplicabilitate CPR (UE) 2024/3110 (marcaj CE detecție/stingere).
- **2027** — limita F-Gas GWP-150 pentru monobloc; ținte naționale de flexibilitate; MEPS naționale.
- **2028 / 2030** — ZEB (public / toate); raportare GWP pe ciclu de viață (>1.000 m² / toate).
- **31 dec 2027** — stocare obligatorie pentru prosumatori PV în RO (Legea 255/2024).

---

## Surse

Documentul se bazează pe research web din 2025–2026. Sursele cheie, pe rubrici (titlu — link):

**Reglementare-cadru UE/RO**
- Directiva (UE) 2024/1275 (EPBD reformat) — EUR-Lex — https://eur-lex.europa.eu/eli/dir/2024/1275/oj
- Regulamentul (UE) 2024/573 (F-Gas) — https://climate.ec.europa.eu/eu-action/fluorinated-greenhouse-gases/f-gas-legislation_en
- Directiva (UE) 2023/1791 (EED) — https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32023L1791
- Directiva (UE) 2020/2184 (apă potabilă, DWD) — https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32020L2184
- NIS2 în RO (OUG 155/2024; Ordine DNSC) — CMS Law-Now — https://cms-lawnow.com/
- Normativ P118-1/2025 (MDLPA) — https://www.mdlpa.ro/subarticles/8/normativincediu032025 ; OAR — https://oar.archi/stiri/normativul-p118-1-2025-8-mai-2025-ce-se-schimba/
- Normativ I5-2022 (Ordin 173/2023) — https://legislatie.just.ro/public/DetaliiDocument/264763
- Normativ I7-2011 (mod. 2023) — https://legislatie.just.ro/Public/DetaliiDocument/287132

**Electrice / PV / EV**
- Renewable Energy Laws Romania 2026 (Legea 255/2024) — ICLG — https://iclg.com/practice-areas/renewable-energy-laws-and-regulations/romania/
- ANRE: prosumatori 3,35 GW — Balkan Green Energy News — https://balkangreenenergynews.com/anre-prosumers-in-romania-reach-3-35-gw-in-capacity/
- AFIR & ISO 15118 — Bender — https://bender.de/en/know-how/applications/emobility/
- Siemens SENTRON 3QD2 (SSCB) — https://press.siemens.com/global/en/pressrelease/siemens-launches-groundbreaking-portfolio-era-direct-current-technology
- HCL — divizare opinii — MDPI Buildings — https://www.mdpi.com/2075-5309/14/4/1125

**Sanitare**
- Reg. (UE) 2020/741 (reutilizare apă — agricultură) — https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32020R0741
- Strategia UE de reziliență a apei — https://commission.europa.eu/topics/environment/water-resilience-strategy_en
- DWD & testare Legionella — REHVA — https://www.rehva.eu/blog/article/the-new-eu-drinking-water-directive
- Reg. (UE) 622/2012 (circulatoare EEI ≤0,23) — https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32012R0622
- PP-RCT — ERA Pipes — https://erapipefittings.com/

**Termice / HVAC**
- Recuperare piață pompe de căldură 2025 — IIR — https://iifiir.org/en/news/european-heat-pump-market-shows-signs-of-recovery-in-2025-after-two-year-decline
- EHPA Market Report 2025 — https://www.ehpa.org/wp-content/uploads/2025/07/EHPA-Market-Report-2025-executive-summary.pdf
- Carrier R-290 HT (61AQ) — https://www.carrier.com/commercial/en/eu/news/news-article/carrier-launches-r-290-high-temperature-heat-pump-for-an-efficient-and-sustainable-future.html
- F-Gas HFC phase-down — Danfoss — https://www.danfoss.com/en/about-danfoss/our-businesses/cooling/refrigerants-and-energy-efficiency/hfc-phase-down/danfoss-on-f-gas-regulation/
- Eurovent REC 17-14 (moisture recovery, 2025) — https://www.eurovent.eu/
- DOAS — ASHRAE Handbook — https://www.ashrae.org/advertising/handbook-advertising/systems/dedicated-outdoor-air-systems-doas
- ISO 18566 (radiant) — REHVA — https://www.rehva.eu/rehva-journal/chapter/iso-18566-the-international-standard-...
- 5GDHC — BUILD UP (EU) — https://build-up.ec.europa.eu/en/news-and-events/news/know-it-all-about-5th-generation-district-heating-and-cooling-grids
- Geotermal DH București €200M — Balkan Green Energy News — https://balkangreenenergynews.com/geothermal-district-heating-investment-worth-eur-200-million-starts-in-bucharest/
- ASHRAE 241-2023 — https://www.ashrae.org/file%20library/about/government%20affairs/advocacy%20toolkit/virtual%20packet/standard-241-fact-sheet.pdf

**Detecție incendiu**
- Seria EN 54 — FIA — https://www.fia.uk.com/resources/british-standards/bs-en-54-series-fire-detection-alarm-systems.html
- Ciqurix LPS 1976 (flacără video, 2025) — https://emergencyservicestimes.com/2025/12/05/ciqurix-becomes-first-in-the-world-to-achieve-new-lps-1976-video-flame-detection-certification/
- CPR (UE) 2024/3110 — https://single-market-economy.ec.europa.eu/sectors/construction/construction-products-regulation-cpr/harmonised-standards_en
- VESDA-E (Honeywell Xtralis) — https://xtralis.com/
- P118/3-2015 (detecție) — https://migs.ro/wp-content/uploads/2016/09/P-118-III-2015-Detectie-semnalizare-incendiu.pdf

**Stingere incendiu**
- ECHA — restricție PFAS REACH (2026) — Arnold & Porter — https://www.arnoldporter.com/en/perspectives/advisories/2026/03/echa-committees-advance-broad-pfas-restriction-under-reach
- Marioff HI-FOG (water mist, data-center) — https://www.marioff.com/en/fire-protection-on-land/data-centers/
- NFPA 855 (ediția 2026, BESS) — Energy-Storage.News — https://www.energy-storage.news/nfpa-855-2026-edition-updates-and-what-they-mean-for-energy-storage-projects/
- WAGNER OxyReduct / hipoxic — Wikipedia — https://en.wikipedia.org/wiki/Hypoxic_air_technology_for_fire_prevention
- P118/2-2025 / reglementări incendiu RO 2025 — SpeedFire — https://speedfire.ro/reglementari-tehnice-privind-securitatea-la-incendiu-in-romania-lista-completa-actualizata-in-2025/

**Desfumare**
- EN 12101-13:2022 (PDS) — BSI — https://knowledge.bsigroup.com/products/...pressure-differential-systems-pds...
- FDS / Smokeview (NIST) — https://www.nist.gov/services-resources/software/fds-and-smokeview
- prEN 12101-9 (panouri control, draft) — CEN — https://standards.iteh.ai/catalog/standards/cen/...pren-12101-9
- P118/1-2025 și desfumare — Ventilation.ro — https://ventilation.ro/blog-article/9/normativul-p118-1-2025-...

**BMS & automatizare**
- EPBD pentru profesioniștii HVAC — REHVA Journal — https://www.rehva.eu/
- IEC 62443 pentru conformitate NIS2 — DNV — https://www.dnv.com/
- FDD bazat pe date (LBNL) — https://buildings.lbl.gov/publications/review-data-driven-fault-detection
- BACnet/SC integrare — Cimetrics / AutomatedBuildings — 2025

**Digitalizare**
- BIM în România (foaie de parcurs) — bimtech.ro ; IJHSA — 2025
- Mandate BIM globale 2026 — Taaltech — 2025/26
- Digital twin în construcții (review) — Taylor & Francis — https://www.tandfonline.com/doi/full/10.1080/13467581.2025.2517242
- Statistici halucinație LLM 2026 — SQ Magazine / arXiv — 2026

**Decarbonizare**
- ZEB / clădiri emisii zero — Comisia Europeană — https://energy.ec.europa.eu/topics/energy-efficiency/energy-performance-buildings/nearly-zero-energy-and-zero-emission-buildings_en
- Mandat solar (Art. 10) — BUILD UP — https://build-up.ec.europa.eu/en/news-and-events/news/eu-mandates-solar-energy-buildings-2026
- RICS WLCA ed. 2 — https://www.rics.org/profession-standards/rics-standards-and-guidance/sector-standards/construction-standards/whole-life-carbon-assessment
- Cadru de calcul GWP pe ciclu de viață (dec. 2025) — Comisia Europeană — https://energy.ec.europa.eu/news/commission-encourages-low-carbon-construction-materials-calculation-framework-life-cycle-global-2025-12-16_en
- IPMVP Core Concepts 2022 — EVO — https://evo-world.org/en/news-media/evo-news/1280-release-of-the-new-ipmvp-core-concepts-2022
- SRI — Comisia Europeană — https://energy.ec.europa.eu/topics/energy-efficiency/energy-performance-buildings/smart-readiness-indicator_en
- Transpunere EPBD în RO — energynomics.ro — https://www.energynomics.ro/en/one-year-to-transpose-eu-energy-performance-of-buildings-directive/
- Eliminarea cazanelor fosile — EHPA — https://ehpa.org/news-and-resources/news/whos-banning-fossil-fuel-boilers/

> **Avertisment general:** mai multe surse instituționale (EUR-Lex, Comisia Europeană, ECHA, REHVA, EHPA,
> RICS) și surse RO au blocat fetch-ul direct (HTTP 403); o parte din cifre provin din extrase de motor de
> căutare corroborate între surse multiple. Înainte de a cita verbatim într-o ofertă sau un proiect ștampilat,
> confirmă datele cheie în textul primar — în special **stadiul real al transpunerii EPBD în România**
> (Monitorul Oficial), pragurile/datele naționale exacte și cifrele de economie/ROI de la furnizori.

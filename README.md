# MEDABACUS — Point-of-Care Hospital Clinical Calculator & Decision Suite

[![Live Web Application](https://img.shields.io/badge/Live%20Website-GitHub%20Pages-181717.svg?style=for-the-badge&logo=github&logoColor=white)](https://pisumsat.github.io/medabacus/)
[![Clinical Tests](https://img.shields.io/badge/Clinical%20Tests-361%20Passed-emerald.svg?style=for-the-badge)](#test-suite--verification)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg?style=for-the-badge)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-cyan.svg?style=for-the-badge)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-teal.svg?style=for-the-badge)](https://tailwindcss.com/)

> 🌐 **Live Web Application**: [**https://pisumsat.github.io/medabacus/**](https://pisumsat.github.io/medabacus/)  
> Access the complete clinical calculation suite, multimodal AI parser, and multi-patient shift census directly on any desktop or smartphone browser.

**MEDABACUS** is an evidence-based clinical calculator, decision support engine, and multimodal data workstation designed for inpatient and acute hospital settings across the four core hospital clerkships: **Internal Medicine**, **General Surgery & Trauma**, **Pediatrics**, and **Obstetrics & Gynecology (OB/GYN)**.

Built with React 19, TypeScript, Vite 6, and Tailwind CSS v4, MEDABACUS delivers ultra-fast, offline-capable clinical scores, dynamic multi-EHR documentation (SOAP, Epic SmartPhrases, Cerner PowerChart, SBAR), shift census management, and an intelligent Clinical AI lab parser.

---

## 🏥 Hospital Wards & Clinical Calculation Suite

Over **105+ high-yield interactive formulas, scales, and decision algorithms** compiled from international clinical guidelines (ACOG, KDIGO, ACC/AHA, CHEST, Parkland/ABA, AAP, WHO, NIHSS):

### 1. 🫀 Internal Medicine Ward
- **Cardiology & Vascular**: CHA₂DS₂-VASc (AFib stroke risk), HAS-BLED (bleeding risk), TIMI UA/NSTEMI, HEART Score, Killip classification, Framingham 10-Yr CVD Risk, San Francisco Syncope Rule.
- **Critical Care & Pulmonology**: CURB-65 & PSI/PORT for Pneumonia, BODE Index & DECAF for AECOPD mortality, Wells PE & DVT / PERC Rule, ARDSnet lung-protective ideal body weight & tidal volumes (4–8 mL/kg).
- **Nephrology & Acid-Base**: CKD-EPI 2021 race-free eGFR, Cockcroft-Gault CrCl, Fractional Excretion of Sodium (FENa) & Urea (FEUrea), Fractional Excretion of Uric Acid (FEUric), Adrogué-Madias sodium correction for SIADH & ODS safety, Anion Gap & Delta-Delta.
- **Gastroenterology & Hepatology**: MELD 3.0 & MELD-Na (2016), Child-Pugh cirrhosis staging, Rockall Score & AIMS65 for GI bleeding, Lille Model for alcoholic hepatitis, King's College criteria for ALF.
- **Neurology & Endocrine**: NIHSS acute ischemic stroke scale, Modified Rankin Scale (mRS), Hunt & Hess / Modified Fisher for SAH, HOMA-IR, ADA 2024 DKA severity, Corrected Sodium in Hyperglycemia, Corrected Calcium for Albumin.
- **Hematology & Oncology**: Khorana cancer VTE risk, Reticulocyte Production Index (RPI), ISTH DIC score, HScore for HLH.

### 2. 🔪 General Surgery & Trauma Ward
- **Trauma & Resuscitation**: Parkland & Brooke resuscitation formulas for burns (4 mL × kg × %TBSA), Injury Severity Score (ISS) & Abbreviated Injury Scale (AIS), FAST ultrasound exam pathway, Denver screening criteria for BCVI, Ottawa Ankle & Knee rules.
- **Acute Abdomen**: Alvarado & AIR (Appendicitis Inflammatory Response) scores, Glasgow-Imrie criteria for acute pancreatitis, Hinchey diverticulitis classification.
- **Perioperative Clearance**: RCRI (Revised Cardiac Risk Index / Lee Index), Caprini VTE risk score, Surgical Apgar Score (SAS), Charlson Comorbidity Index (CCI), EuroSCORE II for cardiac surgical mortality.

### 3. 👶 Pediatrics Ward
- **Neonatology & Delivery**: 1-minute and 5-minute APGAR scores, Sarnat staging for neonatal HIE & hypothermia thresholds, Finnegan Neonatal Abstinence Score (NAS), Kaiser Permanente neonatal sepsis risk.
- **Emergency & Resuscitation**: Broselow pediatric emergency tape (color-coded weight, ETT tube size & depth: `Age/4 + 4`, defibrillation joules, epinephrine dosing), Pediatric GCS.
- **Fluids, Vitals & Respiratory**: Holliday-Segar 4-2-1 maintenance fluid & deficit calculation, age-specific pediatric blood pressure percentiles & vital sign thresholds, Pediatric Asthma Severity Score (PASS), RDAI for bronchiolitis, WHO dehydration rehydration plans (A/B/C).
- **Infectious & General**: Centor / McIsaac score for strep pharyngitis, Rochester febrile infant low-risk criteria, Waterlow criteria for acute wasting and stunting.

### 4. 🤰 Obstetrics & Gynecology (OB/GYN) Ward
- **Obstetric Dating & Ultrasound**: ACOG Committee Opinion 700 dating consensus (LMP vs First-Trimester CRL vs Second-Trimester BPD/FL), Hadlock 4-parameter estimated fetal weight (EFW) & percentiles, Amniotic Fluid Index (AFI) & Single Deepest Pocket (SDP).
- **Labor, Delivery & VBAC**: Bishop Cervical Ripening Score (original & simplified), Grobman VBAC / TOLAC success prediction model, CMQCC cumulative quantitative blood loss (QBL) stages.
- **High-Risk OB**: ACOG Practice Bulletin 222 Preeclampsia with severe features, Spot Urine Protein-to-Creatinine Ratio (UPCR), Magnesium sulfate toxicity clinical management protocol, Serum hCG doubling kinetics & discriminatory zone.
- **Gynecology & Surgery**: POP-Q 9-point pelvic organ prolapse quantification (Stages 0–IV), RMI (Risk of Malignancy Index) for adnexal mass, Postmenopausal endometrial thickness (4 mm threshold), CDC US MEC contraceptive eligibility criteria.

---

## ⚡ Key Features

- 🤖 **Multimodal Clinical AI**: Free text EHR parser, CSV lab export parser, and multimodal photo OCR ingestion. Extracts lab values (Na, K, Cl, HCO3, BUN, Cr, Glucose, Bilirubin, INR, vitals) and maps them directly into matching ward calculators with 1-click auto-fill.
- 📋 **Multi-Patient Shift Census & SBAR**: Digital whiteboard for inpatient teams. Track bed numbers, active diagnoses, assigned calculators, and generate 1-click clinical handover SBAR summaries.
- 📝 **Multi-Format Smart Note Studio**: Instantly export calculations into formatted clinical documentation:
  - Standard SOAP note
  - Epic SmartPhrases / Dotphrases (`.vitals`, `.labs`, provider macros)
  - Cerner PowerChart format
  - SBAR inter-shift handoff format
  - Inpatient Consult note format
- 🎨 **Multi-Color Theme System**: 6 clinical-grade color themes:
  - 🏥 Clinical Teal (Default)
  - 🌊 Ocean Sapphire
  - 🌲 Nordic Emerald
  - 🔮 Royal Amethyst
  - 🌅 Sunset Amber
  - 🌸 Rose Quartz
  All themes feature verified **WCAG AAA/AA** text contrast and support both **Day Shift (Light)** and **Night Shift (Dark/OLED)** modes.
- 📱 **Mobile-First Responsive Engineering**: Designed for bedside smartphone use (single-hand navigation, bottom command dock, touch-friendly `NumberStepper` inputs, safe-area-inset compliance, no horizontal overflow).
- 🔒 **Zero Data Transmission**: 100% client-side computation. Patient parameters never leave the clinician's browser.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` or `pnpm`

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/medabacus.git

# Enter project directory
cd medabacus

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open your browser at `http://localhost:1000/`.

---

## 🧪 Test Suite & Verification

MEDABACUS features a comprehensive test suite covering 361 clinical calculations, parsing heuristics, and shift management routines:

```bash
# Run all clinical calculation & parsing tests
npm test
```

### Test Coverage
- `test-clinical-engines.mjs`: **235 passed** (Core clinical formulas across 4 wards)
- `test-clinical-parser.mjs`: **24 passed** (Entity extraction, regex parser, EHR lab tokens)
- `test-shift-and-history.mjs`: **33 passed** (Shift census, SBAR generator, CSV export)
- `test-clinical-wiki-complete.mjs`: **69 passed** (All-in-one clinical wiki cards)
- **Total**: **361 / 361 tests passing (100% pass rate)**

---

## 📦 Production Build & Deployment

### Build for Production

```bash
npm run build
```

The compiled static assets will be output to the `dist/` directory.

### Deploying to GitHub Pages (Automated)

This repository includes a GitHub Actions workflow in `.github/workflows/deploy.yml`.

1. Push your repository to GitHub:
   ```bash
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Every push to the `main` branch will automatically run tests, build the project, and deploy the application live to `https://<username>.github.io/<repo-name>/`.

---

## 🛠️ Built With

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite 6](https://vite.dev/) + [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linter**: [Oxlint](https://oxc.rs/)

---

## ⚖️ Clinical Disclaimer

MEDABACUS is an educational and clinical reference tool designed to assist healthcare professionals and trainees. It does not replace individualized clinical judgment, formal diagnostic evaluation, or institutional treatment protocols. Always verify calculations against patient-specific factors and consult primary literature or hospital pharmacy guidelines when dosing medications.

---

## 👨‍⚕️ Author

Crafted with care by **Pisum** ([noraseth23@gmail.com](mailto:noraseth23@gmail.com)).

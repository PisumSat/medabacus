import { useState } from 'react';
import { Baby } from 'lucide-react';
import { CopyNoteButton } from '../CopyNoteButton';
import { NumberStepper } from '../ui/NumberStepper';
import {
  evaluateKramersRule,
  evaluateBhutaniNomogram,
  calculateDownesScore,
  calculatePews,
  evaluateJonesCriteria,
  evaluateMuac,
} from '../../calculators/clinicalWikiPediatrics';

interface PediatricsWikiSuiteViewProps {
  patientTag?: string;
  initialTab?: string;
}

export default function PediatricsWikiSuiteView({
  patientTag,
  initialTab = 'bhutani',
}: PediatricsWikiSuiteViewProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Bhutani state
  const [bhuAgeHours, setBhuAgeHours] = useState(36);
  const [bhuTsb, setBhuTsb] = useState(13.4);
  const [bhuGaWeeks, setBhuGaWeeks] = useState(38);
  const [bhuNeuroRisk, setBhuNeuroRisk] = useState(false);

  // Kramer state
  const [kramerZone, setKramerZone] = useState<1 | 2 | 3 | 4 | 5>(2);

  // Downes state
  const [downesRr, setDownesRr] = useState<0 | 1 | 2>(1);
  const [downesCyanosis, setDownesCyanosis] = useState<0 | 1 | 2>(0);
  const [downesRetractions, setDownesRetractions] = useState<0 | 1 | 2>(1);
  const [downesGrunting, setDownesGrunting] = useState<0 | 1 | 2>(1);
  const [downesAirEntry, setDownesAirEntry] = useState<0 | 1 | 2>(0);

  // PEWS state
  const [pewsBehavior, setPewsBehavior] = useState<0 | 1 | 2 | 3>(0);
  const [pewsCv, setPewsCv] = useState<0 | 1 | 2 | 3>(1);
  const [pewsResp, setPewsResp] = useState<0 | 1 | 2 | 3>(1);
  const [pewsVomiting, setPewsVomiting] = useState(false);

  // Jones Criteria state
  const [jonesStrepEvidence, setJonesStrepEvidence] = useState(true);
  const [jonesCarditis, setJonesCarditis] = useState(true);
  const [jonesArthritis, setJonesArthritis] = useState(true);
  const [jonesChorea, setJonesChorea] = useState(false);
  const [jonesErythema, setJonesErythema] = useState(false);
  const [jonesNodules, setJonesNodules] = useState(false);
  const [jonesFever, setJonesFever] = useState(true);
  const [jonesEsrCrp, setJonesEsrCrp] = useState(true);
  const [jonesPrInterval, setJonesPrInterval] = useState(false);

  // MUAC state
  const [muacMm, setMuacMm] = useState(120);

  // Computations
  const bhutaniResult = evaluateBhutaniNomogram(bhuAgeHours, bhuTsb, bhuGaWeeks, bhuNeuroRisk);
  const kramerResult = evaluateKramersRule(kramerZone);
  const downesResult = calculateDownesScore({
    respiratoryRate: downesRr,
    cyanosis: downesCyanosis,
    retractions: downesRetractions,
    grunting: downesGrunting,
    airEntry: downesAirEntry,
  });
  const pewsResult = calculatePews({
    behavior: pewsBehavior,
    cardiovascular: pewsCv,
    respiratory: pewsResp,
    persistentVomitingPostOp: pewsVomiting,
  });
  const jonesResult = evaluateJonesCriteria({
    isLowRiskPopulation: false, // High yield for regional/Thai setting
    evidenceOfPrecedingStrepInfection: jonesStrepEvidence,
    carditisClinicalOrSubclinicalEcho: jonesCarditis,
    polyarthritis: jonesArthritis,
    choreaSydenham: jonesChorea,
    erythemaMarginatum: jonesErythema,
    subcutaneousNodules: jonesNodules,
    arthralgia: false,
    feverAtLeast38_5C: jonesFever,
    elevatedEsrOrCrp: jonesEsrCrp,
    prolongedPrIntervalOnEcg: jonesPrInterval,
  });
  const muacResult = evaluateMuac(muacMm);

  const ehrNote = `PEDIATRIC WIKI CLINICAL REPORT
Patient: ${patientTag || 'Pediatric & Neonatal Assessment'}
Date/Time: ${new Date().toLocaleString()}

1. AAP 2022 NEONATAL BILIRUBIN & PHOTOTHERAPY:
- Postnatal Age: ${bhuAgeHours} hours, GA: ${bhuGaWeeks} weeks, TSB: ${bhuTsb} mg/dL
- Phototherapy Threshold: ${bhutaniResult.phototherapyThresholdMgDl} mg/dL (${bhutaniResult.phototherapyIndicated ? 'INDICATED' : 'Not Indicated'})
- Exchange Transfusion Threshold: ${bhutaniResult.exchangeTransfusionThresholdMgDl} mg/dL (${bhutaniResult.exchangeTransfusionIndicated ? 'INDICATED' : 'Not Indicated'})
- Action: ${bhutaniResult.recommendation}

2. KRAMER CEPHALOCAUDAL DERMAL JAUNDICE:
- Zone: ${kramerResult.zone} (${kramerResult.anatomicalDistribution})
- Est. TSB: ${kramerResult.approximateTotalSerumBilirubinMgDl}
- Plan: ${kramerResult.clinicalNote}

3. DOWNES NEONATAL RESPIRATORY DISTRESS SCORE:
- Score: ${downesResult.score}/10 (${downesResult.severity})
- Support: ${downesResult.respiratorySupport}

4. BEDSIDE PEWS (PEDIATRIC EARLY WARNING SCORE):
- Score: ${pewsResult.score} (${pewsResult.riskTier})
- Escalation: ${pewsResult.escalationAction}

5. MODIFIED JONES CRITERIA (RHEUMATIC FEVER):
- Diagnosis Met: ${jonesResult.arfDiagnosisMet ? 'YES' : 'NO'} (${jonesResult.majorCount} Major, ${jonesResult.minorCount} Minor)
- Clinical Plan: ${jonesResult.clinicalInterpretation}

6. MUAC CHILDHOOD MALNUTRITION (WHO):
- MUAC: ${muacMm} mm (${muacResult.classification})
- Recommendation: ${muacResult.recommendation}

Guideline Sources: AAP 2022, Kramer Lancet, Downes Clin Pediatr, Parshuram Crit Care, AHA 2015, WHO Standards.`;

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 dark:border-slate-700/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              Wiki Master Suite
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              AAP 2022 · WHO · AHA Peds · PALS · Downes
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Baby className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            Pediatrics & NICU Wiki Suite
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            High-yield peds tools: AAP 2022 Bilirubin, Kramer Jaundice, Downes Distress, Bedside PEWS, Modified Jones ARF & WHO MUAC
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <CopyNoteButton textToCopy={ehrNote} />
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl mb-5 gap-1 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('bhutani')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'bhutani'
              ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          AAP Bilirubin
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('kramer')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'kramer'
              ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Kramer Jaundice
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('downes')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'downes'
              ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Downes Distress
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pews')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'pews'
              ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Bedside PEWS
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('jones')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'jones'
              ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Jones ARF
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('muac')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'muac'
              ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          WHO MUAC
        </button>
      </div>

      {/* Tab 1: Bhutani / AAP 2022 */}
      {activeTab === 'bhutani' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <NumberStepper label="Postnatal Age" unit="hours" value={bhuAgeHours} onChange={setBhuAgeHours} min={12} max={168} step={6} />
            <NumberStepper label="Total Serum Bilirubin" unit="mg/dL" value={bhuTsb} onChange={setBhuTsb} min={1.0} max={35.0} step={0.5} />
            <NumberStepper label="Gestational Age" unit="weeks" value={bhuGaWeeks} onChange={setBhuGaWeeks} min={35} max={42} step={1} />
          </div>

          <button
            type="button"
            onClick={() => setBhuNeuroRisk(!bhuNeuroRisk)}
            className={`w-full p-2.5 rounded-xl text-xs font-bold border transition-all ${
              bhuNeuroRisk ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            Neurotoxicity Risk Factors (Isoimmune hemolysis, G6PD, sepsis, albumin &lt; 3.0): {bhuNeuroRisk ? 'PRESENT (-2 mg/dL threshold)' : 'ABSENT'}
          </button>

          <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/70 dark:bg-sky-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wider">AAP 2022 Bilirubin Thresholds</span>
              <div className="flex items-center gap-1.5">
                <span className={`px-2.5 py-1 rounded-full text-xs font-black text-white ${
                  bhutaniResult.exchangeTransfusionIndicated ? 'bg-red-600' : bhutaniResult.phototherapyIndicated ? 'bg-amber-600' : 'bg-emerald-600'
                }`}>
                  {bhutaniResult.exchangeTransfusionIndicated ? 'EXCHANGE TX' : bhutaniResult.phototherapyIndicated ? 'PHOTOTHERAPY' : 'BELOW THRESHOLD'}
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Phototherapy cut: {bhutaniResult.phototherapyThresholdMgDl} mg/dL · Exchange cut: {bhutaniResult.exchangeTransfusionThresholdMgDl} mg/dL
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-1">
              {bhutaniResult.recommendation}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {bhutaniResult.guideline}
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Kramer's Rule */}
      {activeTab === 'kramer' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setKramerZone(z as any)}
                className={`p-3 rounded-xl text-center text-xs font-bold border transition-all ${
                  kramerZone === z
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Zone {z}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">{kramerResult.zone}</span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-600 text-white">
                Est. TSB: {kramerResult.approximateTotalSerumBilirubinMgDl}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Distribution: {kramerResult.anatomicalDistribution}
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-1">
              {kramerResult.clinicalNote}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {kramerResult.guideline}
            </span>
          </div>
        </div>
      )}

      {/* Tab 3: Downes Score */}
      {activeTab === 'downes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Respiratory Rate</label>
              <select
                aria-label="Respiratory rate"
                value={downesRr}
                onChange={(e) => setDownesRr(Number(e.target.value) as any)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value={0}>0: &lt; 60 bpm</option>
                <option value={1}>1: 60 - 80 bpm</option>
                <option value={2}>2: &gt; 80 bpm or apneic episodes</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Cyanosis</label>
              <select
                aria-label="Cyanosis presence"
                value={downesCyanosis}
                onChange={(e) => setDownesCyanosis(Number(e.target.value) as any)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value={0}>0: None in room air</option>
                <option value={1}>1: In room air, relieved with O2</option>
                <option value={2}>2: Persists despite supplemental O2</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Retractions</label>
              <select
                aria-label="Retraction degree"
                value={downesRetractions}
                onChange={(e) => setDownesRetractions(Number(e.target.value) as any)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value={0}>0: None</option>
                <option value={1}>1: Mild intercostal retractions</option>
                <option value={2}>2: Moderate to severe sternal recession</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Grunting</label>
              <select
                aria-label="Grunting level"
                value={downesGrunting}
                onChange={(e) => setDownesGrunting(Number(e.target.value) as any)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value={0}>0: None</option>
                <option value={1}>1: Audible with stethoscope</option>
                <option value={2}>2: Audible with naked ear</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Air Entry</label>
              <select
                aria-label="Air entry quality"
                value={downesAirEntry}
                onChange={(e) => setDownesAirEntry(Number(e.target.value) as any)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value={0}>0: Normal bilateral aeration</option>
                <option value={1}>1: Decreased air entry</option>
                <option value={2}>2: Barely audible / absent breath sounds</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/70 dark:bg-sky-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wider">Downes Score</span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-600 text-white">
                {downesResult.score} / 10 · {downesResult.severity}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {downesResult.respiratorySupport}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {downesResult.guideline}
            </span>
          </div>
        </div>
      )}

      {/* Tab 4: Bedside PEWS */}
      {activeTab === 'pews' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Behavior</label>
              <select
                aria-label="Behavior level"
                value={pewsBehavior}
                onChange={(e) => setPewsBehavior(Number(e.target.value) as any)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value={0}>0: Playing / age appropriate</option>
                <option value={1}>1: Sleeping / calm</option>
                <option value={2}>2: Irritable / inconsolable</option>
                <option value={3}>3: Lethargic / confused / reduced pain response</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Cardiovascular</label>
              <select
                aria-label="Cardiovascular status"
                value={pewsCv}
                onChange={(e) => setPewsCv(Number(e.target.value) as any)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value={0}>0: Pink, cap refill 1-2s</option>
                <option value={1}>1: Pale or cap refill 3s</option>
                <option value={2}>2: Grey/cyanotic, CRT 4s, tachy &gt;20 above norm</option>
                <option value={3}>3: Grey/mottled, CRT ≥5s, tachy &gt;30 or bradycardia</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Respiratory</label>
              <select
                aria-label="Respiratory status"
                value={pewsResp}
                onChange={(e) => setPewsResp(Number(e.target.value) as any)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value={0}>0: Normal RR, no recession</option>
                <option value={1}>1: &gt;10 above norm, accessory muscle use or 30%+ FiO2</option>
                <option value={2}>2: &gt;20 above norm, marked retractions or 40%+ FiO2</option>
                <option value={3}>3: &gt;30 above norm or sternal recession or ≥50% FiO2</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPewsVomiting(!pewsVomiting)}
            className={`w-full p-2 rounded-xl text-xs font-bold border transition-all ${
              pewsVomiting ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            Persistent Postoperative Vomiting: {pewsVomiting ? 'YES (+2)' : 'NO'}
          </button>

          <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/70 dark:bg-sky-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wider">Bedside PEWS Escalation</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black text-white ${
                pewsResult.score >= 5 ? 'bg-red-600' : pewsResult.score >= 3 ? 'bg-amber-600' : 'bg-emerald-600'
              }`}>
                Score {pewsResult.score} · {pewsResult.riskTier}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {pewsResult.escalationAction}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {pewsResult.guideline}
            </span>
          </div>
        </div>
      )}

      {/* Tab 5: Modified Jones Criteria */}
      {activeTab === 'jones' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: 'Evidence of Preceding Strep (ASO titer / RADT / Culture)', val: jonesStrepEvidence, set: setJonesStrepEvidence },
              { label: 'Carditis (Clinical or Subclinical Echo) [MAJOR]', val: jonesCarditis, set: setJonesCarditis },
              { label: 'Polyarthritis / Monoarthritis [MAJOR]', val: jonesArthritis, set: setJonesArthritis },
              { label: 'Sydenham Chorea [MAJOR]', val: jonesChorea, set: setJonesChorea },
              { label: 'Erythema Marginatum [MAJOR]', val: jonesErythema, set: setJonesErythema },
              { label: 'Subcutaneous Nodules [MAJOR]', val: jonesNodules, set: setJonesNodules },
              { label: 'Fever ≥ 38.0°C [MINOR]', val: jonesFever, set: setJonesFever },
              { label: 'Elevated ESR (≥30) or CRP (≥3.0) [MINOR]', val: jonesEsrCrp, set: setJonesEsrCrp },
              { label: 'Prolonged PR Interval on ECG [MINOR]', val: jonesPrInterval, set: setJonesPrInterval },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => item.set(!item.val)}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition-all flex items-center justify-between ${
                  item.val
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-700 text-rose-950 dark:text-rose-200'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{item.label}</span>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                  item.val ? 'bg-rose-600 text-white border-rose-600' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {item.val ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider">AHA Jones Criteria Assessment</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black text-white ${
                jonesResult.arfDiagnosisMet ? 'bg-rose-600' : 'bg-slate-600'
              }`}>
                {jonesResult.arfDiagnosisMet ? 'ARF CRITERIA MET' : 'CRITERIA NOT MET'}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {jonesResult.clinicalInterpretation}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {jonesResult.guideline}
            </span>
          </div>
        </div>
      )}

      {/* Tab 6: WHO MUAC */}
      {activeTab === 'muac' && (
        <div className="space-y-4">
          <div className="max-w-xs">
            <NumberStepper label="MUAC (Age 6-59 months)" unit="mm" value={muacMm} onChange={setMuacMm} min={80} max={180} step={1} />
          </div>

          <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/70 dark:bg-sky-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wider">WHO Malnutrition Staging</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black text-white ${
                muacResult.classification.includes('Severe') ? 'bg-red-600' : muacResult.classification.includes('Moderate') ? 'bg-amber-600' : 'bg-emerald-600'
              }`}>
                {muacResult.classification}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {muacResult.recommendation}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {muacResult.guideline}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

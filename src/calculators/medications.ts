export interface RhogamInput {
  fetalCellsPercent: number; // e.g. 1.2%
}

export interface RhogamResult {
  fetalBloodVolumeMl: number; // in mL
  vialsRequired: number; // 300 mcg vials
  totalMicrograms: number;
  recommendation: string;
  noteSnippet: string;
}

export interface GanzoniInput {
  weightKg: number;
  actualHb: number; // g/dL
  targetHb?: number; // default 11.0 or 12.0 g/dL
  depotIronMg?: number; // default 500 mg
}

export interface GanzoniResult {
  totalIronDeficitMg: number;
  calculatedStoresMg: number;
  infusionSuggestions: {
    formulation: string;
    dosingStrategy: string;
  }[];
  noteSnippet: string;
}

export interface MagnesiumProtocol {
  indication: 'Preeclampsia with Severe Features' | 'Fetal Neuroprotection (< 32 wks)' | 'Active Eclamptic Seizure';
  loadingDose: string;
  maintenanceRate: string;
  duration: string;
  renalAdjustment: string;
  toxicityMonitoring: {
    targetLevel: string;
    clinicalSigns: string[];
    antidote: string;
  };
}

export function calculateRhogamDose(input: RhogamInput): RhogamResult {
  const percent = Math.max(0, input.fetalCellsPercent);
  // Volume of fetal whole blood (mL) = % fetal cells * 50
  const fetalBloodVolumeMl = Math.round(percent * 50 * 10) / 10;
  
  // Standard 300 mcg (1,500 IU) ampule covers 30 mL fetal whole blood (15 mL fetal RBCs)
  // ACOG Practice Bulletin 181 rule: Divide volume by 30, round up, and add 1 extra safety vial
  const baseVials = Math.ceil(fetalBloodVolumeMl / 30);
  const vialsRequired = Math.max(1, baseVials + 1);
  const totalMicrograms = vialsRequired * 300;

  const recommendation = `Administer ${vialsRequired} vial(s) of 300 mcg (1,500 IU) Anti-D immune globulin intramuscularly or intravenously within 72 hours of the fetomaternal hemorrhage event.`;

  const noteSnippet = `ANTI-D (RHOGAM) DOSING (Kleihauer-Betke):
- KB Test: ${percent}% fetal cells
- Calculated Fetal Whole Blood: ${fetalBloodVolumeMl} mL
- Dose: ${vialsRequired} x 300 mcg vials (${totalMicrograms} mcg total)
Plan: ${recommendation}`;

  return {
    fetalBloodVolumeMl,
    vialsRequired,
    totalMicrograms,
    recommendation,
    noteSnippet,
  };
}

export function calculateGanzoniIron(input: GanzoniInput): GanzoniResult {
  const targetHb = input.targetHb ?? 11.0;
  const depot = input.depotIronMg ?? 500;
  const hbDeficit = Math.max(0, targetHb - input.actualHb);

  // Ganzoni Formula: Total Iron Deficit (mg) = [Weight (kg) * (Target Hb - Actual Hb) * 2.4] + Depot Iron (mg)
  const factor = 2.4; // 0.0034 * 0.07 * 10,000 conversion constant
  const totalIronDeficitMg = Math.round(input.weightKg * hbDeficit * factor + depot);

  const infusionSuggestions = [
    {
      formulation: 'Ferric Carboxymaltose (Injectafer)',
      dosingStrategy: `${totalIronDeficitMg >= 1000 ? '750 mg IV on Day 1, followed by 750 mg IV on Day 8' : `${totalIronDeficitMg} mg IV single dose (max 1000 mg)`}`,
    },
    {
      formulation: 'Iron Sucrose (Venofer)',
      dosingStrategy: `${Math.ceil(totalIronDeficitMg / 200)} divided infusions of 200 mg IV over 10-15 minutes on alternate days`,
    },
    {
      formulation: 'Ferric Derisomaltose (Monoferric)',
      dosingStrategy: `${Math.min(totalIronDeficitMg, 1000)} mg IV single dose over 20 minutes (up to 20 mg/kg)`,
    },
  ];

  const noteSnippet = `IV IRON DEFICIT (Ganzoni Equation):
- Patient Weight: ${input.weightKg} kg | Actual Hb: ${input.actualHb} g/dL | Target: ${targetHb} g/dL
- Total Iron Deficit: ${totalIronDeficitMg} mg (includes ${depot} mg iron stores)
Recommended IV Iron Regimen: ${infusionSuggestions[0].formulation} -> ${infusionSuggestions[0].dosingStrategy}`;

  return {
    totalIronDeficitMg,
    calculatedStoresMg: depot,
    infusionSuggestions,
    noteSnippet,
  };
}

export function getMagnesiumProtocol(indication: MagnesiumProtocol['indication']): MagnesiumProtocol {
  if (indication === 'Active Eclamptic Seizure') {
    return {
      indication,
      loadingDose: '4 - 6 g IV diluted in 100 mL IV fluid administered over 15 - 20 minutes. If convulsions persist after 15 min, give additional 2 g IV over 5 min.',
      maintenanceRate: '1 - 2 g/hour IV continuous infusion.',
      duration: 'Continue for at least 24 hours after the last seizure or 24 hours postpartum, whichever is later.',
      renalAdjustment: 'Check serum creatinine. If Cr >= 1.2 mg/dL or urine output < 30 mL/hr, decrease maintenance to 1 g/hr or titrate based on serial Mg levels q4-6h.',
      toxicityMonitoring: {
        targetLevel: '4.8 - 8.4 mg/dL (2.0 - 3.5 mmol/L)',
        clinicalSigns: [
          'Loss of deep tendon reflexes (patellar) at 9-12 mg/dL',
          'Respiratory depression (<12 breaths/min) at 12-15 mg/dL',
          'Cardiac arrest / arrhythmias at >15 mg/dL',
        ],
        antidote: 'CALCIUM GLUCONATE 10% (1 gram = 10 mL) IV slowly over 3 - 5 minutes. Support airway & oxygenation.',
      },
    };
  }

  if (indication === 'Fetal Neuroprotection (< 32 wks)') {
    return {
      indication,
      loadingDose: '4 g IV over 20 - 30 minutes.',
      maintenanceRate: '1 g/hour IV continuous infusion.',
      duration: 'Continue until delivery or for up to 24 hours maximum if delivery does not occur.',
      renalAdjustment: 'Serum Cr > 1.2 mg/dL: Give 4g IV loading dose; omit or reduce maintenance infusion to 0.5-1 g/hr with strict urine output monitoring.',
      toxicityMonitoring: {
        targetLevel: '4.0 - 7.0 mg/dL (1.6 - 2.9 mmol/L)',
        clinicalSigns: [
          'Monitor patellar reflexes, respiratory rate (>12/min), and continuous pulse oximetry.',
          'Urine output should remain > 30 mL/hr.',
        ],
        antidote: 'CALCIUM GLUCONATE 10% 1 gram (10 mL) IV over 3-5 minutes.',
      },
    };
  }

  // Preeclampsia with Severe Features
  return {
    indication: 'Preeclampsia with Severe Features',
    loadingDose: '4 - 6 g IV piggyback over 20 - 30 minutes.',
    maintenanceRate: '1 - 2 g/hour IV continuous infusion.',
    duration: 'Continue throughout labor and delivery, and for 24 hours postpartum.',
    renalAdjustment: 'In renal insufficiency (Cr >= 1.2 mg/dL or urine output < 30 mL/hr), reduce maintenance to 1 g/hr and check serum Mg levels every 4-6 hours.',
    toxicityMonitoring: {
      targetLevel: '4.8 - 8.4 mg/dL (2.0 - 3.5 mmol/L)',
      clinicalSigns: [
        'Patellar reflexes lost at 9-12 mg/dL (earliest warning)',
        'Respiratory depression (<12/min) at 12-15 mg/dL',
        'Altered mental status / somnolence',
      ],
      antidote: 'CALCIUM GLUCONATE 10% 1 gram (10 mL) IV push over 3-5 min. Stop Mg infusion immediately.',
    },
  };
}

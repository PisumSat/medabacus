/**
 * MEDABACUS Clinical Entity Parser & Multimodal File Extractor
 * Intelligently extracts laboratory parameters, vitals, patient demographics,
 * and clinical entities from raw text, CSV tables, and uploaded clinical files.
 */

export interface ExtractedClinicalEntities {
  // Electrolytes & Metabolic
  na?: number;
  k?: number;
  cl?: number;
  hco3?: number;
  bun?: number;
  cr?: number;
  glucose?: number;
  albumin?: number;
  osmolality?: number;

  // Vitals
  sbp?: number;
  dbp?: number;
  hr?: number;
  rr?: number;
  tempC?: number;
  spo2?: number;

  // Patient Demographics
  age?: number;
  sex?: 'female' | 'male';
  weightKg?: number;
  heightCm?: number;

  // Liver & Coagulation
  bilirubin?: number;
  inr?: number;
  ast?: number;
  alt?: number;
  platelets?: number;
  ascites?: 'moderate' | 'none' | 'slight';
  encephalopathy?: 'grade1_2' | 'grade3_4' | 'none';

  // Surgery & Trauma
  tbsaPercent?: number;
  timeSinceInjuryHours?: number;
  rlqTenderness?: boolean;
  reboundPain?: boolean;
  leukocytosis?: boolean;

  // Obstetrics & Gynecology
  crlMm?: number;
  gestationalWeeks?: number;
  gestationalDays?: number;
  lmpDate?: string;
  headache?: boolean;
  visualChanges?: boolean;

  // Pediatrics
  pediatricAgeYears?: number;
  pediatricWeightKg?: number;

  // Metadata & keywords
  keywords?: string[];
  rawText?: string;
}

export interface MatchedCalculatorRecommendation {
  toolId: string;
  title: string;
  ward: 'internal_medicine' | 'obgyn' | 'pediatrics' | 'surgery';
  wardLabel: string;
  matchReason: string;
  confidence: 'high' | 'medium';
  prefillPayload: Record<string, any>;
  previewCalculation?: {
    summary: string;
    details: Array<{ label: string; value: string | number; badge?: string }>;
  };
}

/**
 * Normalizes number strings (handles decimals, commas)
 */
function parseCleanNumber(val: string): number | undefined {
  if (!val) return undefined;
  const cleaned = val.replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

/**
 * Parse clinical free text using robust medical regular expressions
 */
export function parseClinicalText(text: string): ExtractedClinicalEntities {
  const result: ExtractedClinicalEntities = {};
  const lower = text.toLowerCase();

  // 1. Sodium (Na)
  const naMatch = text.match(/(?:(?:serum\s+)?sodium|s-na|\bna\b|\bna\+?)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]{2,3}(?:\.[0-9]+)?)/i);
  if (naMatch) {
    const val = parseCleanNumber(naMatch[1]);
    if (val && val >= 90 && val <= 190) result.na = Math.round(val);
  }

  // 2. Potassium (K)
  const kMatch = text.match(/(?:(?:serum\s+)?potassium|s-k|\bk\b|\bk\+?)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]+(?:\.[0-9]+)?)/i);
  if (kMatch) {
    const val = parseCleanNumber(kMatch[1]);
    if (val && val >= 1.5 && val <= 10.0) result.k = Number(val.toFixed(1));
  }

  // 3. Chloride (Cl)
  const clMatch = text.match(/(?:chloride|s-cl|\bcl\b|\bcl-?)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]{2,3}(?:\.[0-9]+)?)/i);
  if (clMatch) {
    const val = parseCleanNumber(clMatch[1]);
    if (val && val >= 60 && val <= 140) result.cl = Math.round(val);
  }

  // 4. Bicarbonate / CO2 / HCO3
  const hco3Match = text.match(/(?:bicarbonate|bicarb|hco3-?|co2|total\s+co2)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]{1,2}(?:\.[0-9]+)?)/i);
  if (hco3Match) {
    const val = parseCleanNumber(hco3Match[1]);
    if (val && val >= 2 && val <= 50) result.hco3 = Math.round(val);
  }

  // 5. Blood Urea Nitrogen (BUN) / Urea
  const bunMatch = text.match(/(?:blood\s+urea\s+nitrogen|bun|urea)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]{1,3}(?:\.[0-9]+)?)/i);
  if (bunMatch) {
    const val = parseCleanNumber(bunMatch[1]);
    if (val && val >= 1 && val <= 200) result.bun = Math.round(val);
  }

  // 6. Creatinine (Cr / SCr)
  const crMatch = text.match(/(?:serum\s+creatinine|creatinine|s-cr|\bcr\b|\bscr\b)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]+(?:\.[0-9]+)?)/i);
  if (crMatch) {
    const val = parseCleanNumber(crMatch[1]);
    if (val && val >= 0.1 && val <= 25.0) result.cr = Number(val.toFixed(2));
  }

  // 7. Glucose (Glu / FBS)
  const gluMatch = text.match(/(?:blood\s+glucose|glucose|serum\s+glucose|glu|fbs|bs)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]{2,4}(?:\.[0-9]+)?)/i);
  if (gluMatch) {
    const val = parseCleanNumber(gluMatch[1]);
    if (val && val >= 20 && val <= 1500) result.glucose = Math.round(val);
  }

  // 8. Albumin
  const albMatch = text.match(/(?:serum\s+albumin|albumin|\balb\b)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]+(?:\.[0-9]+)?)/i);
  if (albMatch) {
    const val = parseCleanNumber(albMatch[1]);
    if (val && val >= 0.5 && val <= 6.5) result.albumin = Number(val.toFixed(1));
  }

  // 9. Osmolality
  const osmMatch = text.match(/(?:osmolality|serum\s+osm|osm)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]{3}(?:\.[0-9]+)?)/i);
  if (osmMatch) {
    const val = parseCleanNumber(osmMatch[1]);
    if (val && val >= 200 && val <= 450) result.osmolality = Math.round(val);
  }

  // 10. Blood Pressure: SBP and DBP (e.g. 120/80, 160/95 mmHg)
  const bpMatch = text.match(/(?:bp|blood\s+pressure|pres(?:sure)?)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]{2,3})\s*(?:\/|\s+over\s+)\s*([0-9]{2,3})/i);
  if (bpMatch) {
    const sbp = parseCleanNumber(bpMatch[1]);
    const dbp = parseCleanNumber(bpMatch[2]);
    if (sbp && sbp >= 40 && sbp <= 260) result.sbp = sbp;
    if (dbp && dbp >= 20 && dbp <= 160) result.dbp = dbp;
  } else {
    // Individual SBP / DBP
    const sbpMatch = text.match(/(?:sbp|systolic)\s*(?:[:=]|\bis\b)?\s*([0-9]{2,3})/i);
    if (sbpMatch) {
      const sbp = parseCleanNumber(sbpMatch[1]);
      if (sbp && sbp >= 40 && sbp <= 260) result.sbp = sbp;
    }
    const dbpMatch = text.match(/(?:dbp|diastolic)\s*(?:[:=]|\bis\b)?\s*([0-9]{2,3})/i);
    if (dbpMatch) {
      const dbp = parseCleanNumber(dbpMatch[1]);
      if (dbp && dbp >= 20 && dbp <= 160) result.dbp = dbp;
    }
    // Standalone slash notation without explicit "BP" prefix (e.g. "120/80" or "160/95 mmHg")
    if (!result.sbp && !result.dbp) {
      const slashMatch = text.match(/\b([0-9]{2,3})\/([0-9]{2,3})\b(?:\s*mmhg)?/i);
      if (slashMatch) {
        const sbp = parseCleanNumber(slashMatch[1]);
        const dbp = parseCleanNumber(slashMatch[2]);
        if (sbp && dbp && sbp >= 60 && sbp <= 250 && dbp >= 30 && dbp <= 150 && sbp > dbp) {
          result.sbp = sbp;
          result.dbp = dbp;
        }
      }
    }
  }

  // 11. Heart Rate (HR / Pulse)
  const hrMatch = text.match(/(?:heart\s*rate|hr|pulse|pr)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]{2,3})\s*(?:bpm|\/min)?/i);
  if (hrMatch) {
    const val = parseCleanNumber(hrMatch[1]);
    if (val && val >= 25 && val <= 260) result.hr = Math.round(val);
  }

  // 12. Respiratory Rate (RR)
  const rrMatch = text.match(/(?:respiratory\s*rate|resp\s*rate|rr)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]{1,2})\s*(?:bpm|\/min)?/i);
  if (rrMatch) {
    const val = parseCleanNumber(rrMatch[1]);
    if (val && val >= 5 && val <= 70) result.rr = Math.round(val);
  }

  // 13. Temperature
  const tempMatch = text.match(
    /(?:temp(?:erature)?|\bt\b|fever|febrile)\s*(?:[:=]|\bis\b|\bof\b|\bto\b)?\s*([0-9]{2,3}(?:\.[0-9]+)?)\s*(?:°?\s*([cf]|celsius|fahrenheit))?/i
  );
  if (tempMatch) {
    let val = parseCleanNumber(tempMatch[1]);
    const unit = (tempMatch[2] || '').toLowerCase();
    if (val) {
      if (unit.startsWith('f') || (!unit.startsWith('c') && val >= 95.0 && val <= 108.0)) {
        val = ((val - 32) * 5) / 9;
      }
      if (val >= 32.0 && val <= 42.5) {
        result.tempC = Number(val.toFixed(1));
      }
    }
  } else {
    // Standalone degree Celsius (e.g. 38.5°C or 38.5 C)
    const standaloneTemp = text.match(/\b([34][0-9](?:\.[0-9]+)?)\s*(?:°\s*C|celsius)\b/i);
    if (standaloneTemp) {
      const val = parseCleanNumber(standaloneTemp[1]);
      if (val && val >= 32.0 && val <= 42.5) {
        result.tempC = Number(val.toFixed(1));
      }
    }
  }

  // 14. SpO2
  const spo2Match = text.match(/(?:spo2|pulse\s*ox|o2\s*sat(?:uration)?)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]{2,3})\s*%/i);
  if (spo2Match) {
    const val = parseCleanNumber(spo2Match[1]);
    if (val && val >= 40 && val <= 100) result.spo2 = Math.round(val);
  }

  // 15. Age
  const ageMatch = text.match(/(?:(?:age|pt\s+is|patient\s+is)\s*(?:[:=])?\s*([0-9]{1,3})\s*(?:yo|y\/o|years?\s+old)?|([0-9]{1,3})\s*(?:yo|y\/o|years?\s+old|m\b|f\b))/i);
  if (ageMatch) {
    const raw = ageMatch[1] || ageMatch[2];
    const val = parseCleanNumber(raw);
    if (val && val >= 0 && val <= 120) {
      result.age = Math.round(val);
      if (val <= 18) {
        result.pediatricAgeYears = Math.round(val);
      }
    }
  }

  // 16. Sex
  if (/\b(?:female|woman|girl|lady|pregnant|gyn|multip|nullip)\b/i.test(text) || /\b(?:f|female)\b/i.test(lower)) {
    result.sex = 'female';
  } else if (/\b(?:male|man|boy|gentleman)\b/i.test(text) || /\b(?:m|male)\b/i.test(lower)) {
    result.sex = 'male';
  }

  // 17. Weight (kg or lbs)
  const wtMatch = text.match(/(?:weight|wt)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]{1,3}(?:\.[0-9]+)?)\s*(kg|lbs?|pounds?)?/i);
  if (wtMatch) {
    let val = parseCleanNumber(wtMatch[1]);
    const unit = (wtMatch[2] || '').toLowerCase();
    if (val) {
      if (unit.startsWith('lb') || unit.startsWith('pound')) {
        val = Number((val * 0.453592).toFixed(1));
      }
      if (val >= 1 && val <= 300) {
        result.weightKg = Number(val.toFixed(1));
        if (val <= 40) result.pediatricWeightKg = Number(val.toFixed(1));
      }
    }
  } else {
    // Shorthand e.g. "70kg" or "15 kg"
    const shorthandWt = text.match(/\b([0-9]{1,3}(?:\.[0-9]+)?)\s*kg\b/i);
    if (shorthandWt) {
      const val = parseCleanNumber(shorthandWt[1]);
      if (val && val >= 1 && val <= 300) {
        result.weightKg = Number(val.toFixed(1));
        if (val <= 40) result.pediatricWeightKg = Number(val.toFixed(1));
      }
    }
  }

  // 18. Height (cm or in)
  const htMatch = text.match(/(?:height|ht)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]{2,3}(?:\.[0-9]+)?)\s*(cm|in|inch(?:es)?)?/i);
  if (htMatch) {
    let val = parseCleanNumber(htMatch[1]);
    const unit = (htMatch[2] || '').toLowerCase();
    if (val) {
      if (unit.startsWith('in')) {
        val = Number((val * 2.54).toFixed(1));
      }
      if (val >= 40 && val <= 250) result.heightCm = Math.round(val);
    }
  }

  // 19. Bilirubin (Total)
  const biliMatch = text.match(/(?:total\s+bilirubin|bilirubin|t-bili|s-bili|\bbili\b)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]+(?:\.[0-9]+)?)/i);
  if (biliMatch) {
    const val = parseCleanNumber(biliMatch[1]);
    if (val && val >= 0.1 && val <= 50.0) result.bilirubin = Number(val.toFixed(1));
  }

  // 20. INR
  const inrMatch = text.match(/(?:inr|prothrombin\s*time\s*inr)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]+(?:\.[0-9]+)?)/i);
  if (inrMatch) {
    const val = parseCleanNumber(inrMatch[1]);
    if (val && val >= 0.7 && val <= 15.0) result.inr = Number(val.toFixed(1));
  }

  // 21. AST & ALT
  const astMatch = text.match(/(?:ast|sgot)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]{1,4})/i);
  if (astMatch) {
    const val = parseCleanNumber(astMatch[1]);
    if (val && val >= 5 && val <= 5000) result.ast = val;
  }
  const altMatch = text.match(/(?:alt|sgpt)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]{1,4})/i);
  if (altMatch) {
    const val = parseCleanNumber(altMatch[1]);
    if (val && val >= 5 && val <= 5000) result.alt = val;
  }

  // 22. Platelets
  const pltMatch = text.match(/(?:platelets?|plt)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]{1,3}(?:,[0-9]{3})?|[0-9]{2,4})/i);
  if (pltMatch) {
    let val = parseCleanNumber(pltMatch[1]);
    if (val) {
      if (val > 1000) val = Math.round(val / 1000); // convert 150000 -> 150
      if (val >= 5 && val <= 1000) result.platelets = val;
    }
  }

  // 23. Burn TBSA%
  const burnMatch = text.match(/(?:tbsa|burn(?:s)?(?:%|\s*percent)?)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]{1,2}(?:\.[0-9]+)?)\s*%/i);
  if (burnMatch) {
    const val = parseCleanNumber(burnMatch[1]);
    if (val && val >= 1 && val <= 100) result.tbsaPercent = Math.round(val);
  } else {
    const percentMatch = text.match(/([0-9]{1,2})%\s*(?:tbsa|burns?|second\s*degree)/i);
    if (percentMatch) {
      const val = parseCleanNumber(percentMatch[1]);
      if (val && val >= 1 && val <= 100) result.tbsaPercent = Math.round(val);
    }
  }

  // Time since burn
  const burnTimeMatch = text.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:hours?|hrs?)\s*(?:post|since|after)?\s*burn/i);
  if (burnTimeMatch) {
    const val = parseCleanNumber(burnTimeMatch[1]);
    if (val && val >= 0 && val <= 24) result.timeSinceInjuryHours = Math.round(val);
  }

  // 24. Crown-Rump Length (CRL)
  const crlMatch = text.match(/(?:crl|crown\s*rump\s*length)\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]{1,2}(?:\.[0-9]+)?)\s*(?:mm)?/i);
  if (crlMatch) {
    const val = parseCleanNumber(crlMatch[1]);
    if (val && val >= 2 && val <= 90) result.crlMm = Number(val.toFixed(1));
  }

  // LMP Date (YYYY-MM-DD or MM/DD/YYYY)
  const lmpMatch = text.match(/lmp\s*(?:[:=]|\bis\b|\bof\b)?\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i);
  if (lmpMatch) {
    result.lmpDate = lmpMatch[1];
  }

  // 25. Clinical Findings Flags
  if (/\b(?:rlq|right\s+lower\s+quadrant)\s*(?:pain|tenderness)\b/i.test(text)) {
    result.rlqTenderness = true;
  }
  if (/\b(?:rebound|blumberg|peritoneal\s*signs?)\b/i.test(text)) {
    result.reboundPain = true;
  }
  if (/\b(?:headache|severe\s*headache|persistent\s*headache)\b/i.test(text)) {
    result.headache = true;
  }
  if (/\b(?:vision|visual\s*changes|scotoma|blurred\s*vision)\b/i.test(text)) {
    result.visualChanges = true;
  }
  if (/\b(?:ascites\s*\(\+\)|moderate\s*ascites|tense\s*ascites)\b/i.test(text)) {
    result.ascites = 'moderate';
  } else if (/\b(?:mild\s*ascites|slight\s*ascites)\b/i.test(text)) {
    result.ascites = 'slight';
  }
  if (/\b(?:grade\s*3|grade\s*4|severe\s*encephalopathy)\b/i.test(text)) {
    result.encephalopathy = 'grade3_4';
  } else if (/\b(?:grade\s*1|grade\s*2|mild\s*encephalopathy|asterixis)\b/i.test(text)) {
    result.encephalopathy = 'grade1_2';
  }

  // Detect clinical keywords for suite routing
  const keywords: string[] = [];
  if (/\b(?:timi|heart\s*score|killip|qtc|coronary|nstemi|angina|troponin)\b/i.test(text)) keywords.push('cardiology');
  if (/\b(?:sofa|qsofa|sepsis|light'?s\s*criteria|effusion|berlin|ards|a-a\s*gradient|alveolar)\b/i.test(text)) keywords.push('critical_care');
  if (/\b(?:fena|feurea|fractional\s*excretion|winter'?s|free\s*water|hypernatremia|corrected\s*calcium)\b/i.test(text)) keywords.push('renal_fluids');
  if (/\b(?:abcd2|tia|transient\s*ischemic|stroke|sirs|dengue|mentzer|thalassemia|anc|neutrophil)\b/i.test(text)) keywords.push('neuro_systemic');
  if (/\b(?:revised\s*trauma|rts|abc\s*score|mtp|massive\s*transfusion|shock\s*index|baux)\b/i.test(text)) keywords.push('trauma_acute');
  if (/\b(?:asa\s*(?:status|class)|mallampati|stop-bang|sleep\s*apnea|ankle-brachial|abi|braden)\b/i.test(text)) keywords.push('surgical_preop');
  if (/\b(?:ballard|silverman|newborn|neonate|corrected\s*age|mid-parental|target\s*height)\b/i.test(text)) keywords.push('neonatology');
  if (/\b(?:croup|westley|pecarn|head\s*(?:injury|trauma)|kawasaki)\b/i.test(text)) keywords.push('pediatric_emergency');
  if (/\b(?:fundal\s*height|mcdonald|biophysical\s*profile|bpp|carpenter-coustan|gdm\s*ogtt)\b/i.test(text)) keywords.push('antenatal_fetal');
  if (/\b(?:hellp|mississippi|fhr\s*category|nichd|helperr|shoulder\s*dystocia)\b/i.test(text)) keywords.push('high_risk_maternal');
  if (/\b(?:rotterdam|pcos|polycystic|ferriman-gallwey|hirsutism)\b/i.test(text)) keywords.push('gyn_endocrine');
  result.keywords = keywords;
  result.rawText = text;

  return result;
}

/**
 * Parses structured CSV or Tab-Separated laboratory values
 */
export function parseCsvLabs(csvContent: string): ExtractedClinicalEntities {
  const lines = csvContent.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) return {};

  const textBuffer: string[] = [];

  // Check if first line has 3+ columns (tabular CSV format with headers)
  const firstRowParts = lines[0].split(/[,;\t]+/).map((p) => p.replace(/["']/g, '').trim());
  if (firstRowParts.length >= 3 && lines.length >= 2) {
    // Check if subsequent lines have numbers corresponding to headers
    for (let r = 1; r < lines.length; r++) {
      const rowParts = lines[r].split(/[,;\t]+/).map((p) => p.replace(/["']/g, '').trim());
      for (let c = 0; c < Math.min(firstRowParts.length, rowParts.length); c++) {
        const header = firstRowParts[c];
        const val = rowParts[c];
        if (header && val && !isNaN(parseFloat(val))) {
          textBuffer.push(`${header}: ${val}`);
        }
      }
    }
  }

  // Also process standard key-value rows (e.g. "Sodium, 138")
  for (const line of lines) {
    const parts = line.split(/[,;\t]+/).map((p) => p.replace(/["']/g, '').trim());
    if (parts.length >= 2) {
      const analyte = parts[0];
      const val = parts[1];
      if (isNaN(parseFloat(analyte)) && !isNaN(parseFloat(val))) {
        textBuffer.push(`${analyte}: ${val}`);
      }
    } else if (parts.length === 1) {
      textBuffer.push(parts[0]);
    }
  }

  return parseClinicalText(textBuffer.join('\n'));
}

/**
 * Intelligent Matching & Routing:
 * Maps extracted entities to our 32 preexisting hospital calculators
 */
export function matchClinicalCalculators(entities: ExtractedClinicalEntities): MatchedCalculatorRecommendation[] {
  const matches: MatchedCalculatorRecommendation[] = [];

  // 1. Electrolytes & Acid-Base Suite
  if (
    entities.na !== undefined ||
    entities.k !== undefined ||
    entities.cl !== undefined ||
    entities.hco3 !== undefined ||
    entities.glucose !== undefined ||
    entities.bun !== undefined
  ) {
    const prefill: Record<string, any> = {};
    if (entities.na !== undefined) prefill.na = entities.na;
    if (entities.glucose !== undefined) prefill.glucose = entities.glucose;
    if (entities.bun !== undefined) prefill.bun = entities.bun;
    if (entities.k !== undefined) prefill.k = entities.k;
    if (entities.cl !== undefined) prefill.cl = entities.cl;
    if (entities.hco3 !== undefined) prefill.hco3 = entities.hco3;
    if (entities.albumin !== undefined) prefill.albumin = entities.albumin;
    if (entities.osmolality !== undefined) prefill.measuredOsm = entities.osmolality;

    const details: Array<{ label: string; value: string | number; badge?: string }> = [];
    if (entities.na && entities.cl && entities.hco3) {
      const ag = entities.na - (entities.cl + entities.hco3);
      details.push({ label: 'Anion Gap', value: `${ag} mEq/L`, badge: ag > 12 ? 'High Gap' : 'Normal' });
    }
    if (entities.na && entities.glucose) {
      const katzNa = (entities.na + 0.016 * Math.max(0, entities.glucose - 100)).toFixed(1);
      details.push({ label: 'Katz Corrected Na', value: `${katzNa} mEq/L` });
    }

    matches.push({
      toolId: 'electrolytes',
      title: 'Electrolytes & Acid-Base Suite',
      ward: 'internal_medicine',
      wardLabel: 'Internal Medicine',
      matchReason: 'Metabolic & electrolyte panel detected (Na, K, Cl, HCO3, Glucose, BUN)',
      confidence: 'high',
      prefillPayload: prefill,
      previewCalculation: details.length > 0 ? {
        summary: `Calculated Anion Gap & Hyperglycemia Sodium Correction`,
        details,
      } : undefined,
    });
  }

  // 2. CKD-EPI 2021 & Cockcroft-Gault CrCl
  if (entities.cr !== undefined) {
    const prefill: Record<string, any> = { scrMgDl: entities.cr };
    if (entities.age !== undefined) prefill.age = entities.age;
    if (entities.sex !== undefined) prefill.sex = entities.sex;
    if (entities.weightKg !== undefined) prefill.weightKg = entities.weightKg;
    if (entities.heightCm !== undefined) prefill.heightCm = entities.heightCm;

    matches.push({
      toolId: 'ckd_crcl',
      title: 'CKD-EPI 2021 eGFR & CrCl',
      ward: 'internal_medicine',
      wardLabel: 'Internal Medicine',
      matchReason: `Serum Creatinine (${entities.cr} mg/dL) identified for kidney staging & renal drug clearance`,
      confidence: 'high',
      prefillPayload: prefill,
    });
  }

  // 3. CURB-65 Pneumonia Severity
  if (
    entities.rr !== undefined ||
    entities.sbp !== undefined ||
    entities.bun !== undefined ||
    (entities.age !== undefined && entities.age >= 65)
  ) {
    const prefill: Record<string, any> = {};
    if (entities.age !== undefined) prefill.age65 = entities.age >= 65;
    if (entities.bun !== undefined) prefill.bunElevated = entities.bun > 19;
    if (entities.rr !== undefined) prefill.rrElevated = entities.rr >= 30;
    if (entities.sbp !== undefined || entities.dbp !== undefined) {
      prefill.lowBp = (entities.sbp !== undefined && entities.sbp < 90) || (entities.dbp !== undefined && entities.dbp <= 60);
    }

    matches.push({
      toolId: 'curb65',
      title: 'CURB-65 Pneumonia Severity',
      ward: 'internal_medicine',
      wardLabel: 'Internal Medicine',
      matchReason: 'Pneumonia triage criteria identified (Age, RR, Blood Pressure, BUN)',
      confidence: 'medium',
      prefillPayload: prefill,
    });
  }

  // 4. MELD-Na 2016 & Child-Pugh Cirrhosis Suite
  if (entities.bilirubin !== undefined || entities.inr !== undefined) {
    const prefill: Record<string, any> = {};
    if (entities.bilirubin !== undefined) prefill.bili = entities.bilirubin;
    if (entities.inr !== undefined) prefill.inr = entities.inr;
    if (entities.cr !== undefined) prefill.cr = entities.cr;
    if (entities.na !== undefined) prefill.na = entities.na;
    if (entities.albumin !== undefined) prefill.albumin = entities.albumin;
    if (entities.ascites !== undefined) prefill.ascites = entities.ascites;
    if (entities.encephalopathy !== undefined) prefill.enceph = entities.encephalopathy;

    matches.push({
      toolId: 'liver_meld_child',
      title: 'MELD-Na 2016 & Child-Pugh',
      ward: 'internal_medicine',
      wardLabel: 'Internal Medicine',
      matchReason: 'Hepatic liver function & coagulopathy labs detected (Bilirubin, INR, Cr, Na)',
      confidence: 'high',
      prefillPayload: prefill,
    });
  }

  // 5. Parkland Burn Resuscitation Suite
  if (entities.tbsaPercent !== undefined) {
    const prefill: Record<string, any> = { tbsaPercent: entities.tbsaPercent };
    if (entities.weightKg !== undefined) prefill.weightKg = entities.weightKg;
    if (entities.timeSinceInjuryHours !== undefined) prefill.timeSinceInjuryHours = entities.timeSinceInjuryHours;

    matches.push({
      toolId: 'parkland_burn',
      title: 'Parkland Burn Resuscitation',
      ward: 'surgery',
      wardLabel: 'General Surgery & Trauma',
      matchReason: `Acute burn detected (${entities.tbsaPercent}% TBSA) for fluid calculation`,
      confidence: 'high',
      prefillPayload: prefill,
    });
  }

  // 6. Alvarado & AIR Appendicitis Score
  if (entities.rlqTenderness || entities.reboundPain) {
    const prefill: Record<string, any> = {
      rlqTenderness: Boolean(entities.rlqTenderness),
      rebound: Boolean(entities.reboundPain),
    };
    if (entities.tempC && entities.tempC >= 37.3) prefill.fever = true;

    matches.push({
      toolId: 'appendicitis',
      title: 'Alvarado & AIR Appendicitis',
      ward: 'surgery',
      wardLabel: 'General Surgery & Trauma',
      matchReason: 'Acute abdominal RLQ tenderness & peritoneal signs detected',
      confidence: 'high',
      prefillPayload: prefill,
    });
  }

  // 7. ACOG 700 EDD Dating & Robinson CRL
  if (entities.crlMm !== undefined || entities.lmpDate !== undefined) {
    const prefill: Record<string, any> = {};
    if (entities.crlMm !== undefined) prefill.crl = entities.crlMm;
    if (entities.lmpDate !== undefined) prefill.lmpDate = entities.lmpDate;

    matches.push({
      toolId: 'dating',
      title: 'ACOG 700 Dating & Robinson CRL',
      ward: 'obgyn',
      wardLabel: 'Obstetrics & Gynecology',
      matchReason: `Ultrasound biometry (CRL: ${entities.crlMm ?? 'LMP'}) detected for gestational dating`,
      confidence: 'high',
      prefillPayload: prefill,
    });
  }

  // 8. Preeclampsia & Severe Features Evaluation
  if (
    (entities.sbp !== undefined && entities.sbp >= 140) ||
    (entities.dbp !== undefined && entities.dbp >= 90) ||
    entities.platelets !== undefined ||
    entities.headache ||
    entities.visualChanges
  ) {
    const prefill: Record<string, any> = {};
    if (entities.sbp !== undefined) prefill.sbp = entities.sbp;
    if (entities.dbp !== undefined) prefill.dbp = entities.dbp;
    if (entities.platelets !== undefined) prefill.platelets = entities.platelets;
    if (entities.cr !== undefined) prefill.cr = entities.cr;
    if (entities.ast !== undefined) prefill.astAlt = entities.ast;
    if (entities.headache) prefill.headache = true;
    if (entities.visualChanges) prefill.visionChanges = true;

    matches.push({
      toolId: 'preeclampsia',
      title: 'Preeclampsia PB 222 & Severe Features',
      ward: 'obgyn',
      wardLabel: 'Obstetrics & Gynecology',
      matchReason: 'Hypertensive OB parameters or end-organ laboratory signs detected',
      confidence: 'medium',
      prefillPayload: prefill,
    });
  }

  // 9. Pediatric Vitals & AAP 2017 Blood Pressure
  if (
    (entities.pediatricAgeYears !== undefined || (entities.age !== undefined && entities.age < 18)) &&
    (entities.sbp !== undefined || entities.dbp !== undefined)
  ) {
    const age = entities.pediatricAgeYears ?? entities.age ?? 5;
    const prefill: Record<string, any> = { ageYears: age };
    if (entities.sbp !== undefined) prefill.sbp = entities.sbp;
    if (entities.dbp !== undefined) prefill.dbp = entities.dbp;
    if (entities.sex !== undefined) prefill.sex = entities.sex;

    matches.push({
      toolId: 'pediatric_bp_vitals',
      title: 'Pediatric Blood Pressure & Vitals',
      ward: 'pediatrics',
      wardLabel: 'Pediatrics & Resuscitation',
      matchReason: `Pediatric patient (${age}yo) with blood pressure vitals detected`,
      confidence: 'high',
      prefillPayload: prefill,
    });
  }

  // 10. Holliday-Segar Maintenance & Dehydration Deficit
  if (entities.pediatricWeightKg !== undefined || (entities.weightKg !== undefined && entities.weightKg <= 40)) {
    const weight = entities.pediatricWeightKg ?? entities.weightKg ?? 15;
    matches.push({
      toolId: 'holliday_segar',
      title: 'Holliday-Segar Fluids & Deficit',
      ward: 'pediatrics',
      wardLabel: 'Pediatrics & Resuscitation',
      matchReason: `Pediatric weight (${weight} kg) detected for 100/50/20 IV fluid calculation`,
      confidence: 'medium',
      prefillPayload: { weightKg: weight },
    });
  }

  // 11. PSI / PORT Pneumonia Severity Index
  if (
    (entities.age !== undefined && entities.age >= 50 && (entities.rr !== undefined || entities.sbp !== undefined || entities.bun !== undefined)) ||
    (entities.rr !== undefined && entities.rr >= 30) ||
    (entities.bun !== undefined && entities.bun >= 30) ||
    (entities.glucose !== undefined && entities.glucose >= 250)
  ) {
    const prefill: Record<string, any> = {};
    if (entities.age !== undefined) prefill.age = entities.age;
    if (entities.sex !== undefined) prefill.sex = entities.sex;
    if (entities.rr !== undefined) prefill.rr30 = entities.rr >= 30;
    if (entities.sbp !== undefined) prefill.sbp90 = entities.sbp < 90;
    if (entities.bun !== undefined) prefill.bun30 = entities.bun >= 30;
    if (entities.na !== undefined) prefill.sodiumLow = entities.na < 130;
    if (entities.glucose !== undefined) prefill.glucoseHigh = entities.glucose >= 250;

    matches.push({
      toolId: 'psi_port',
      title: 'PSI / PORT Pneumonia Severity',
      ward: 'internal_medicine',
      wardLabel: 'Internal Medicine',
      matchReason: 'Pneumonia severity physiological parameters detected for inpatient vs outpatient stratification',
      confidence: 'high',
      prefillPayload: prefill,
    });
  }

  // 12. Cardiology & ACS Suite (TIMI, HEART, Killip, QTc)
  if (entities.keywords?.includes('cardiology')) {
    matches.push({
      toolId: 'cardiology_suite',
      title: 'Cardiology & ACS Suite',
      ward: 'internal_medicine',
      wardLabel: 'Internal Medicine',
      matchReason: 'Coronary artery disease, TIMI/HEART score, Killip or QTc parameters identified',
      confidence: 'high',
      prefillPayload: {
        sbp: entities.sbp,
        hr: entities.hr,
        age: entities.age,
      },
    });
  }

  // 13. Critical Care & Pulmonology Suite (SOFA, qSOFA, Light's, ARDS, A-a)
  if (entities.keywords?.includes('critical_care')) {
    matches.push({
      toolId: 'critical_care_pulm_suite',
      title: 'Critical Care & Pulmonology',
      ward: 'internal_medicine',
      wardLabel: 'Internal Medicine',
      matchReason: 'Sepsis SOFA/qSOFA, pleural effusion Light criteria, or ARDS Berlin criteria detected',
      confidence: 'high',
      prefillPayload: {
        sbp: entities.sbp,
        rr: entities.rr,
        platelets: entities.platelets,
        bili: entities.bilirubin,
        cr: entities.cr,
      },
    });
  }

  // 14. Nephrology & Fluids Suite (FENa, FEUrea, Winter's, Free Water, Corrected Ca)
  if (entities.keywords?.includes('renal_fluids')) {
    matches.push({
      toolId: 'renal_fluids_suite',
      title: 'Nephrology & Fluids Suite',
      ward: 'internal_medicine',
      wardLabel: 'Internal Medicine',
      matchReason: 'Fractional excretion (FENa/FEUrea), Winter metabolic acidosis, or hypernatremia deficit detected',
      confidence: 'high',
      prefillPayload: {
        sNa: entities.na,
        sCr: entities.cr,
        bun: entities.bun,
        hco3: entities.hco3,
        weightKg: entities.weightKg,
      },
    });
  }

  // 15. Neurology & Systemic Medicine Suite (ABCD2, SIRS, Dengue, Mentzer, ANC)
  if (entities.keywords?.includes('neuro_systemic')) {
    matches.push({
      toolId: 'neuro_systemic_suite',
      title: 'Neurology & Systemic Medicine',
      ward: 'internal_medicine',
      wardLabel: 'Internal Medicine',
      matchReason: 'ABCD² TIA risk, SIRS, Dengue warning signs, or hematology indices detected',
      confidence: 'high',
      prefillPayload: {
        sbp: entities.sbp,
        dbp: entities.dbp,
        age: entities.age,
      },
    });
  }

  // 16. Trauma & Acute Resuscitation Suite (RTS, ABC for MTP, Shock Index, Baux)
  if (entities.keywords?.includes('trauma_acute')) {
    matches.push({
      toolId: 'trauma_acute_suite',
      title: 'Trauma & Acute Resuscitation',
      ward: 'surgery',
      wardLabel: 'General Surgery & Trauma',
      matchReason: 'Trauma triage RTS, massive transfusion protocol ABC score, or shock index detected',
      confidence: 'high',
      prefillPayload: {
        sbp: entities.sbp,
        hr: entities.hr,
        rr: entities.rr,
        tbsa: entities.tbsaPercent,
      },
    });
  }

  // 17. Preoperative & Nursing Risk Suite (ASA, Mallampati, STOP-BANG, ABI, Braden)
  if (entities.keywords?.includes('surgical_preop')) {
    matches.push({
      toolId: 'surgical_preop_suite',
      title: 'Preoperative & Nursing Risk',
      ward: 'surgery',
      wardLabel: 'General Surgery & Trauma',
      matchReason: 'ASA physical status, STOP-BANG airway OSA, vascular ABI, or Braden scale detected',
      confidence: 'high',
      prefillPayload: {
        weightKg: entities.weightKg,
        age: entities.age,
      },
    });
  }

  // 18. Neonatology & NICU Suite (Ballard, Silverman-Andersen, Corrected Age, MPH)
  if (entities.keywords?.includes('neonatology')) {
    matches.push({
      toolId: 'neonatology_nicu_suite',
      title: 'Neonatology & NICU Suite',
      ward: 'pediatrics',
      wardLabel: 'Pediatrics & Resuscitation',
      matchReason: 'Neonatal Ballard gestational maturity, Silverman respiratory distress, or preemie corrected age detected',
      confidence: 'high',
      prefillPayload: {
        gestationalWeeks: entities.gestationalWeeks,
      },
    });
  }

  // 19. Pediatric Emergency & Infectious Suite (Croup, PECARN, Kawasaki)
  if (entities.keywords?.includes('pediatric_emergency')) {
    matches.push({
      toolId: 'peds_emergency_suite',
      title: 'Pediatric Emergency & Infectious',
      ward: 'pediatrics',
      wardLabel: 'Pediatrics & Resuscitation',
      matchReason: 'Westley croup score, PECARN head trauma rule, or Kawasaki disease criteria detected',
      confidence: 'high',
      prefillPayload: {
        ageYears: entities.pediatricAgeYears ?? entities.age,
      },
    });
  }

  // 20. Antenatal & Fetal Surveillance Suite (Fundal Height, Manning BPP, GDM OGTT)
  if (entities.keywords?.includes('antenatal_fetal')) {
    matches.push({
      toolId: 'antenatal_fetal_suite',
      title: 'Antenatal & Fetal Surveillance',
      ward: 'obgyn',
      wardLabel: 'Obstetrics & Gynecology',
      matchReason: 'Fundal height discordance, Manning biophysical profile, or Carpenter-Coustan GDM OGTT detected',
      confidence: 'high',
      prefillPayload: {
        gaWeeks: entities.gestationalWeeks,
      },
    });
  }

  // 21. High-Risk Obstetrics & Labor Suite (HELLP, NICHD FHR, HELPERR)
  if (entities.keywords?.includes('high_risk_maternal')) {
    matches.push({
      toolId: 'high_risk_maternal',
      title: 'High-Risk Obstetrics & Labor',
      ward: 'obgyn',
      wardLabel: 'Obstetrics & Gynecology',
      matchReason: 'HELLP syndrome (Mississippi class), NICHD FHR category, or HELPERR shoulder dystocia protocol detected',
      confidence: 'high',
      prefillPayload: {
        platelets: entities.platelets,
        ast: entities.ast,
        bili: entities.bilirubin,
      },
    });
  }

  // 22. Gynecologic Endocrinology Suite (Rotterdam PCOS, Ferriman-Gallwey)
  if (entities.keywords?.includes('gyn_endocrine')) {
    matches.push({
      toolId: 'gyn_endocrine_suite',
      title: 'Gynecologic Endocrinology Suite',
      ward: 'obgyn',
      wardLabel: 'Obstetrics & Gynecology',
      matchReason: 'Rotterdam PCOS criteria or Ferriman-Gallwey hirsutism evaluation detected',
      confidence: 'high',
      prefillPayload: {},
    });
  }

  return matches;
}

export interface ClinicalAnalyteRow {
  analyte: string;
  value: string;
  normalRange: string;
  status: 'normal' | 'abnormal' | 'critical';
  flag: string;
}

export interface ChatGptClinicalAnalysis {
  summary: string;
  parameterTable: ClinicalAnalyteRow[];
  recommendationsSummary: string;
}

/**
 * Generates ChatGPT-like conversational synthesis and structured laboratory table
 */
export function generateChatGptClinicalAnalysis(
  entities: ExtractedClinicalEntities,
  matchedCalculators: MatchedCalculatorRecommendation[]
): ChatGptClinicalAnalysis {
  const table: ClinicalAnalyteRow[] = [];
  const findings: string[] = [];

  // Electrolytes
  if (entities.na !== undefined) {
    const status = entities.na < 130 || entities.na > 150 ? 'critical' : entities.na < 135 || entities.na > 145 ? 'abnormal' : 'normal';
    const flag = entities.na < 135 ? 'Hyponatremia' : entities.na > 145 ? 'Hypernatremia' : 'Normal';
    table.push({ analyte: 'Sodium (Na⁺)', value: `${entities.na} mEq/L`, normalRange: '135 – 145 mEq/L', status, flag });
    if (status !== 'normal') findings.push(`${flag} (${entities.na} mEq/L)`);
  }

  if (entities.k !== undefined) {
    const status = entities.k < 3.0 || entities.k > 6.0 ? 'critical' : entities.k < 3.5 || entities.k > 5.0 ? 'abnormal' : 'normal';
    const flag = entities.k < 3.5 ? 'Hypokalemia' : entities.k > 5.0 ? 'Hyperkalemia' : 'Normal';
    table.push({ analyte: 'Potassium (K⁺)', value: `${entities.k} mEq/L`, normalRange: '3.5 – 5.0 mEq/L', status, flag });
    if (status !== 'normal') findings.push(`${flag} (${entities.k} mEq/L)`);
  }

  if (entities.cl !== undefined) {
    const status = entities.cl < 96 || entities.cl > 106 ? 'abnormal' : 'normal';
    table.push({ analyte: 'Chloride (Cl⁻)', value: `${entities.cl} mEq/L`, normalRange: '96 – 106 mEq/L', status, flag: status === 'normal' ? 'Normal' : 'Abnormal' });
  }

  if (entities.hco3 !== undefined) {
    const status = entities.hco3 < 18 ? 'critical' : entities.hco3 < 22 || entities.hco3 > 28 ? 'abnormal' : 'normal';
    const flag = entities.hco3 < 22 ? 'Metabolic Acidosis' : entities.hco3 > 28 ? 'Metabolic Alkalosis' : 'Normal';
    table.push({ analyte: 'Bicarbonate (HCO₃⁻)', value: `${entities.hco3} mEq/L`, normalRange: '22 – 28 mEq/L', status, flag });
    if (status !== 'normal') findings.push(`${flag} (${entities.hco3} mEq/L)`);
  }

  if (entities.bun !== undefined) {
    const status = entities.bun > 30 ? 'critical' : entities.bun > 20 ? 'abnormal' : 'normal';
    const flag = entities.bun > 20 ? 'Elevated BUN / Azotemia' : 'Normal';
    table.push({ analyte: 'Blood Urea Nitrogen (BUN)', value: `${entities.bun} mg/dL`, normalRange: '7 – 20 mg/dL', status, flag });
    if (status !== 'normal') findings.push(`Azotemia (BUN ${entities.bun} mg/dL)`);
  }

  if (entities.cr !== undefined) {
    const status = entities.cr >= 2.0 ? 'critical' : entities.cr > 1.2 ? 'abnormal' : 'normal';
    const flag = entities.cr > 1.2 ? 'Elevated Creatinine (Renal Impairment)' : 'Normal';
    table.push({ analyte: 'Serum Creatinine (SCr)', value: `${entities.cr} mg/dL`, normalRange: '0.6 – 1.2 mg/dL', status, flag });
    if (status !== 'normal') findings.push(`Elevated Creatinine (${entities.cr} mg/dL)`);
  }

  if (entities.glucose !== undefined) {
    const status = entities.glucose > 300 || entities.glucose < 60 ? 'critical' : entities.glucose > 140 ? 'abnormal' : 'normal';
    const flag = entities.glucose > 140 ? 'Hyperglycemia' : entities.glucose < 70 ? 'Hypoglycemia' : 'Normal';
    table.push({ analyte: 'Blood Glucose', value: `${entities.glucose} mg/dL`, normalRange: '70 – 99 mg/dL', status, flag });
    if (status !== 'normal') findings.push(`${flag} (${entities.glucose} mg/dL)`);
  }

  // Vitals
  if (entities.sbp !== undefined && entities.dbp !== undefined) {
    const sbpCrit = entities.sbp >= 180 || entities.sbp < 90;
    const sbpAbn = entities.sbp >= 130 || entities.sbp < 100 || entities.dbp >= 80;
    const status = sbpCrit ? 'critical' : sbpAbn ? 'abnormal' : 'normal';
    const flag = entities.sbp >= 140 || entities.dbp >= 90 ? 'Hypertension' : entities.sbp < 90 ? 'Hypotension' : 'Normal';
    table.push({ analyte: 'Blood Pressure (BP)', value: `${entities.sbp}/${entities.dbp} mmHg`, normalRange: '90–120 / 60–80 mmHg', status, flag });
    if (status !== 'normal') findings.push(`${flag} (${entities.sbp}/${entities.dbp} mmHg)`);
  }

  if (entities.hr !== undefined) {
    const status = entities.hr > 120 || entities.hr < 50 ? 'critical' : entities.hr > 100 || entities.hr < 60 ? 'abnormal' : 'normal';
    const flag = entities.hr > 100 ? 'Tachycardia' : entities.hr < 60 ? 'Bradycardia' : 'Normal';
    table.push({ analyte: 'Heart Rate (HR)', value: `${entities.hr} bpm`, normalRange: '60 – 100 bpm', status, flag });
    if (status !== 'normal') findings.push(`${flag} (${entities.hr} bpm)`);
  }

  if (entities.rr !== undefined) {
    const status = entities.rr >= 30 ? 'critical' : entities.rr > 20 || entities.rr < 12 ? 'abnormal' : 'normal';
    const flag = entities.rr > 20 ? 'Tachypnea' : 'Normal';
    table.push({ analyte: 'Respiratory Rate (RR)', value: `${entities.rr} /min`, normalRange: '12 – 20 /min', status, flag });
    if (status !== 'normal') findings.push(`${flag} (${entities.rr}/min)`);
  }

  if (entities.tempC !== undefined) {
    const status = entities.tempC >= 38.5 || entities.tempC < 35.0 ? 'critical' : entities.tempC >= 37.5 ? 'abnormal' : 'normal';
    const flag = entities.tempC >= 38.0 ? 'Fever / Pyrexia' : entities.tempC >= 37.5 ? 'Low-grade Fever' : entities.tempC < 36.0 ? 'Hypothermia' : 'Normal';
    table.push({ analyte: 'Body Temperature', value: `${entities.tempC} °C`, normalRange: '36.5 – 37.5 °C', status, flag });
    if (status !== 'normal') findings.push(`${flag} (${entities.tempC} °C)`);
  }

  if (entities.spo2 !== undefined) {
    const status = entities.spo2 < 90 ? 'critical' : entities.spo2 < 95 ? 'abnormal' : 'normal';
    const flag = entities.spo2 < 90 ? 'Severe Hypoxemia' : entities.spo2 < 95 ? 'Hypoxemia' : 'Normal';
    table.push({ analyte: 'Oxygen Saturation (SpO₂)', value: `${entities.spo2}%`, normalRange: '95 – 100%', status, flag });
    if (status !== 'normal') findings.push(`${flag} (${entities.spo2}%)`);
  }

  // Hematology & Coagulation
  if (entities.platelets !== undefined) {
    const status = entities.platelets < 50 ? 'critical' : entities.platelets < 150 ? 'abnormal' : entities.platelets > 450 ? 'abnormal' : 'normal';
    const flag = entities.platelets < 100 ? 'Thrombocytopenia' : entities.platelets < 150 ? 'Mild Thrombocytopenia' : entities.platelets > 450 ? 'Thrombocytosis' : 'Normal';
    table.push({ analyte: 'Platelet Count', value: `${entities.platelets}k /µL`, normalRange: '150 – 450k /µL', status, flag });
    if (status !== 'normal') findings.push(`${flag} (${entities.platelets}k /µL)`);
  }

  // Liver & Proteins
  if (entities.albumin !== undefined) {
    const status = entities.albumin < 2.5 ? 'critical' : entities.albumin < 3.5 ? 'abnormal' : 'normal';
    const flag = entities.albumin < 3.5 ? 'Hypoalbuminemia' : 'Normal';
    table.push({ analyte: 'Serum Albumin', value: `${entities.albumin} g/dL`, normalRange: '3.5 – 5.0 g/dL', status, flag });
    if (status !== 'normal') findings.push(`${flag} (${entities.albumin} g/dL)`);
  }

  if (entities.bilirubin !== undefined) {
    const status = entities.bilirubin > 3.0 ? 'critical' : entities.bilirubin > 1.2 ? 'abnormal' : 'normal';
    table.push({ analyte: 'Total Bilirubin', value: `${entities.bilirubin} mg/dL`, normalRange: '0.2 – 1.2 mg/dL', status, flag: status !== 'normal' ? 'Hyperbilirubinemia' : 'Normal' });
    if (status !== 'normal') findings.push(`Hyperbilirubinemia (${entities.bilirubin} mg/dL)`);
  }

  if (entities.inr !== undefined) {
    const status = entities.inr >= 2.0 ? 'critical' : entities.inr > 1.2 ? 'abnormal' : 'normal';
    table.push({ analyte: 'Coagulation INR', value: `${entities.inr}`, normalRange: '0.8 – 1.2', status, flag: status !== 'normal' ? 'Coagulopathy' : 'Normal' });
    if (status !== 'normal') findings.push(`Elevated INR (${entities.inr})`);
  }

  if (entities.ast !== undefined) {
    const status = entities.ast > 200 ? 'critical' : entities.ast > 40 ? 'abnormal' : 'normal';
    table.push({ analyte: 'AST (SGOT)', value: `${entities.ast} U/L`, normalRange: '10 – 40 U/L', status, flag: status !== 'normal' ? 'Elevated Transaminase' : 'Normal' });
  }

  if (entities.alt !== undefined) {
    const status = entities.alt > 200 ? 'critical' : entities.alt > 40 ? 'abnormal' : 'normal';
    table.push({ analyte: 'ALT (SGPT)', value: `${entities.alt} U/L`, normalRange: '10 – 40 U/L', status, flag: status !== 'normal' ? 'Elevated Transaminase' : 'Normal' });
  }

  // Burn & Biometry
  if (entities.tbsaPercent !== undefined) {
    table.push({ analyte: 'Burn TBSA', value: `${entities.tbsaPercent}%`, normalRange: '0%', status: 'critical', flag: 'Acute Thermal Injury' });
    findings.push(`Burn Surface Area: ${entities.tbsaPercent}% TBSA`);
  }

  if (entities.crlMm !== undefined) {
    table.push({ analyte: 'Ultrasound CRL', value: `${entities.crlMm} mm`, normalRange: 'Variable by GA', status: 'normal', flag: 'First Trimester Biometry' });
    findings.push(`Ultrasound CRL: ${entities.crlMm} mm`);
  }

  // Formulate conversational summary
  let summary = '';
  if (findings.length > 0) {
    summary = `I analyzed your patient data. Key clinical findings: **${findings.slice(0, 4).join(', ')}**${findings.length > 4 ? ` (+${findings.length - 4} more)` : ''}.`;
  } else {
    summary = 'I parsed your clinical note and extracted the available patient parameters.';
  }

  const recSummary = matchedCalculators.length > 0
    ? `I've mapped these parameters into **${matchedCalculators.length} hospital calculators**. Values have been pre-sorted into the formula inputs below for 1-click clinical execution:`
    : 'No hospital calculators directly matched all parameters, but values are preserved for reference.';

  return {
    summary,
    parameterTable: table,
    recommendationsSummary: recSummary,
  };
}

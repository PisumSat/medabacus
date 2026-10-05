export interface HcgInput {
  initialHcg: number; // mIU/mL
  repeatHcg: number;  // mIU/mL
  hoursBetween: number; // typically 48 hours
  ultrasoundFindings: 'empty_uterus' | 'adnexal_mass' | 'gestational_sac_seen' | 'no_ultrasound';
}

export interface HcgResult {
  percentChange48h: number;
  doublingTimeHours?: number;
  halfLifeHours?: number;
  category: 'Normal IUP Rise' | 'Subnormal Rise (High Suspicion for Ectopic)' | 'Plateau (High Suspicion for Ectopic)' | 'Failing / Resolving PUL' | 'Exceeds Discriminatory Zone';
  interpretation: string;
  acogGuidance: string;
  recommendedAction: string;
  noteSnippet: string;
}

export function calculateHcgKinetics(input: HcgInput): HcgResult {
  const h1 = input.initialHcg;
  const h2 = input.repeatHcg;
  const dt = Math.max(1, input.hoursBetween);

  // Calculate exponential rate constant k: h2 = h1 * exp(k * dt)
  const k = Math.log(h2 / h1) / dt;
  // Normalized 48-hour percentage change
  const ratio48h = Math.exp(k * 48);
  const percentChange48h = Math.round((ratio48h - 1) * 100);

  let doublingTimeHours: number | undefined;
  let halfLifeHours: number | undefined;

  if (k > 0) {
    doublingTimeHours = Math.round((Math.LN2 / k) * 10) / 10;
  } else if (k < 0) {
    halfLifeHours = Math.round((-Math.LN2 / k) * 10) / 10;
  }

  // ACOG Practice Bulletin 193 discriminatory zone
  const DISCRIMINATORY_ZONE = 3500; // mIU/mL
  const isAboveDiscriminatoryZone = h2 >= DISCRIMINATORY_ZONE;

  // Minimum expected 48-hr rise based on initial hCG
  let minRiseThreshold = 35; // %
  if (h1 < 1500) minRiseThreshold = 49;
  else if (h1 <= 3000) minRiseThreshold = 40;
  else minRiseThreshold = 33;

  let category: HcgResult['category'];
  let interpretation = '';
  let acogGuidance = '';
  let recommendedAction = '';

  if (isAboveDiscriminatoryZone && input.ultrasoundFindings === 'empty_uterus') {
    category = 'Exceeds Discriminatory Zone';
    interpretation = `Repeat hCG ${h2} mIU/mL exceeds the ACOG discriminatory threshold (${DISCRIMINATORY_ZONE} mIU/mL) with no intrauterine gestational sac visualized on TVUS.`;
    acogGuidance =
      'ACOG Practice Bulletin 193: An empty uterus on transvaginal ultrasound with serum beta-hCG >= 3,500 mIU/mL is strongly presumptive of an ectopic pregnancy in a hemodynamically stable patient.';
    recommendedAction =
      'Evaluate for ectopic pregnancy intervention: Methotrexate (MTX) candidate vs diagnostic uterine aspiration (curettage) vs diagnostic laparoscopy. Rule out ruptured ectopic immediately.';
  } else if (percentChange48h >= minRiseThreshold) {
    category = 'Normal IUP Rise';
    interpretation = `hCG rose by ${percentChange48h}% over 48h (doubling time: ${doublingTimeHours ?? 'N/A'} hrs). Meets or exceeds minimum expected rise of ${minRiseThreshold}% for viable intrauterine pregnancy.`;
    acogGuidance =
      'Serial rise is reassuring for a viable intrauterine pregnancy. If clinical symptoms (bleeding, pain) persist, follow with repeat transvaginal ultrasound once hCG approaches discriminatory zone (>=2000-3500 mIU/mL).';
    recommendedAction = 'Expectant management. Repeat TVUS when hCG expected to exceed 2,000-3,500 mIU/mL to confirm intrauterine gestational sac with yolk sac.';
  } else if (percentChange48h > 0 && percentChange48h < minRiseThreshold) {
    category = 'Subnormal Rise (High Suspicion for Ectopic)';
    interpretation = `hCG rose by only ${percentChange48h}% over 48h, which is subnormal (expected minimum: ${minRiseThreshold}%).`;
    acogGuidance =
      'An abnormal slow rise is characteristic of ectopic pregnancy (~60% of ectopics exhibit subnormal rise, while ~20% mimic normal rise and ~20% mimic miscarriage).';
    recommendedAction =
      'Close surveillance. Perform urgent TVUS to evaluate adnexa and peritoneal free fluid. If patient is symptomatic with pelvic pain or peritoneal signs, emergency surgical exploration is indicated.';
  } else if (percentChange48h <= 0 && percentChange48h >= -20) {
    category = 'Plateau (High Suspicion for Ectopic)';
    interpretation = `hCG plateaued (${percentChange48h}% change over 48h). Failure to clear trophoblastic tissue.`;
    acogGuidance =
      'A plateauing hCG level (<20% decline or minimal change) has a very high correlation with ectopic pregnancy or non-viable retained trophoblast.';
    recommendedAction =
      'High suspicion for ectopic pregnancy. Consider Methotrexate therapy (single-dose 50 mg/m2 or 1 mg/kg) if eligible, or uterine aspiration to rule out decidua vs chorionic villi.';
  } else {
    // Drop > 20%
    category = 'Failing / Resolving PUL';
    const isRapidDrop = percentChange48h <= -35;
    interpretation = `hCG declined by ${Math.abs(percentChange48h)}% over 48h (half-life: ${halfLifeHours ?? 'N/A'} hrs). Consistent with a spontaneously resolving non-viable pregnancy.`;
    acogGuidance = isRapidDrop
      ? 'A decline of >=35-50% over 48 hours is consistent with spontaneously resolving pregnancy of unknown location (PUL) or complete abortion.'
      : 'Decline is slower than typical complete abortion. Monitor weekly until hCG is non-detectable to rule out persistent ectopic pregnancy.';
    recommendedAction =
      'Follow serial serum hCG weekly until undetectable (<5 mIU/mL). Counsel patient on ectopic precautions (seek immediate ER care for sudden pelvic pain, shoulder pain, syncope).';
  }

  const noteSnippet = `SERUM BETA-HCG KINETICS & PUL ASSESSMENT:
- Initial hCG: ${h1} mIU/mL | Repeat hCG: ${h2} mIU/mL (interval: ${dt}h)
- 48-Hour Rate: ${percentChange48h >= 0 ? '+' : ''}${percentChange48h}%${doublingTimeHours ? ` (Doubling: ${doublingTimeHours}h)` : ''}${halfLifeHours ? ` (Half-life: ${halfLifeHours}h)` : ''}
- Assessment: ${category}
- TVUS Status: ${input.ultrasoundFindings.replace(/_/g, ' ')}
Clinical Plan: ${recommendedAction}`;

  return {
    percentChange48h,
    doublingTimeHours,
    halfLifeHours,
    category,
    interpretation,
    acogGuidance,
    recommendedAction,
    noteSnippet,
  };
}

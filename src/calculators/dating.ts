export interface DatingResult {
  eddLmp?: Date;
  eddUs?: Date;
  eddIvf?: Date;
  finalEdd: Date;
  gaToday: { weeks: number; days: number; totalDays: number };
  datingMethod: 'LMP' | 'Ultrasound' | 'IVF/ART';
  discrepancyDays?: number;
  acogDiscrepancyRuleApplied?: boolean;
  explanation: string;
  milestones: {
    week: number;
    title: string;
    description: string;
    date: Date;
  }[];
}

export function calculateLmpEdd(lmpDate: Date, cycleLength = 28): Date {
  const edd = new Date(lmpDate.getTime());
  const cycleAdjustment = cycleLength - 28;
  edd.setDate(edd.getDate() + 280 + cycleAdjustment);
  return edd;
}

export function calculateIvfEdd(transferDate: Date, embryoType: 'day3' | 'day5' | 'day6' | 'iui'): { edd: Date; equivalentLmp: Date } {
  const equivalentLmp = new Date(transferDate.getTime());
  let daysToSubtract = 19; // default Day 5 blastocyst
  if (embryoType === 'day3') daysToSubtract = 17;
  else if (embryoType === 'day5') daysToSubtract = 19;
  else if (embryoType === 'day6') daysToSubtract = 20;
  else if (embryoType === 'iui') daysToSubtract = 14;

  equivalentLmp.setDate(equivalentLmp.getDate() - daysToSubtract);
  const edd = calculateLmpEdd(equivalentLmp, 28);
  return { edd, equivalentLmp };
}

export function crlToGestationalAgeDays(crlMm: number): number {
  // Robinson & Fleming formula: GA (days) = 8.052 * sqrt(CRL mm) + 23.73
  if (crlMm <= 0) return 0;
  return Math.round(8.052 * Math.sqrt(crlMm) + 23.73);
}

export function calculateUsEdd(scanDate: Date, usGaWeeks: number, usGaDays: number): Date {
  const totalUsGaDays = usGaWeeks * 7 + usGaDays;
  const daysRemaining = 280 - totalUsGaDays;
  const edd = new Date(scanDate.getTime());
  edd.setDate(edd.getDate() + daysRemaining);
  return edd;
}

export function evaluateACOG700Dating(params: {
  lmpDate?: Date;
  cycleLength?: number;
  scanDate?: Date;
  usGaWeeks?: number;
  usGaDays?: number;
  ivfTransferDate?: Date;
  ivfEmbryoType?: 'day3' | 'day5' | 'day6' | 'iui';
  currentDate?: Date;
}): DatingResult {
  const today = params.currentDate ? new Date(params.currentDate.getTime()) : new Date();
  today.setHours(0, 0, 0, 0);

  // Case 1: IVF / ART (Highest accuracy, gold standard dating)
  if (params.ivfTransferDate) {
    const { edd, equivalentLmp } = calculateIvfEdd(params.ivfTransferDate, params.ivfEmbryoType || 'day5');
    const diffMs = today.getTime() - equivalentLmp.getTime();
    const totalDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;

    return {
      eddIvf: edd,
      finalEdd: edd,
      gaToday: { weeks, days, totalDays },
      datingMethod: 'IVF/ART',
      explanation: 'Assisted Reproductive Technology (ART) provides the most precise gestational dating. EDD is calculated directly from embryo transfer or retrieval date.',
      milestones: generateMilestones(edd),
    };
  }

  // Case 2: LMP only (No US available)
  if (params.lmpDate && (!params.scanDate || params.usGaWeeks === undefined)) {
    const eddLmp = calculateLmpEdd(params.lmpDate, params.cycleLength || 28);
    const diffMs = today.getTime() - params.lmpDate.getTime();
    const totalDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;

    return {
      eddLmp,
      finalEdd: eddLmp,
      gaToday: { weeks, days, totalDays },
      datingMethod: 'LMP',
      explanation: 'Dating based on Last Menstrual Period (Naegele’s rule adjusted for cycle length). Recommend first-trimester ultrasound confirmation.',
      milestones: generateMilestones(eddLmp),
    };
  }

  // Case 3: Ultrasound only (Unknown LMP)
  if (!params.lmpDate && params.scanDate && params.usGaWeeks !== undefined) {
    const usEdd = calculateUsEdd(params.scanDate, params.usGaWeeks, params.usGaDays || 0);
    const totalUsDaysAtScan = params.usGaWeeks * 7 + (params.usGaDays || 0);
    const daysSinceScan = Math.floor((today.getTime() - params.scanDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = Math.max(0, totalUsDaysAtScan + daysSinceScan);
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;

    return {
      eddUs: usEdd,
      finalEdd: usEdd,
      gaToday: { weeks, days, totalDays },
      datingMethod: 'Ultrasound',
      explanation: 'Dating determined solely by ultrasound biometry because LMP was unknown or unreliable.',
      milestones: generateMilestones(usEdd),
    };
  }

  // Case 4: Both LMP and Ultrasound available -> Apply ACOG Committee Opinion No. 700
  if (params.lmpDate && params.scanDate && params.usGaWeeks !== undefined) {
    const eddLmp = calculateLmpEdd(params.lmpDate, params.cycleLength || 28);
    const eddUs = calculateUsEdd(params.scanDate, params.usGaWeeks, params.usGaDays || 0);

    // Gestational age by LMP on the day of the scan
    const daysFromLmpToScan = Math.floor((params.scanDate.getTime() - params.lmpDate.getTime()) / (1000 * 60 * 60 * 24));
    const usDaysAtScan = params.usGaWeeks * 7 + (params.usGaDays || 0);
    const discrepancy = Math.abs(daysFromLmpToScan - usDaysAtScan);

    // ACOG 700 threshold rules based on ultrasound GA
    let threshold = 5;
    let periodLabel = '<= 8 6/7 weeks (CRL)';

    if (usDaysAtScan <= 62) {
      threshold = 5;
      periodLabel = '<= 8 6/7 weeks (CRL)';
    } else if (usDaysAtScan <= 97) {
      threshold = 7;
      periodLabel = '9 0/7 to 13 6/7 weeks (CRL)';
    } else if (usDaysAtScan <= 111) {
      threshold = 7;
      periodLabel = '14 0/7 to 15 6/7 weeks';
    } else if (usDaysAtScan <= 153) {
      threshold = 10;
      periodLabel = '16 0/7 to 21 6/7 weeks';
    } else if (usDaysAtScan <= 195) {
      threshold = 14;
      periodLabel = '22 0/7 to 27 6/7 weeks';
    } else {
      threshold = 21;
      periodLabel = '>= 28 0/7 weeks (3rd trimester)';
    }

    const redate = discrepancy > threshold;
    const finalEdd = redate ? eddUs : eddLmp;
    const datingMethod = redate ? 'Ultrasound' : 'LMP';

    // Calculate GA today based on final EDD (280 days total)
    const daysUntilEdd = Math.floor((finalEdd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const totalDaysToday = Math.max(0, 280 - daysUntilEdd);
    const weeks = Math.floor(totalDaysToday / 7);
    const days = totalDaysToday % 7;

    const explanation = redate
      ? `ACOG CO 700: Discrepancy of ${discrepancy} days exceeds the ${threshold}-day allowable margin for ${periodLabel}. Pregnancy is REDATED to the Ultrasound EDD (${formatDateShort(eddUs)}).`
      : `ACOG CO 700: Discrepancy of ${discrepancy} days is within the allowable ${threshold}-day margin for ${periodLabel}. Clinical EDD is maintained by LMP (${formatDateShort(eddLmp)}).`;

    return {
      eddLmp,
      eddUs,
      finalEdd,
      gaToday: { weeks, days, totalDays: totalDaysToday },
      datingMethod,
      discrepancyDays: discrepancy,
      acogDiscrepancyRuleApplied: redate,
      explanation,
      milestones: generateMilestones(finalEdd),
    };
  }

  const fallbackEdd = new Date();
  fallbackEdd.setDate(fallbackEdd.getDate() + 280);
  return {
    finalEdd: fallbackEdd,
    gaToday: { weeks: 0, days: 0, totalDays: 0 },
    datingMethod: 'LMP',
    explanation: 'Please enter valid dates.',
    milestones: generateMilestones(fallbackEdd),
  };
}

export function generateMilestones(edd: Date) {
  const milestoneWeeks = [
    { week: 10, title: 'Cell-Free DNA / NIPT', description: 'Early aneuploidy screening window opens' },
    { week: 12, title: 'Nuchal Translucency (NT)', description: 'First trimester combined screening (11w0d - 13w6d)' },
    { week: 20, title: 'Anatomy Ultrasound', description: 'Fetal anatomical survey & cervical length check' },
    { week: 24, title: 'Fetal Viability Threshold', description: 'Standard threshold for potential neonatal resuscitation' },
    { week: 28, title: '3rd Trimester Labs & RhIG', description: 'GDM 50g screening, CBC, Anti-D IgG (if Rh-negative)' },
    { week: 36, title: 'GBS Culture & Presentation', description: 'Rectovaginal Group B Streptococcus screening' },
    { week: 37, title: 'Early Term', description: 'Infant no longer considered preterm' },
    { week: 39, title: 'Full Term / Elective Delivery', description: 'ARRIVE trial induction window / scheduled cesarean' },
    { week: 40, title: 'Estimated Due Date (EDD)', description: 'Target 40-week term completion' },
    { week: 41, title: 'Late Term / Post-Term', description: 'Induction recommended to reduce perinatal morbidity' },
  ];

  return milestoneWeeks.map((m) => {
    const daysBeforeEdd = (40 - m.week) * 7;
    const mDate = new Date(edd.getTime());
    mDate.setDate(mDate.getDate() - daysBeforeEdd);
    return {
      ...m,
      date: mDate,
    };
  });
}

export function formatDateShort(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

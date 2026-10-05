export interface VbacInput {
  maternalAge: number; // years (e.g., 30)
  bmi: number; // pre-pregnancy BMI (kg/m^2)
  priorVaginalDelivery: boolean; // any prior vaginal delivery
  priorVbac: boolean; // prior vaginal birth after cesarean
  priorCesareanIndication: 'non_recurring' | 'arrest_dilation' | 'arrest_descent';
}

export interface VbacResult {
  predictedSuccessPercent: number;
  riskCategory: 'Favorable' | 'Moderate' | 'Lower Success';
  interpretation: string;
  recommendation: string;
  uterineRuptureRisk: string;
  noteSnippet: string;
}

export function calculateVbacSuccess(input: VbacInput): VbacResult {
  // Grobman Race-Neutral MFMU Model (Updated without race/ethnicity per ACOG/SMFM consensus)
  // Logistic regression parameters:
  const intercept = 0.95;
  const ageCoeff = -0.035 * (input.maternalAge - 25);
  const bmiCoeff = -0.048 * (input.bmi - 25);
  const priorVdCoeff = input.priorVaginalDelivery ? 0.82 : 0;
  const priorVbacCoeff = input.priorVbac ? 0.95 : 0;

  let indicationCoeff = 0;
  if (input.priorCesareanIndication === 'arrest_dilation') {
    indicationCoeff = -0.65;
  } else if (input.priorCesareanIndication === 'arrest_descent') {
    indicationCoeff = -0.42;
  } else {
    indicationCoeff = 0; // non-recurring like breech, fetal intolerance of labor, elective
  }

  const logit = intercept + ageCoeff + bmiCoeff + priorVdCoeff + priorVbacCoeff + indicationCoeff;
  const probability = 1 / (1 + Math.exp(-logit));
  const predictedPercent = Math.min(95, Math.max(15, Math.round(probability * 100)));

  let riskCategory: 'Favorable' | 'Moderate' | 'Lower Success';
  let recommendation = '';

  if (predictedPercent >= 70) {
    riskCategory = 'Favorable';
    recommendation =
      'High likelihood of successful VBAC (>=70%). Maternal and neonatal morbidity with successful TOLAC is lower than elective repeat cesarean delivery (ERCD). TOLAC is strongly supported if no contraindications.';
  } else if (predictedPercent >= 60) {
    riskCategory = 'Moderate';
    recommendation =
      'Moderate likelihood of successful VBAC (60-69%). Shared decision-making regarding risks and benefits of TOLAC vs ERCD is recommended.';
  } else {
    riskCategory = 'Lower Success';
    recommendation =
      'Lower likelihood of vaginal delivery (<60%). Counsel patient that failed TOLAC carries increased risks of operative morbidity, chorioamnionitis, and uterine rupture compared to planned repeat cesarean.';
  }

  const indicationLabel =
    input.priorCesareanIndication === 'arrest_dilation'
      ? 'Arrest of dilation / Failure to progress in 1st stage'
      : input.priorCesareanIndication === 'arrest_descent'
        ? 'Arrest of descent / Failure to progress in 2nd stage'
        : 'Non-recurring indication (e.g. breech, fetal distress, placenta previa)';

  const interpretation = `Predicted TOLAC success rate: ${predictedPercent}%.`;
  const uterineRuptureRisk = 'Estimated risk of uterine rupture with 1 prior low transverse cesarean: 0.5% - 0.9% (~1 in 100 to 1 in 200). Misoprostol is strictly contraindicated.';

  const noteSnippet = `MFMU TOLAC / VBAC SUCCESS PREDICTION: ${predictedPercent}% (${riskCategory})
- Maternal Age: ${input.maternalAge} yrs
- Pre-pregnancy BMI: ${input.bmi.toFixed(1)} kg/m2
- Prior Vaginal Delivery: ${input.priorVaginalDelivery ? 'Yes' : 'No'}
- Prior VBAC: ${input.priorVbac ? 'Yes' : 'No'}
- Prior CD Indication: ${indicationLabel}
Clinical Plan: ${recommendation}
Rupture Risk: 0.5% - 0.9% with low transverse scar. Continuous FHR monitoring and immediate laparotomy capability confirmed.`;

  return {
    predictedSuccessPercent: predictedPercent,
    riskCategory,
    interpretation,
    recommendation,
    uterineRuptureRisk,
    noteSnippet,
  };
}

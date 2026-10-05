export type EhrFormatType = 'soap' | 'epic' | 'cerner' | 'sbar' | 'consult';

export interface EhrNoteOptions {
  patientTag?: string;
  attendingName?: string;
  residentName?: string;
  toolTitle?: string;
  customImpression?: string;
}

/**
 * Transforms any standard clinical note snippet into an EHR-specific formatted document.
 */
export function formatEhrNote(
  rawNote: string,
  format: EhrFormatType = 'soap',
  options: EhrNoteOptions = {}
): string {
  const patient = options.patientTag?.trim() || 'Patient Bed / Unspecified';
  const attending = options.attendingName?.trim() || 'Dr. Attending of Record, MD';
  const resident = options.residentName?.trim() || 'MEDABACUS Clinical User, MD';
  const tool = options.toolTitle?.trim() || 'Clinical Risk Evaluation';
  const timestamp = new Date().toLocaleString();

  // Clean lines from raw note
  const rawLines = rawNote
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith('===') && !l.startsWith('---') && !l.toLowerCase().startsWith('patient:'));

  const rawTextBody = rawLines.join('\n');

  switch (format) {
    case 'epic':
      return [
        `/* === EPIC SMARTPHRASE (.MEDABACUS_${tool.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 14)}) === */`,
        `PATIENT: @NAME@ (@AGE@/@SEX@) | MRN: @MRN@ | BED: ${patient}`,
        `DATE/TIME: @NOW@`,
        ``,
        `.VITALS: @VITALS@`,
        `.PERTINENT_LABS: @LABS@`,
        ``,
        `CLINICAL ASSESSMENT (${tool}):`,
        rawTextBody,
        ``,
        options.customImpression ? `CLINICAL IMPRESSION: ${options.customImpression}` : '',
        `PLAN & ACTIONS:`,
        `- Results reviewed at bedside and incorporated into active order set.`,
        `- Serial monitoring indicated per guideline thresholds.`,
        ``,
        `PROVIDER SIGN-OFF:`,
        `@ME@ (${resident})`,
        `SUPERVISING ATTENDING: ${attending}`,
      ]
        .filter(Boolean)
        .join('\n');

    case 'cerner':
      return [
        `*** CERNER POWERCHART CLINICAL NOTE ***`,
        `Location/Bed: ${patient}`,
        `Evaluation Protocol: ${tool}`,
        `Service Date: ${timestamp}`,
        ``,
        `[OBJECTIVE & SCORING PARAMETERS]`,
        rawTextBody,
        ``,
        `[ASSESSMENT & CLINICAL ACTION]`,
        options.customImpression
          ? `Impression: ${options.customImpression}`
          : `Patient evaluated with evidence-based decision engine (${tool}). Risk stratification documented above.`,
        `- Disposition: Appropriate level of care confirmed.`,
        `- Follow-up: Repeat evaluation as clinically indicated.`,
        ``,
        `Electronically Verified by: ${resident}`,
        `Attending of Record: ${attending}`,
      ]
        .filter(Boolean)
        .join('\n');

    case 'sbar':
      return [
        `*** SBAR CLINICAL HANDOFF / SIGN-OUT ***`,
        `S (Situation): Bed: ${patient} | Protocol: ${tool}`,
        `B (Background): Patient admitted to floor; bedside decision protocol executed at ${timestamp}.`,
        `A (Assessment):`,
        rawLines.map((l) => `  • ${l}`).join('\n'),
        options.customImpression ? `  • Key Note: ${options.customImpression}` : '',
        `R (Recommendation): Continue clinical monitoring, verify medication dosing and follow-up serial lab draws.`,
        `Handoff Signer: ${resident}`,
      ]
        .filter(Boolean)
        .join('\n');

    case 'consult':
      return [
        `*** SPECIALTY CONSULTANT IMPRESSION & RECOMMENDATIONS ***`,
        `Patient/Location: ${patient}`,
        `Consultation Focus: ${tool}`,
        `Date & Time: ${timestamp}`,
        ``,
        `1. EVIDENCE-BASED ASSESSMENT:`,
        rawLines.map((l) => `   - ${l}`).join('\n'),
        options.customImpression ? `   - Clinical Summary: ${options.customImpression}` : '',
        ``,
        `2. RECOMMENDATIONS:`,
        `   a. Implement management pathway according to guideline tier above.`,
        `   b. Re-evaluate if hemodynamics, renal parameters, or clinical status change.`,
        `   c. Primary service may contact fellow/attending on call for acute questions.`,
        ``,
        `Consultant: ${resident}`,
        `Attending: ${attending}`,
      ]
        .filter(Boolean)
        .join('\n');

    case 'soap':
    default:
      return [
        `=== MEDABACUS CLINICAL SOAP NOTE ===`,
        `PATIENT / LOCATION: ${patient}`,
        `DATE & TIME: ${timestamp}`,
        `EVALUATION SUITE: ${tool}`,
        ``,
        `S (SUBJECTIVE):`,
        `Patient active on service, evaluated for ${tool}. Clinical history reviewed.`,
        ``,
        `O (OBJECTIVE & MEASUREMENTS):`,
        rawTextBody,
        ``,
        `A (ASSESSMENT & RISK STRATIFICATION):`,
        options.customImpression
          ? options.customImpression
          : `Evidence-based risk calculation completed (${tool}). Score and risk category as quantified in objective section.`,
        ``,
        `P (PLAN & INTERVENTIONS):`,
        `- Management tailored to calculated guideline category.`,
        `- Continue standard monitoring protocol and verify vital signs.`,
        `- Re-calculate if clinical parameters or labs shift.`,
        ``,
        `Signer: ${resident}`,
        `Attending: ${attending}`,
      ]
        .filter(Boolean)
        .join('\n');
  }
}

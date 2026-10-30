import { IntakeProfile, MatchResult, Program } from './types';

export function getMatchResults(programs: Program[], intake: IntakeProfile): MatchResult[] {
  const isDallasPilot = intake.city.trim().toLowerCase() === 'dallas' && (!intake.zipCode || /^75\d{3}$/.test(intake.zipCode.trim()));
  return programs.map((program) => {
    let score = 22;
    const matchedReasons: string[] = [];
    const unknownReasons: string[] = [];
    if (!isDallasPilot) return { program, score: 0, matchedReasons, unknownReasons: ['HomeHearts currently supports Dallas ZIP codes first'] };
    if (program.coverage.toLowerCase().includes('dallas')) { score += 24; matchedReasons.push('Serves your Dallas-area ZIP code'); }
    else unknownReasons.push('Confirm service area before applying');
    if (intake.issue && program.matchableIssues.includes(intake.issue)) {
      score += 34;
      matchedReasons.push(`Addresses ${issueLabel(intake.issue).toLowerCase()}`);
      const specificity = (program.category === 'rent' && ['rent_increase', 'eviction'].includes(intake.issue)) || (program.category === 'legal' && ['legal', 'eviction'].includes(intake.issue)) || (program.category === 'shelter' && ['homeless', 'shelter', 'domestic_violence'].includes(intake.issue)) || (program.category === 'utilities' && intake.issue === 'utilities');
      if (specificity) { score += 8; matchedReasons.push('Specializes in this kind of support'); }
    }
    else score -= 12;
    if (intake.urgency === 'today' && ['shelter', 'homeless', 'eviction'].includes(intake.issue ?? '') && program.category === 'shelter') { score += 14; matchedReasons.push('Routes urgent housing crises quickly'); }
    if (program.status === 'closed') score = Math.min(score, 25);
    if (program.status === 'waitlist') score = Math.min(score, 48);
    return { program, score: Math.max(18, Math.min(98, score)), matchedReasons, unknownReasons };
  }).sort((a, b) => b.score - a.score);
}

export function issueLabel(issue: IntakeProfile['issue']): string {
  const labels: Record<string, string> = { rent_increase: 'a rent increase', eviction: 'an eviction notice', utilities: 'utility bills', homeless: 'homelessness', shelter: 'an immediate shelter need', moving: 'moving costs', legal: 'a housing legal issue', domestic_violence: 'an unsafe housing situation', disability: 'a disability-related housing need', veteran: 'a veteran housing need', youth: 'a youth housing need', general: 'a housing concern' };
  return issue ? labels[issue] : 'your housing concern';
}


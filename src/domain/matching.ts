import { getConcerns } from './intake';
import { NATIONAL_211 } from '../data/programs';
import { getZipArea, isZipCode, servesLocation } from './serviceArea';
import { IntakeProfile, IssueType, MatchResult, Program, ProgramStatus, ServiceType } from './types';

const ISSUE_SERVICES: Record<IssueType, ServiceType[]> = {
  rent_increase: ['rent', 'legal', 'housing'],
  eviction: ['legal', 'rent'],
  utilities: ['utilities'],
  homeless: ['shelter', 'housing'],
  shelter: ['shelter'],
  moving: ['moving', 'housing'],
  legal: ['legal'],
  domestic_violence: ['safety'],
  disability: ['accessible', 'housing'],
  veteran: ['veteran'],
  youth: ['youth', 'shelter'],
  general: ['rent', 'housing', 'utilities', 'legal', 'shelter'],
};

const SERVICE_REASONS: Record<ServiceType, string> = {
  rent: 'Helps with rent payments',
  utilities: 'Helps with utility bills',
  shelter: 'Connects you with shelter options',
  legal: 'Helps with tenant and housing legal issues',
  housing: 'Provides longer-term rental assistance',
  moving: 'Helps with moving or deposit costs',
  general: 'Helps you find local services',
  safety: 'Offers safety planning and referrals',
  accessible: 'Helps you find accessible housing resources',
  veteran: 'Connects Veterans with housing resources',
  youth: 'Offers housing referrals for young people',
};

export function getLocationQuestions(programs: Program[], intake: IntakeProfile) {
  const location = getZipArea(intake.zipCode);
  const services = getConcerns(intake).flatMap((issue) => ISSUE_SERVICES[issue]);
  const relevantAreas = programs
    .filter((program) => program.serviceTypes.some((service) => services.includes(service)))
    .map((program) => program.serviceArea);
  return {
    counties: location.counties.length > 1 && relevantAreas.some((area) =>
      area.kind === 'counties' &&
      location.counties.some((county) => county !== 'other' && area.counties.includes(county)) &&
      location.counties.some((county) => county === 'other' || !area.counties.includes(county)),
    ) ? location.counties : [],
    askDallasCity: location.dallasCity === 'partial' && relevantAreas.some((area) => area.kind === 'dallas_city'),
  };
}

export function getProgramAvailability(program: Program, now = new Date()) {
  const daysSinceCheck = (now.getTime() - Date.parse(program.verifiedAt)) / 86_400_000;
  const reopeningPassed = Boolean(program.reopening && now.getTime() >= Date.parse(program.reopening.at));
  const deadlinePassed = Boolean(program.deadline && now.getTime() >= Date.parse(program.deadline.at));
  // An old deadline must not close a newer announced intake window. Once that
  // reopening arrives, ask the provider rather than assuming intake reopened.
  const newerReopeningPassed = reopeningPassed && program.reopening && program.deadline &&
    Date.parse(program.reopening.at) > Date.parse(program.deadline.at);

  let status = program.status;
  if (deadlinePassed && !newerReopeningPassed) status = 'closed';
  else if ((status === 'open' && daysSinceCheck >= 7) ||
    (status === 'closed' && (reopeningPassed || daysSinceCheck >= 30))) status = 'call_to_verify';

  const labels: Record<ProgramStatus, string> = {
    open: 'Accepting intake',
    closed: 'Intake closed',
    waitlist: 'Lottery / waitlist',
    referral_required: 'Referral or navigation',
    call_to_verify: 'Confirm intake',
    unknown: 'Intake status unknown',
  };

  // Keep the provider's published label verbatim, including its timezone. Do
  // not reformat an instant into the device's timezone and change the deadline.
  const deadline = program.deadline
    ? `${deadlinePassed ? 'Published deadline passed' : 'Published deadline'}: ${program.deadline.label}`
    : 'Deadline not published — ask provider.';
  const reopening = reopeningPassed ? 'The announced reopening has passed. Confirm current intake.'
    : program.reopening ? 'Announced reopening: ' + program.reopening.label : undefined;

  return {
    status,
    label: labels[status],
    deadline,
    deadlinePassed,
    reopening,
    reopeningPassed,
    timing: [deadline, reopening].filter(Boolean).join(' '),
  };
}

export function getMatchResults(programs: Program[], intake: IntakeProfile, now = new Date(), national211: Program = NATIONAL_211) {
  const results: { actionable: MatchResult[]; later: MatchResult[]; referral?: Program } = { actionable: [], later: [] };
  const concerns = getConcerns(intake);
  if (!isZipCode(intake.zipCode) || !concerns.length || !intake.urgency) return results;

  const primary = intake.issue && concerns.includes(intake.issue) ? intake.issue : concerns[0];
  const ordered = [primary, ...concerns.filter((issue) => issue !== primary)];
  const timeSensitive = intake.urgency === 'today' || intake.urgency === 'within_3_days' || concerns.includes('shelter');
  const needsHelpSoon = timeSensitive || intake.urgency === 'within_7_days';
  const seen = new Set<string>();
  const ranked = programs.flatMap((program) => {
    if (seen.has(program.id) || !servesLocation(program.serviceArea, intake)) return [];
    const matched = ordered.flatMap((concern) => {
      const service = ISSUE_SERVICES[concern].find((option) => program.serviceTypes.includes(option));
      return service ? [{ concern, service }] : [];
    });
    if (!matched.length) return [];
    seen.add(program.id);
    const { concern, service } = matched[0];
    const services = ISSUE_SERVICES[concern];

    const status = getProgramAvailability(program, now).status;
    const later = status === 'closed' || status === 'waitlist' || (needsHelpSoon && program.kind === 'long_term');
    const score = (concern === primary ? 100 : 0) + (services.length - services.indexOf(service)) * 3 +
      (status === 'open' ? 2 : 0) +
      (timeSensitive && program.immediate ? 3 : 0);

    return [{
      later, score,
      match: {
        program,
        matchedReasons: [...matched.map(({ concern, service }) => concerns.length === 1 ? SERVICE_REASONS[service] : `${issueLabel(concern)}: ${SERVICE_REASONS[service]}`), program.coverage],
        unknownReasons: program.eligibilityToConfirm ? [program.eligibilityToConfirm + ' to confirm'] : [],
      },
    }];
  }).sort((a, b) => b.score - a.score);

  for (const { later, match } of ranked) {
    (later ? results.later : results.actionable).push(match);
  }
  results.referral = programs.find((program) => program.id === 'texas-211' && servesLocation(program.serviceArea, intake)) ?? national211;
  return results;
}

export function issueLabel(issue: IntakeProfile['issue']): string {
  const labels: Record<IssueType, string> = { rent_increase: 'a rent increase', eviction: 'an eviction notice', utilities: 'utility bills', homeless: 'homelessness', shelter: 'an immediate shelter need', moving: 'moving costs', legal: 'a housing legal issue', domestic_violence: 'an unsafe housing situation', disability: 'a disability-related housing need', veteran: 'a veteran housing need', youth: 'a youth housing need', general: 'a housing concern' };
  return issue ? labels[issue] : 'your housing concern';
}

import { getConcerns, urgencyLabel } from './intake';
import { formatCurrency } from './cost';
import { getProgramAvailability, issueLabel } from './matching';
import { DOCUMENT_LABELS, IntakeProfile, Program } from './types';

export type CallScript = {
  /** What to say first: who you are calling about and your situation. */
  intro: string;
  /** Questions specific to this program, in the order to ask them. */
  questions: string[];
  /** The intro and numbered questions as one block of text, for copying. */
  fullText: string;
};

function joinList(items: string[]) {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

function buildIntro(program: Program, intake: IntakeProfile) {
  const about = program.provider && program.provider !== program.name ? `${program.name} with ${program.provider}` : program.name;
  let situation = 'looking for housing help';
  const concerns = getConcerns(intake);
  const primary = intake.issue && concerns.includes(intake.issue) ? intake.issue : concerns[0];
  if (primary) {
    const ordered = [primary, ...concerns.filter((concern) => concern !== primary)];
    situation = `facing ${joinList(ordered.map((concern) => issueLabel(concern) + (concern === 'rent_increase' && intake.rentIncreaseCents ? ` of ${formatCurrency(intake.rentIncreaseCents)} a month` : '')))}`;
  }
  const where = intake.zipCode ? ` near ZIP code ${intake.zipCode}` : '';
  const goal = program.kind === 'referral'
    ? 'I’d like to find out what help is available and who I should contact next.'
    : 'I’d like to understand whether I may qualify and what I should prepare.';
  return `Hi, I’m calling about ${about}. I’m ${situation}${where}. ${concerns.length > 1 ? `My primary concern is ${issueLabel(primary)}. ` : ''}${intake.urgency ? `My timeframe is: ${urgencyLabel(intake.urgency)}. ` : ''}${goal}`;
}

function availabilityQuestion(program: Program, availability: ReturnType<typeof getProgramAvailability>) {
  if (availability.deadlinePassed && program.deadline) {
    return `I saw a published application deadline of ${program.deadline.label}, which has passed. Are you accepting applications in a new window, or should I wait?`;
  }
  switch (availability.status) {
    case 'open':
      return program.deadline ? `I saw an application deadline of ${program.deadline.label}. Are you still accepting applications, and can I apply before then?` : 'Are you still accepting applications right now?';
    case 'closed':
      return program.reopening && !availability.reopeningPassed
        ? `Your website says intake is closed and is expected to reopen ${program.reopening.label}. Is that still the plan, and how do I apply when it opens?`
        : 'Your website says intake is closed. When might it reopen, and is there a waitlist or another option in the meantime?';
    case 'waitlist':
      return 'How does the waitlist or lottery work, and how do I get on it?';
    case 'referral_required':
      return 'Who can you refer me to for help with my situation, and how do I reach them?';
    default:
      return 'I couldn’t confirm online whether you’re taking new applications. Is intake open right now?';
  }
}

/**
 * Builds a call script from the selected program's catalog data and the user's
 * intake answers, so the questions match what the program published: its intake
 * status, what is still unconfirmed, the documents it lists, and whether it
 * publishes an amount.
 */
export function buildCallScript(program: Program, intake: IntakeProfile, now = new Date()): CallScript {
  const availability = getProgramAvailability(program, now);
  const questions = [availabilityQuestion(program, availability)];
  if (!program.deadline) {
    questions.push('I don’t have a published application deadline. Is there a cutoff date or an intake window I should know about?');
  } else if (!availability.deadlinePassed && availability.status !== 'open') {
    questions.push(`I saw an application deadline of ${program.deadline.label}. Does that date still apply, and when can I apply?`);
  }

  // A referral service points you to other providers, which set their own rules.
  if (program.eligibilityToConfirm) questions.push(`Can you tell me whether I qualify based on ${lowerFirst(program.eligibilityToConfirm)}?`);
  else if (program.kind !== 'referral') questions.push('What are the eligibility requirements, and do I meet them?');

  questions.push(program.requiredDocuments.length
    ? `Which of these do you need from me: ${joinList(program.requiredDocuments.map((kind) => DOCUMENT_LABELS[kind]))}? Is there anything else to bring?`
    : 'What documents should I have ready?');

  const amountUnpublished = /not published/i.test(program.assistance.amountLabel);
  const durationUnpublished = /not published/i.test(program.assistance.durationLabel);
  if (amountUnpublished) {
    questions.push(durationUnpublished
      ? 'Your website doesn’t say how much help is available or for how long. What could I receive?'
      : 'Your website doesn’t say how much help is available. How much could I receive?');
  }

  questions.push(program.kind === 'referral'
    ? 'What should I do next, and who should I follow up with?'
    : 'What happens after I apply, and when should I expect to hear back?');

  const intro = buildIntro(program, intake);
  const fullText = `${intro} Could you tell me: ${questions.map((question, index) => `${index + 1}) ${question}`).join(' ')}`;
  return { intro, questions, fullText };
}

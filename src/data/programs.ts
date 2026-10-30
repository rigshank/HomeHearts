import { Program } from '../domain/types';

const checked = '2026-10-29';

export const DALLAS_PROGRAMS: Program[] = [
  {
    id: 'city-dallas-social-services', name: 'City of Dallas Social Services', provider: 'City of Dallas Office of Community Care', category: 'rent',
    description: 'A municipal starting point for temporary financial hardship, rental and utility guidance, and referrals to programs that may fit your situation.', coverage: 'Dallas city residents',
    status: 'call_to_verify', statusLabel: 'Call to verify', sourceUrl: 'https://dallascityhall.com/departments/community-empowerment/Pages/socialservice.aspx', sourceLabel: 'City of Dallas official page', phone: '214-670-8416', verifiedAt: checked,
    verificationNote: 'The City page says program availability and application acceptance can change. Rental assistance is not always accepting applications.',
    eligibility: ['Live within Dallas city limits for city-funded assistance', 'Temporary financial hardship', 'Be ready to share household and income details'], matchableIssues: ['rent_increase', 'eviction', 'utilities', 'general'],
    assistance: { amountLabel: 'Varies by program', durationLabel: 'Varies by funding', methodLabel: 'Referral or provider intake' }, requiredDocuments: ['photo_id', 'lease_or_rent_notice', 'income_proof', 'rent_increase_notice'], tags: ['City limits', 'Rent help', 'Utilities'],
  },
  {
    id: 'dallas-county-welfare', name: 'Dallas County Welfare Assistance', provider: 'Dallas County Health and Human Services', category: 'rent',
    description: 'Short-term assistance and case guidance for qualifying Dallas County residents facing a financial crisis, including rent, mortgage, utilities, food, or transportation needs.', coverage: 'Dallas County residents',
    status: 'call_to_verify', statusLabel: 'Call to verify', sourceUrl: 'https://dallascounty.org/departments/dchhs/human-services/welfare-assist.php', sourceLabel: 'Dallas County official page', phone: '214-819-1800', verifiedAt: checked,
    verificationNote: 'Eligibility and appointment requirements must be confirmed with the county before relying on this option.',
    eligibility: ['Dallas County resident', 'Age 18 or older', 'Limited income and resources', 'May require disability or other qualifying circumstances'], matchableIssues: ['rent_increase', 'eviction', 'utilities', 'general'],
    assistance: { amountLabel: 'County determines amount', durationLabel: 'Short-term assistance', methodLabel: 'County assessment' }, requiredDocuments: ['photo_id', 'lease_or_rent_notice', 'income_proof'], tags: ['Dallas County', 'Rent help', 'Utilities'],
  },
  {
    id: 'housing-forward-crisis-line', name: 'Homeless Crisis Helpline', provider: 'Housing Forward / All Neighbors Coalition', category: 'shelter',
    description: 'A direct entry point for people experiencing homelessness or needing coordinated access to emergency shelter and rehousing resources.', coverage: 'Dallas and Collin County homelessness response system',
    status: 'referral_required', statusLabel: 'Referral required', sourceUrl: 'https://housingforwardntx.org/help-resources/', sourceLabel: 'Housing Forward official page', phone: '888-411-6802', verifiedAt: checked,
    verificationNote: 'Housing Forward says not every shelter is open every night; call the helpline for current routing.',
    eligibility: ['Currently unhoused, staying somewhere not meant for habitation, or fleeing domestic violence without another residence', 'Reside in Dallas or Collin County for coordinated access'], matchableIssues: ['homeless', 'shelter', 'eviction', 'domestic_violence'],
    assistance: { amountLabel: 'Resource connection', durationLabel: 'Depends on placement', methodLabel: 'Crisis line and coordinated access' }, requiredDocuments: ['photo_id'], tags: ['Urgent', 'Shelter', 'Homelessness'],
  },
  {
    id: 'texas-211', name: '2-1-1 Texas Housing Search', provider: 'Texas Health and Human Services', category: 'general',
    description: 'Free, anonymous information and referral support for rent, utilities, emergency shelter, deposits, legal aid, and local housing programs.', coverage: 'Dallas and statewide Texas',
    status: 'open', statusLabel: 'Available now', sourceUrl: 'https://www.211texas.org/', sourceLabel: '2-1-1 Texas official site', phone: '211', verifiedAt: checked,
    verificationNote: '2-1-1 connects callers to local information; specific provider openings must be confirmed during the call or search.',
    eligibility: ['Anyone seeking Texas housing or crisis resources', 'Use your ZIP code and current situation for better routing'], matchableIssues: ['rent_increase', 'eviction', 'utilities', 'homeless', 'shelter', 'moving', 'legal', 'domestic_violence', 'disability', 'veteran', 'youth', 'general'],
    assistance: { amountLabel: 'Referral and information', durationLabel: 'Depends on provider', methodLabel: 'Phone or online search' }, requiredDocuments: [], tags: ['Free', 'Referral', 'All situations'],
  },
  {
    id: 'dallas-county-housing-agency', name: 'Dallas County Housing Agency', provider: 'Dallas County Health and Human Services', category: 'housing',
    description: 'Housing Choice Voucher and public-housing information for eligible low- to moderate-income households, with waitlist availability that changes over time.', coverage: 'Dallas County service area',
    status: 'waitlist', statusLabel: 'Waitlist / verify', sourceUrl: 'https://qr.dallascounty.org/departments/dchhs/human-services/housing-agency.php', sourceLabel: 'Dallas County official page', phone: '214-819-1871', verifiedAt: checked,
    verificationNote: 'The county page warns that applications are accepted only when the waitlist is open. Call before applying.',
    eligibility: ['Low- to moderate-income household', 'Meet the housing agency screening requirements', 'Waitlist must be open for new applications'], matchableIssues: ['homeless', 'rent_increase', 'general'],
    assistance: { amountLabel: 'Rent subsidy varies', durationLabel: 'Long-term program', methodLabel: 'Housing voucher or public housing' }, requiredDocuments: ['photo_id', 'income_proof'], tags: ['Waitlist', 'Voucher', 'Long-term'],
  },
  {
    id: 'dha-housing-solutions', name: 'DHA Housing Solutions for North Texas', provider: 'Dallas Housing Authority', category: 'housing',
    description: 'Public housing and Housing Choice Voucher information for Dallas-area applicants. Open enrollment and waiting-list rules vary by program.', coverage: 'Dallas and North Texas service areas',
    status: 'call_to_verify', statusLabel: 'Check enrollment', sourceUrl: 'https://dhantx.com/applicants/', sourceLabel: 'DHA official site', phone: '214-951-8300', verifiedAt: checked,
    verificationNote: 'Enrollment windows and waitlist status are controlled by DHA and can change without notice.',
    eligibility: ['Program-specific income and household requirements', 'Application must be open for the selected housing program'], matchableIssues: ['homeless', 'rent_increase', 'disability', 'veteran', 'general'],
    assistance: { amountLabel: 'Program-specific', durationLabel: 'Program-specific', methodLabel: 'Voucher or public housing' }, requiredDocuments: ['photo_id', 'income_proof'], tags: ['Voucher', 'Public housing'],
  },
  {
    id: 'legal-aid-dallas-eviction', name: 'Dallas Eviction & Tenant Clinic', provider: 'Legal Aid of NorthWest Texas', category: 'legal',
    description: 'Civil legal support for eviction, landlord-tenant issues, and housing preservation. Some Dallas County clinics accept walk-ins on specific days.', coverage: 'Dallas County',
    status: 'call_to_verify', statusLabel: 'Check clinic schedule', sourceUrl: 'https://legalaidtx.org/locations/dallas/', sourceLabel: 'Legal Aid of NorthWest Texas', phone: '469-694-2258', verifiedAt: checked,
    verificationNote: 'Clinic hours and locations are time-sensitive. Confirm the current schedule before traveling.',
    eligibility: ['Dallas County housing or landlord-tenant matter', 'Income and case eligibility may apply'], matchableIssues: ['eviction', 'legal', 'rent_increase'],
    assistance: { amountLabel: 'Legal guidance', durationLabel: 'Case-specific', methodLabel: 'Phone intake or clinic' }, requiredDocuments: ['photo_id', 'lease_or_rent_notice'], tags: ['Eviction', 'Legal aid', 'Tenant rights'],
  },
  {
    id: 'city-dallas-housing-support', name: 'Dallas Housing & Homelessness Support', provider: 'City of Dallas Housing & Homelessness Solutions', category: 'general',
    description: 'A city-maintained directory for 311, shelters, homelessness response, legal aid, and other housing support pathways.', coverage: 'Dallas city and local response network',
    status: 'referral_required', statusLabel: 'Choose a pathway', sourceUrl: 'https://dallascityhall.com/departments/housing-and-homelessness/Pages/get-support.aspx', sourceLabel: 'City of Dallas official page', phone: '311', verifiedAt: checked,
    verificationNote: 'Use 311 or the linked provider to confirm current capacity and eligibility.',
    eligibility: ['Depends on the selected provider or shelter', 'Emergency safety concerns should use emergency services'], matchableIssues: ['homeless', 'shelter', 'eviction', 'domestic_violence', 'youth', 'general'],
    assistance: { amountLabel: 'Resource navigation', durationLabel: 'Provider-specific', methodLabel: '311 or provider referral' }, requiredDocuments: [], tags: ['Shelters', '311', 'Navigation'],
  },
];


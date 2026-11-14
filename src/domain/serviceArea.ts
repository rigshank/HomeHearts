import texasZipAreas from '../data/texasZipAreas.json';
import { County, IntakeProfile, ServiceArea } from './types';

export const COUNTY_LABELS: Record<County, string> = {
  '48085': 'Collin County',
  '48113': 'Dallas County',
  '48121': 'Denton County',
  '48139': 'Ellis County',
  '48257': 'Kaufman County',
  '48397': 'Rockwall County',
  '48439': 'Tarrant County',
  other: 'Another county',
};

// Land overlaps from the Census 2020 ZCTA-to-County and ZCTA-to-Place relationship files.
// https://www.census.gov/geographies/reference-files/2020/geo/relationship-files.html
// ZCTAs approximate residential ZIP codes. A partial overlap requires user confirmation.
const countiesByZip = new Map<string, County[]>();
for (const [group, zips] of Object.entries(texasZipAreas.countyGroups)) {
  const counties = group.split(',') as County[];
  for (const zip of zips.split(' ')) countiesByZip.set(zip, counties);
}
const dallasCityZips = new Set(texasZipAreas.dallasCity.inside.split(' '));
const partialDallasCityZips = new Set(texasZipAreas.dallasCity.partial.split(' '));

export function isZipCode(zip: string) {
  return /^\d{5}$/.test(zip.trim());
}

export function getZipArea(zip: string) {
  const code = zip.trim();
  const counties = countiesByZip.get(code) ?? [];
  const dallasCity = dallasCityZips.has(code) ? 'inside' : partialDallasCityZips.has(code) ? 'partial' : 'outside';
  return { counties, dallasCity, inTexas: counties.length > 0 };
}

export function servesLocation(area: ServiceArea, intake: IntakeProfile) {
  if (!isZipCode(intake.zipCode)) return false;
  const location = getZipArea(intake.zipCode);
  switch (area.kind) {
    case 'nationwide':
      return true;
    case 'texas':
      return location.inTexas;
    case 'dallas_city':
      return location.dallasCity === 'inside' || (location.dallasCity === 'partial' && intake.insideDallas === true);
    case 'counties': {
      const covered = new Set<County>(area.counties);
      if (intake.county && intake.county !== 'unsure' && location.counties.includes(intake.county)) {
        return covered.has(intake.county);
      }
      return location.counties.length > 0 && location.counties.every((county) => covered.has(county));
    }
  }
}

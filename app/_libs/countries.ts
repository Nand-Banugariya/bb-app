import { countries } from 'country-data-list';

/** A country as the pickers list it: lower-case ISO alpha-2 code (react-circle-flags' key) and name. */
export interface CountryOption {
    code: string;
    name: string;
}

/**
 * Every current country, filtered as bb-app's CountryDropdown does: has a flag emoji, isn't
 * deleted, North Korea left out. Flags render with `<CircleFlag countryCode={code} />`.
 */
export const COUNTRIES: CountryOption[] = countries.all
    .filter((c) => c.emoji && c.status !== 'deleted' && c.ioc !== 'PRK')
    .map((c) => ({ code: c.alpha2.toLowerCase(), name: c.name }));

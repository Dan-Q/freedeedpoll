import { describe, it, expect } from 'vitest'
import { BOLD_CHAR, tidySubmission, getDayOrdinal, signedLine, deedTitle, deedClauses } from '../js/lib/deed-text.js'

const submission = {
  oldName: 'Testy McTestface',
  newName: 'Testy Testalot',
  firstNameChanged: false,
  address: '1 High Street, Oxford, OX1 1AA',
  county: '',
  date: '2026-01-01',
  firstWitnessName: 'Witty McWitnessface',
  firstWitnessAddress: '2 High Street',
  secondWitnessName: 'Wendy McWitnessface',
  secondWitnessAddress: '3 High Street',
};
const collapse = text => text.replace(/\s+/g, ' ').trim();

describe('tidySubmission', () => {
  it('trims every text field', () => {
    const tidy = tidySubmission({
      ...submission,
      oldName: '  Testy McTestface ', newName: ' Testy Testalot  ', address: ' 1 High St ', county: ' Oxfordshire ',
      date: ' 2026-01-01 ', firstWitnessName: ' A B ', firstWitnessAddress: ' x ', secondWitnessName: ' C D ', secondWitnessAddress: ' y ',
    });
    expect(tidy).toMatchObject({
      oldName: 'Testy McTestface', newName: 'Testy Testalot', address: '1 High St', county: 'Oxfordshire', date: '2026-01-01',
      firstWitnessName: 'A B', firstWitnessAddress: 'x', secondWitnessName: 'C D', secondWitnessAddress: 'y',
    });
  });

  it('replaces blank (or whitespace-only) names and addresses with signable blanks', () => {
    const blank = { ...submission, oldName: '', newName: '  ', address: '', firstWitnessName: '', firstWitnessAddress: '', secondWitnessName: '', secondWitnessAddress: '' };
    const tidy = tidySubmission(blank);
    expect(tidy.oldName).toBe('_'.repeat(16));
    expect(tidy.newName).toBe('_'.repeat(16));
    expect(tidy.firstWitnessName).toBe('_'.repeat(16));
    expect(tidy.secondWitnessName).toBe('_'.repeat(16));
    expect(tidy.address).toBe('_'.repeat(24));
    expect(tidy.firstWitnessAddress).toBe('_'.repeat(24));
    expect(tidy.secondWitnessAddress).toBe('_'.repeat(24));
  });

  it('leaves a blank county blank', () => {
    expect(tidySubmission({ ...submission, county: '   ' }).county).toBe('');
  });

  it('defaults a blank date to today', () => {
    expect(tidySubmission({ ...submission, date: '' }, '2030-02-03').date).toBe('2030-02-03');
  });

  it('defaults a blank date to the real current date when no "today" is given', () => {
    expect(tidySubmission({ ...submission, date: '' }).date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('preserves the first-name-changed flag and does not mutate its input', () => {
    const input = { ...submission, firstNameChanged: true, oldName: ' Testy McTestface ' };
    const tidy = tidySubmission(input);
    expect(tidy.firstNameChanged).toBe(true);
    expect(input.oldName).toBe(' Testy McTestface ');
  });
});

describe('getDayOrdinal', () => {
  const expected = { 1: 'ST', 2: 'ND', 3: 'RD', 4: 'TH', 11: 'TH', 12: 'TH', 13: 'TH', 20: 'TH', 21: 'ST', 22: 'ND', 23: 'RD', 24: 'TH', 30: 'TH', 31: 'ST' };
  it.each(Object.entries(expected))('day %s is %s', (day, ordinal) => {
    expect(getDayOrdinal(Number(day))).toBe(ordinal);
  });

  it('returns a valid ordinal for every day of the month', () => {
    for(let day = 1; day <= 31; day++) expect(['ST', 'ND', 'RD', 'TH']).toContain(getDayOrdinal(day));
  });
});

describe('signedLine', () => {
  it.each([
    ['2026-01-01', '1ST DAY OF JANUARY IN THE YEAR 2026'],
    ['2026-02-02', '2ND DAY OF FEBRUARY IN THE YEAR 2026'],
    ['2026-03-03', '3RD DAY OF MARCH IN THE YEAR 2026'],
    ['2026-04-11', '11TH DAY OF APRIL IN THE YEAR 2026'],
    ['2026-05-22', '22ND DAY OF MAY IN THE YEAR 2026'],
    ['2024-02-29', '29TH DAY OF FEBRUARY IN THE YEAR 2024'],
    ['2026-12-31', '31ST DAY OF DECEMBER IN THE YEAR 2026'],
  ])('%s', (isoDate, expected) => {
    expect(signedLine(isoDate)).toBe(`${BOLD_CHAR}SIGNED AS A DEED THIS ${expected}${BOLD_CHAR}`);
  });

  it('throws on an invalid date rather than producing nonsense', () => {
    expect(() => signedLine('not-a-date')).toThrow();
    expect(() => signedLine('2026-02-30')).toThrow();
  });
});

describe('deedTitle', () => {
  it('uses the new name', () => {
    expect(deedTitle('Testy Testalot')).toBe('Deed Poll for Testy Testalot');
  });

  it('falls back to a generic title for blank or overlong names', () => {
    expect(deedTitle('')).toBe('Your Deed Poll');
    expect(deedTitle('   ')).toBe('Your Deed Poll');
    expect(deedTitle(undefined)).toBe('Your Deed Poll');
    expect(deedTitle('A'.repeat(31))).toBe(`Deed Poll for ${'A'.repeat(31)}`);
    expect(deedTitle('A'.repeat(32))).toBe('Your Deed Poll');
  });
});

describe('deedClauses', () => {
  const clauses = deedClauses(tidySubmission(submission));

  it('opens by naming the new name, address and old name', () => {
    expect(collapse(clauses.preamble)).toBe(
      '§BY THIS DEED OF CHANGE OF NAME§ made by myself the undersigned §Testy Testalot§ of §1 High Street, Oxford, OX1 1AA§ formerly known as §Testy McTestface§, a British Citizen'
    );
  });

  it('includes the county only when given', () => {
    expect(collapse(clauses.preamble)).not.toContain('County');
    const withCounty = deedClauses(tidySubmission({ ...submission, county: 'Oxfordshire' }));
    expect(collapse(withCounty.preamble)).toContain('§1 High Street, Oxford, OX1 1AA§ in the County of §Oxfordshire§ formerly known as');
  });

  it('has three numbered articles in order', () => {
    expect(clauses.articles.map(a => a.numeral)).toEqual(['I.', 'II.', 'III.']);
    expect(collapse(clauses.articles[0].text)).toContain('renounce, relinquish and abandon the use of my said former name §Testy McTestface§');
    expect(collapse(clauses.articles[1].text)).toContain('use and subscribe the said name of §Testy Testalot§');
    expect(collapse(clauses.articles[2].text)).toContain('address me by the adopted name of §Testy Testalot§');
  });

  it('has balanced bold markers in every paragraph', () => {
    const all = [clauses.preamble, clauses.declaration, ...clauses.articles.map(a => a.text), clauses.witness, clauses.signed];
    for(const text of all) expect((text.split(BOLD_CHAR).length - 1) % 2).toBe(0);
  });

  it('closes with the witness clause and the signed line', () => {
    expect(collapse(clauses.witness)).toBe('§IN WITNESS§ whereof I have hereunto subscribed my adopted and substituted name of §Testy Testalot§ and also my said former name of §Testy McTestface§.');
    expect(clauses.signed).toBe('§SIGNED AS A DEED THIS 1ST DAY OF JANUARY IN THE YEAR 2026§');
  });

  it('includes the Vaisey clause only when the first name changed', () => {
    expect(clauses.vaisey).toBeNull();
    const changed = deedClauses(tidySubmission({ ...submission, newName: 'Testify Testalot', firstNameChanged: true }));
    expect(changed.vaisey).toContain('Mr Justice Vaisey in re Parrott, Cox v Parrott');
  });
});

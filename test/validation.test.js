import { describe, it, expect } from 'vitest'
import { validateSubmission } from '../js/lib/validation.js'

const valid = {
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
const fieldsWithErrors = (submission, disallowBlanks) => validateSubmission(submission, disallowBlanks).map(e => e.field);

describe('validateSubmission', () => {
  it('accepts a complete, sensible submission', () => {
    expect(validateSubmission(valid, true)).toEqual([]);
  });

  describe('blank fields', () => {
    const blankFieldLabels = {
      oldName: 'old name',
      newName: 'new name',
      address: 'address',
      date: 'date',
      firstWitnessName: 'first witness\'s name',
      firstWitnessAddress: 'first witness\'s address',
      secondWitnessName: 'second witness\'s name',
      secondWitnessAddress: 'second witness\'s address',
    };

    for(const [field, label] of Object.entries(blankFieldLabels)) {
      it(`flags a blank ${field} only when blanks are disallowed`, () => {
        const submission = { ...valid, [field]: '' };
        const message = `The "${label}" field is blank.`;
        expect(validateSubmission(submission, true).map(e => e.message)).toContain(message);
        expect(validateSubmission(submission, false).map(e => e.message)).not.toContain(message);
      });
    }

    it('does not require the county', () => {
      expect(validateSubmission({ ...valid, county: '' }, true)).toEqual([]);
    });
  });

  it('flags identical old and new names', () => {
    const errors = validateSubmission({ ...valid, newName: 'Testy McTestface' });
    expect(errors.map(e => e.message)).toContain('The "old name" and "new name" are the same.');
  });

  it('warns about a single-word old name', () => {
    expect(fieldsWithErrors({ ...valid, oldName: 'Testy' })).toContain('oldName');
  });

  it('warns about a single-word new name', () => {
    expect(fieldsWithErrors({ ...valid, newName: 'Testalot', firstNameChanged: true })).toContain('newName');
  });

  describe('new name characters', () => {
    it.each(["Testy-Testify O'Testface", 'Testy   Testalot', 'TESTY TESTALOT'])('accepts %j', newName => {
      expect(fieldsWithErrors({ ...valid, newName })).not.toContain('newName');
    });

    it.each(['Testy Testalot2', 'Testé Testalot', 'Testy Testälot', '李 小龍', 'Testy Testalot!'])('warns about %j', newName => {
      expect(fieldsWithErrors({ ...valid, newName })).toContain('newName');
    });
  });

  describe('first-name-changed checkbox', () => {
    it('warns when the first name changed but the box is unticked', () => {
      expect(fieldsWithErrors({ ...valid, newName: 'Testify McTestface', firstNameChanged: false })).toEqual(['firstNameChanged']);
    });

    it('is happy when the first name changed and the box is ticked', () => {
      expect(fieldsWithErrors({ ...valid, newName: 'Testify McTestface', firstNameChanged: true })).toEqual([]);
    });

    it('warns when the box is ticked but the first name did not change', () => {
      expect(fieldsWithErrors({ ...valid, firstNameChanged: true })).toEqual(['firstNameChanged']);
    });
  });

  it('reports every problem at once, tagged by field', () => {
    const errors = validateSubmission({ ...valid, oldName: 'Testy', newName: 'Testy', address: '' }, true);
    expect(errors.map(e => e.field).sort()).toEqual(['address', 'newName', 'newName', 'oldName']);
  });
});

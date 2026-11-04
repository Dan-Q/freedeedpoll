// The wording of the deed, and the pure data-munging around it. Bold spans are wrapped in BOLD_CHAR.
import { Temporal } from 'temporal-polyfill'

export const BOLD_CHAR = '§';

const NAME_PLACEHOLDER    = '________________';
const ADDRESS_PLACEHOLDER = '________________________';

// today: an ISO date string (YYYY-MM-DD) used if the date field is blank
export function tidySubmission(raw, today = Temporal.Now.plainDateISO().toString()) {
  const submission = { ...raw };
  const trimWithPlaceholder = (field, placeholder) => {
    submission[field] = submission[field].trim();
    if(submission[field] == '') submission[field] = placeholder;
  };

  trimWithPlaceholder('oldName', NAME_PLACEHOLDER);
  trimWithPlaceholder('newName', NAME_PLACEHOLDER);
  trimWithPlaceholder('address', ADDRESS_PLACEHOLDER);
  submission.county = submission.county.trim();
  trimWithPlaceholder('date', today);
  trimWithPlaceholder('firstWitnessName', NAME_PLACEHOLDER);
  trimWithPlaceholder('firstWitnessAddress', ADDRESS_PLACEHOLDER);
  trimWithPlaceholder('secondWitnessName', NAME_PLACEHOLDER);
  trimWithPlaceholder('secondWitnessAddress', ADDRESS_PLACEHOLDER);
  return submission;
}

export function getDayOrdinal(num) {
  if(num === 1 || num === 21 || num === 31) return 'ST';
  if(num === 2 || num === 22) return 'ND';
  if(num === 3 || num === 23) return 'RD';
  return 'TH';
}

// isoDate: YYYY-MM-DD. Returns the text for the "SIGNED AS A DEED..." line.
export function signedLine(isoDate) {
  const date = Temporal.PlainDate.from(isoDate);
  const day = parseInt(date.toLocaleString('en-GB', { day: 'numeric' }));
  const dayOrdinal = getDayOrdinal(day);
  const month = date.toLocaleString('en-GB', { month: 'long' }).toUpperCase();
  const year = date.toLocaleString('en-GB', { year: 'numeric' });
  return `${BOLD_CHAR}SIGNED AS A DEED THIS ${day}${dayOrdinal} DAY OF ${month} IN THE YEAR ${year}${BOLD_CHAR}`;
}

export function deedTitle(newName) {
  return (newName && newName.trim().length > 0 && newName.trim().length < 32) ?
    `Deed Poll for ${newName}` :
    'Your Deed Poll';
}

// Takes a tidied submission. Returns the paragraphs of the deed, in order:
//   preamble, declaration, articles (numeral + text), witness clause, optional Vaisey clause, signed line
export function deedClauses(submission) {
  const countyLine = submission.county == '' ? '' : ` in the County of §${submission.county}§`
  return {
    preamble: `
      §BY THIS DEED OF CHANGE OF NAME§ made by myself the undersigned
      §${submission.newName}§ of §${submission.address}§${countyLine}
      formerly known as §${submission.oldName}§, a British Citizen
    `,
    declaration: `
      §HEREBY DECLARE AS FOLLOWS:§
    `,
    articles: [
      { numeral: 'I.', text: `
        §I ABSOLUTELY§ and entirely renounce, relinquish and abandon the use of my said former name
        §${submission.oldName}§ and assume, adopt and determine to take and use from the date hereof the name of
        §${submission.newName}§ in substitution for my former name of §${submission.oldName}§
      ` },
      { numeral: 'II.', text: `
        §I SHALL AT ALL TIMES§ hereafter in all records, deeds documents and other writings and in all actions and
        proceedings as well as in all dealings and transactions and on all occasions whatsoever use and subscribe the
        said name of §${submission.newName}§ as my name, in substitution for my former name of
        §${submission.oldName}§ so relinquished as aforesaid to the intent that I may hereafter be called known or
        distinguished not by the former name of §${submission.oldName}§ but by the name §${submission.newName}§
      ` },
      { numeral: 'III.', text: `
        §I AUTHORISE AND REQUIRE§ all persons at all times to designate, describe and address me by the adopted
        name of  §${submission.newName}§
      ` },
    ],
    witness: `
      §IN WITNESS§ whereof I have hereunto subscribed my adopted and substituted name of
      §${submission.newName}§ and also my said former name of §${submission.oldName}§.
    `,
    vaisey: submission.firstNameChanged ?
      'Notwithstanding the decision of Mr Justice Vaisey in re Parrott, Cox v Parrott, the applicant wishes the enrolment to proceed.' :
      null,
    signed: signedLine(submission.date),
  };
}

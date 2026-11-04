// Pure validation of a deed poll submission (the object produced by formData).
// Returns a list of { field, message } warnings; empty means "all good".

const REQUIRED_FIELDS = [
  ['oldName', 'old name'],
  ['newName', 'new name'],
  ['address', 'address'],
  ['date', 'date'],
  ['firstWitnessName', 'first witness\'s name'],
  ['firstWitnessAddress', 'first witness\'s address'],
  ['secondWitnessName', 'second witness\'s name'],
  ['secondWitnessAddress', 'second witness\'s address'],
];

export function validateSubmission(submission, disallowBlanks = false) {
  const validationErrors = [];

  if(disallowBlanks) {
    for(const [field, label] of REQUIRED_FIELDS) {
      if(submission[field] === '') validationErrors.push({ field, message: `The "${label}" field is blank.` });
    }
  }

  if(submission.newName === submission.oldName) validationErrors.push({ field: 'newName', message: 'The "old name" and "new name" are the same.' });
  if(!submission.oldName.match(/\S+\s+\S+/)) validationErrors.push({ field: 'oldName', message: `
    Your old name looks like it only contains one name.
    If that's correct, that's fine, but please check!
  ` });
  if(!submission.newName.match(/\S+\s+\S+/)) validationErrors.push({ field: 'newName', message: `
    Your new name looks like it only contains one name.
    (<a href="/faq/#legal-restrictions">Why is this a problem?</a>)
  ` });
  if(!submission.newName.match(/^[a-z\s\-\']+$/i)) validationErrors.push({ field: 'newName', message: `
    Your new name contains characters that don't appear in the Latin alphabet. This isn't necessarily a problem, but your name may be
    adapted for use in some contexts (e.g. your Passport may require a Latinised version of your name).
    (<a href="/faq/#legal-restrictions">Why is this a problem?</a>)
  `});
  const suspectedOldFirstName = submission.oldName.split(' ')[0];
  const suspectedNewFirstName = submission.newName.split(' ')[0];
  if(suspectedOldFirstName !== suspectedNewFirstName && !submission.firstNameChanged)
    validationErrors.push({ field: 'firstNameChanged', message: `
      It looks like you've changed your first name, but not ticked the "I've changed my first name" box.
      (<a href="/faq/#vaisey">Why does this matter?</a>)
    `});
  if(suspectedOldFirstName == suspectedNewFirstName && submission.firstNameChanged)
    validationErrors.push({ field: 'firstNameChanged', message: `
      You've ticked the "I've changed my first name" box, but it doesn't look like you haven't changed your first name.
      (<a href="/faq/#vaisey">Why does this matter?</a>)
    `});

  return validationErrors;
}

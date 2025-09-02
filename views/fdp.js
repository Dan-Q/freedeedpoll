import { jsPDF } from "jspdf";
import '../js/jspdf-font-OldeEnglish-normal.es.js'

// JS is working:
document.body.classList.remove('no-js');
document.body.classList.add('yes-js');

function formData(form) {
  let obj = {};
  Array.from(form.elements).filter(e=>e.dataset.id).forEach(e=>{
    obj[e.dataset.id] = e.value;
  });
  return obj;
}

function formToB64(form) {
  return btoa(JSON.stringify(formData(form)));
}

function b64ToForm(b64, form) {
  let obj = JSON.parse(atob(b64));
  Object.entries(obj).forEach(([key, value]) => {
    const element = form.querySelector(`[data-id="${key}"]`);
    if (element) element.value = value;
  });
}

const h1 = document.querySelector('h1');
const deedPollForm = document.getElementById('deed-poll');
const deedPollResult = document.getElementById('deed-poll-result');
const deedPollModify = document.getElementById('deed-poll-modify');
const deedPollValidationErrors = document.getElementById('deed-poll-validation-errors');
const deedPollValidationErrorsList = document.getElementById('deed-poll-validation-errors-list');
const deedPollSkipValidation = document.getElementById('skip-validation');

if(deedPollForm && window.location.hash.length > 0) {
  b64ToForm(window.location.hash.slice(1), deedPollForm);
  generateDeedPoll(deedPollForm);
}

function validateDeedPoll(form, disallowBlanks = false) {
  console.log('validateDeedPoll', form, disallowBlanks);
  const submission = formData(form);
  const validationErrors = [];

  if(disallowBlanks) {
    if(submission.oldName === '') validationErrors.push({ field: 'oldName', message: 'The "old name" field is blank.' });
    if(submission.newName === '') validationErrors.push({ field: 'newName', message: 'The "new name" field is blank.' });
    if(submission.address === '') validationErrors.push({ field: 'address', message: 'The "address" field is blank.' });
    if(submission.county === '') validationErrors.push({ field: 'county', message: 'The "county" field is blank.' });
  }

  if(submission.newName === submission.oldName) validationErrors.push({ field: 'newName', message: 'The "old name" and "new name" are the same.' });

  // Show validation errors:
  if(validationErrors.length > 0) {
    deedPollValidationErrors.hidden = false;
    deedPollValidationErrorsList.innerHTML = validationErrors.map(error => `<li>⚠️ ${error.message}</li>`).join('');
  } else {
    deedPollValidationErrors.hidden = true;
    deedPollSkipValidation.checked = false;
  }

  // Highlight validation of fields:
  for(const element of deedPollForm.elements) {
    if(validationErrors.some(error => error.field === element.dataset.id)) {
      element.ariaInvalid = true;
    } else if(element.value !== '') {
      element.ariaInvalid = false;
    } else {
      element.ariaInvalid = null;
    }
  }

  return validationErrors.length === 0;
}

function generateDeedPoll(form) {
  // Set the hash so we can bookmark the page
  window.location.hash = formToB64(form);

  const doc = new jsPDF();
  const submission = formData(form);
  let html = '<h2>Deed of Change of Name</h2>';

  const MARGIN_LEFT      =  15   ; // mm
  const MARGIN_RIGHT     =  15   ; // mm
  const A4_WIDTH         = 210   ; // mm
  const TITLE_FONT_SIZE  =  24   ; // points
  const BODY_FONT_SIZE   =  12   ; // points
  const MAGIC_NUMBER_1   = 175   ;
  const MAGIC_NUMBER_2   =   0.35;
  const MAGIC_NUMBER_3   = 500   ;
  const MAGIC_NUMBER_4   =   0.4 ;
  const BOLD_CHAR        = '§'    ;
  const BOLD_CHAR_REGEX  = new RegExp(`(${RegExp.escape(BOLD_CHAR)}{2})+`, 'g');
  const BOLD_BLOCK_REGEX = new RegExp(`(${RegExp.escape(BOLD_CHAR)}{2})(.*?)(${RegExp.escape(BOLD_CHAR)}{2})`, 'g');

  doc.setFont('OldeEnglish', 'normal');
  doc.setFontSize(TITLE_FONT_SIZE);
  doc.text(A4_WIDTH / 2, 30, 'Deed of Change of Name', { align: 'center' });
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(BODY_FONT_SIZE);

  function addPara(unformattedText, startY, startX, width) {
    const text = unformattedText.replace(/[\n ]+/g, ' ').trim();
    
    // Add to PDF:
    const startXCached = startX;
    const lineSpacing = doc.getLineHeightFactor() + BODY_FONT_SIZE * MAGIC_NUMBER_4;
  
    let textObject = getTextRows(text, width);

    textObject.map((row, rowPosition) => {
      Object.entries(row.chars).map(([key, value]) => {
        doc.setFont('Helvetica', value.bold ? 'bold' : 'normal');
        doc.text(startX, startY, value.char);
      
        if(value.char == ' ' && rowPosition < textObject.length - 1){
          startX += row.blankSpacing * MAGIC_NUMBER_2;
        } else {
          startX += doc.getStringUnitWidth(value.char) * BODY_FONT_SIZE * MAGIC_NUMBER_2;
        }
      });
      startX = startXCached;
      startY += lineSpacing;
    });

    // Add to HTML:
    const htmlText = text.replace(BOLD_BLOCK_REGEX, `<strong>$2</strong>`);
    html += `<p>${htmlText}</p>`;
  };

  function getTextRows(inputValue, width) {
    const textWithoutBoldMarks = inputValue.replace(BOLD_CHAR_REGEX, '');

    let splitTextWithoutBoldMarks = doc.splitTextToSize(
      textWithoutBoldMarks,
      MAGIC_NUMBER_1
    );

    let charsMapLength = 0;
    let position = 0;
    let isBold = false;

    let textRows = splitTextWithoutBoldMarks.map((row, i) => {
        const charsMap = row.split('');

        const chars = charsMap.map((char, j) => {
          position = charsMapLength + j + i;

          let currentChar = inputValue.charAt(position);

          if (currentChar === BOLD_CHAR) {
            const spyNextChar = inputValue.charAt(position + 1);
            if (spyNextChar === BOLD_CHAR) {
            // double asterix marker exist on these position's so we toggle the bold state
            isBold = !isBold;
            currentChar = inputValue.charAt(position + 2);

              // now we remove the markers, so loop jumps to the next real printable char
              let removeMarks = inputValue.split('');
              removeMarks.splice(position, 2);
              inputValue = removeMarks.join('');
            }
          }

          return { char: currentChar, bold: isBold };
        });
        charsMapLength += charsMap.length;

        // Calculate the size of the white space to justify the text
        let charsWihoutsSpacing = Object.entries(chars).filter(([key, value]) => value.char != ' ');
        let widthRow = 0;

        charsWihoutsSpacing.forEach(([key, value]) => {
          // Keep in mind that the calculations are affected if the letter is in bold or normal
          doc.setFont('Helvetica', value.bold ? 'bold' : 'normal');
          widthRow += doc.getStringUnitWidth(value.char) * BODY_FONT_SIZE;
        });

        let totalBlankSpaces = charsMap.length - charsWihoutsSpacing.length;
        let blankSpacing = (width - widthRow) / totalBlankSpaces;

        return {blankSpacing: blankSpacing, chars: { ...chars }};
      });
    
      return textRows;
  }

  addPara(`
    §§BY THIS DEED OF CHANGE OF NAME§§ made by myself the undersigned
    §§${submission.newName}§§ of §§${submission.address}§§ in the County of §§${submission.county}§§
    formerly known as §§${submission.oldName}§§, a British Citizen
  `, 45, MARGIN_LEFT, MAGIC_NUMBER_3);
  addPara(`
    §§HEREBY DECLARE AS FOLLOWS:§§
  `, 70, MARGIN_LEFT, MAGIC_NUMBER_3);
  addPara(`
    §§I. §§
  `, 82, MARGIN_LEFT, MAGIC_NUMBER_3);
  addPara(`
    §§I ABSOLUTELY§§ and entirely renounce, relinquish and abandon the use of my said former name
    §§${submission.oldName}§§ and assume, adopt and determine to take and use from the date hereof the name of
    §§${submission.newName}§§ in substitution for my former name of §§${submission.oldName}§§
  `, 82, MARGIN_LEFT + 16, MAGIC_NUMBER_3 - (16 * 3));
  addPara(`
    §§II. §§
  `, 112, MARGIN_LEFT, MAGIC_NUMBER_3);
  addPara(`
    §§I SHALL AT ALL TIMES§§ hereafter in all records, deeds documents and other writings and in all actions and
    proceedings as well as in all dealings and transactions and on all occasions whatsoever use and subscribe the
    said name of §§${submission.newName}§§ as my name, in substitution for my former name of
    §§${submission.oldName}§§ so relinquished as aforesaid to the intent that I may hereafter be called known or
    distinguished not by the former name of §§${submission.oldName}§§ but by the name §§${submission.newName}§§
  `, 112, MARGIN_LEFT + 16, MAGIC_NUMBER_3 - (16 * 3));
  addPara(`
    §§III. §§
  `, 154, MARGIN_LEFT, MAGIC_NUMBER_3);
  addPara(`
    §§I AUTHORISE AND REQUIRE§§ all persons at all times to designate, describe, and address me by the adopted
    name of  §§${submission.newName}§§
  `, 154, MARGIN_LEFT + 16, MAGIC_NUMBER_3 - (16 * 3));
  addPara(`
    §§IN WITNESS§§ whereof I have hereunto subscribed my adopted and substituted name of
    §§${submission.newName}§§ and also my said former name of §§${submission.oldName}§§.
  `, 174, MARGIN_LEFT, MAGIC_NUMBER_3);
  // TODO: Notwithstanding the decision of Mr Justice Vaisey in re Parrott, Cox v Parrott, the applicant wishes the enrolment to proceed.
  // TODO: SIGNED AS A DEED THIS #{day.ordinalize.upcase} DAY OF #{month.upcase} IN THE YEAR #{year}
  // TODO: [signatures] by the above name {new} | by the above name {old}
  // TODO: [twice]: witness sigline, name, address

  const title = `Deed Poll for ${submission.newName}`;
  document.title = title;

  const pdfData = doc.output('datauristring');
  html = `
    <div id="deed-poll-text" popover>
      <header>
        <strong style="text-align: center;">${title}</strong>
      </header>
      <article data-theme="light">${html}</article>
      <footer>
        <p>
          <small>
            You can use the text above if you want to write out your own deed poll.
            For example, you can copy it into your favourite word processor for editing and formatting.
            Or you can put your calligraphy skills to use and write it out by hand, for a unique and personal touch.
          </small>
        </p>
      </footer>
    </div>
  `;

  h1.innerText = title;
  deedPollResult.innerHTML = `
    ${html}
    <p>
      Your deed poll is ready to print and use:
    </p>
    <p style="text-align: center;">
      <a href="${pdfData}" role="button" target="_blank">View PDF</a>
      <a href="${pdfData}" role="button" class="secondary" download="deed-poll.pdf">Download PDF</a>
      <button class="outline" popovertarget="deed-poll-text">Show Text</button>
    </p>
    <p>
      Print and sign your deed poll, then get started with the next steps:
    </p>
    <p style="text-align: center;">
      <a href="/next" role="button" class="outline">What do I do next?</a>
    </p>
    <p>
      <small>
        By the way: you can bookmark this page to easily come back to it later, with the details you entered already
        filled in.
        <br>
        If you share this page's address with anybody, they'll see it pre-filled with your details too. If that's not
        what you want, just tell people to go directly to <strong>www.freedeedpoll.org.uk</strong>.
      </small>
    </p>
  `;
  deedPollResult.hidden = false;
  deedPollModify.hidden = false;
  
  h1.scrollIntoView({ behavior: 'smooth' });
}

if(deedPollForm) {
  // Live validation:
  deedPollForm.addEventListener('input', e=>{
    if(e.target.dataset.id == 'skipValidation') return;
    validateDeedPoll(deedPollForm)
  }, { capture: true, passive: true });

  // Form submission:
  deedPollForm.addEventListener('submit', e=>{
    e.preventDefault();

    if(!validateDeedPoll(e.target, true) && !deedPollSkipValidation.checked){
      deedPollValidationErrors.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const submitButton = e.target.querySelector('button[type="submit"]');
    for(const input of e.target.elements) input.disabled = true;
    submitButton.ariaBusy = true;

    new Promise(resolve => {
      generateDeedPoll(e.target);
      setTimeout(resolve, 300); // minimum wait time so it doesn't "rush" the user
    }).then(() => {
      for(const input of e.target.elements) input.disabled = false;
      submitButton.ariaBusy = false;
      submitButton.classList.add('outline');
    });
  });
}

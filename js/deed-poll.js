import { jsPDF } from "jspdf";
import '../js/jspdf-font-OldeEnglish-normal.es.js'
import { formData, formToB64, b64ToForm } from './lib/form-state.js'
import { validateSubmission } from './lib/validation.js'
import { BOLD_CHAR, tidySubmission, deedClauses, deedTitle } from './lib/deed-text.js'
import {
  BODY_FONT_SIZE, BODY_FONT, MAGIC_NUMBER_2, MAGIC_NUMBER_3, MAGIC_NUMBER_4,
  cleanParaText, boldMarksToHtml, getTextRows
} from './lib/text-layout.js'

(()=>{
  const h1 = document.querySelector('h1');
  const deedPollForm = document.getElementById('deed-poll');
  const deedPollResult = document.getElementById('deed-poll-result');
  const deedPollModify = document.getElementById('deed-poll-modify');
  const deedPollValidationErrors = document.getElementById('deed-poll-validation-errors');
  const deedPollValidationErrorsList = document.getElementById('deed-poll-validation-errors-list');
  const deedPollSkipValidation = document.getElementById('skip-validation');

  function validateDeedPoll(form, disallowBlanks = false) {
    const validationErrors = validateSubmission(formData(form), disallowBlanks);

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
    const submission = tidySubmission(formData(form));

    let html = '<h2 style="text-decoration: underline;">Deed of Change of Name</h2>';

    const MARGIN_LEFT_RIGHT    =  15   ; // mm
    const A4_WIDTH             = 210   ; // mm
    const TITLE_FONT_SIZE      =  24   ; // points
    const ARTICLE_INDENT_DEPTH = 12; // how far to indent the three numbered articles

    doc.setFont('OldeEnglish', 'normal');
    doc.setFontSize(TITLE_FONT_SIZE);
    doc.text(A4_WIDTH / 2, 20, 'Deed of Change of Name', { align: 'center' });
    doc.line(70, 23, A4_WIDTH - 70, 23);
    doc.setFontSize(BODY_FONT_SIZE);

    function addPara(unformattedText, startY, startX, width, htmlStart = '<p>', htmlEnd = '</p>') {
      const text = cleanParaText(unformattedText);

      // Add to PDF:
      const startXCached = startX;
      const lineSpacing = doc.getLineHeightFactor() + (BODY_FONT_SIZE * MAGIC_NUMBER_4);

      let textObject = getTextRows(doc, text, width);

      textObject.map((row, rowPosition) => {
        Object.entries(row.chars).map(([key, value]) => {
          doc.setFont(BODY_FONT, value.bold ? 'bold' : 'normal');
          doc.text(startX, startY, value.char);

          if(value.char == ' ' && rowPosition < textObject.length - 1){
            startX += row.blankSpacing * MAGIC_NUMBER_2;
          } else {
            startX += doc.getStringUnitWidth(value.char) * (BODY_FONT_SIZE * MAGIC_NUMBER_2);
          }
        });
        startX = startXCached;
        startY += lineSpacing;
      });

      // Add to HTML:
      html += `${htmlStart}${boldMarksToHtml(text)}${htmlEnd}`;

      // Work out new page position based on height of added text, and return it:
      return startY + lineSpacing;
    };

    const clauses = deedClauses(submission);
    const articleX = MARGIN_LEFT_RIGHT + ARTICLE_INDENT_DEPTH;
    const articleWidth = MAGIC_NUMBER_3 - (ARTICLE_INDENT_DEPTH * 3);

    let pagePosition = 35;
    pagePosition = addPara(clauses.preamble, pagePosition, MARGIN_LEFT_RIGHT, MAGIC_NUMBER_3);
    pagePosition = addPara(clauses.declaration, pagePosition, MARGIN_LEFT_RIGHT, MAGIC_NUMBER_3);
    clauses.articles.forEach(article => {
      addPara(`${BOLD_CHAR}${article.numeral} ${BOLD_CHAR}`, pagePosition, MARGIN_LEFT_RIGHT, MAGIC_NUMBER_3, '<p>', '');
      pagePosition = addPara(article.text, pagePosition, articleX, articleWidth, '', '</p>');
    });
    pagePosition = addPara(clauses.witness, pagePosition, MARGIN_LEFT_RIGHT, MAGIC_NUMBER_3);
    if(clauses.vaisey) {
      pagePosition = addPara(clauses.vaisey, pagePosition, MARGIN_LEFT_RIGHT, MAGIC_NUMBER_3);
    }
    pagePosition = addPara(clauses.signed, pagePosition, MARGIN_LEFT_RIGHT, MAGIC_NUMBER_3);

    // Signatures:
    pagePosition += 20;
    const line1Left = (MARGIN_LEFT_RIGHT * 1.5);
    const line1Right = (A4_WIDTH / 2) - (MARGIN_LEFT_RIGHT * 0.75);
    const line2Left = (A4_WIDTH / 2) + (MARGIN_LEFT_RIGHT * 0.75);
    const line2Right = (A4_WIDTH) - (MARGIN_LEFT_RIGHT * 1.5);
    const line1Center = (line1Left + line1Right) / 2;
    const line2Center = (line2Left + line2Right) / 2;
    doc.line(line1Left, pagePosition, line1Right, pagePosition);
    doc.line(line2Left, pagePosition, line2Right, pagePosition);

    html += `<p>By the above name ${submission.newName}: ____________________</p>`;
    html += `<p>By the above name ${submission.oldName}: ____________________</p>`;
    html += `<p>____________________<br>${submission.firstWitnessName}<br>${submission.firstWitnessAddress}</p>`;
    html += `<p>____________________<br>${submission.secondWitnessName}<br>${submission.secondWitnessAddress}</p>`;

    // Names:
    pagePosition += 5;
    doc.setFont(BODY_FONT, 'normal');
    doc.text(`by the above name`, line1Center, pagePosition, { maxWidth: line1Right - line1Left, align: 'center' });
    doc.text(`by the above name`, line2Center, pagePosition, { maxWidth: line2Right - line2Left, align: 'center' });
    pagePosition += 5;
    doc.setFont(BODY_FONT, 'bold');
    doc.text(submission.newName, line1Center, pagePosition, { maxWidth: line1Right - line1Left, align: 'center' });
    doc.text(submission.oldName, line2Center, pagePosition, { maxWidth: line2Right - line2Left, align: 'center' });

    // Witness signatures:
    pagePosition += 25;
    doc.line(line1Left, pagePosition, line1Right, pagePosition);
    doc.line(line2Left, pagePosition, line2Right, pagePosition);

    // Witness details:
    pagePosition += 5;
    doc.setFont(BODY_FONT, 'normal');
    doc.text(submission.firstWitnessName, line1Center, pagePosition, { maxWidth: line1Right - line1Left, align: 'center' });
    doc.text(submission.secondWitnessName, line2Center, pagePosition, { maxWidth: line2Right - line2Left, align: 'center' });
    pagePosition += 5;
    doc.text(submission.firstWitnessAddress, line1Center, pagePosition, { maxWidth: line1Right - line1Left, align: 'center' });
    doc.text(submission.secondWitnessAddress, line2Center, pagePosition, { maxWidth: line2Right - line2Left, align: 'center' });

    // Detect pagePosition going "off the end" of the page and advise the user accordingly:
    const pdfTooLong = (pagePosition >= 287);

    const title = deedTitle(submission.newName);
    document.title = title;

    const pdfData = doc.output('bloburi');
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
    let buttons = `
      <a href="${pdfData}" role="button" target="_blank">${pdfTooLong ? '⚠️ ' : ''}PDF</a>
      <a href="${pdfData}" role="button" class="secondary" download="deed-poll.pdf">${pdfTooLong ? '⚠️ ' : ''}Download PDF</a>
      <button class="outline" popovertarget="deed-poll-text">Show Text</button>
    `;
    if(pdfTooLong) {
      buttons = `
        ⚠️ <strong>Warning:</strong> Your PDF deed poll turned out too long to fit onto the page.
        You'll need to use the "Show Text" button to get the text of your deed poll and copy-paste it into
        a document for yourself.
        (<a href="/faq/#pdf-too-long">Why is this happening?</a>)
        <br><br>
      ` + buttons;
    }
    deedPollResult.innerHTML = `
      ${html}
      <p>
        Your deed poll is ready to print and use:
      </p>
      <p style="text-align: center;">${buttons}</p>
      <p>
        <small>
          Made a mistake? Scroll down and edit the form to correct them, then click
          "Create Deed Poll" again.
        </small>
      </p>
      <p>
        Now you should:
      </p>
      <ol>
        <li>Print your deed poll (print <a href="/faq/#multiple-originals">a few copies</a>!)</li>
        <li>Sign your deed poll in both your old and new names</li>
        <li>Get your witnesses to sign it, too</li>
      </ol>
      <p>
        Congratulations; that's all you need to do to have legally changed your name! But there's a couple of
        extra steps you'll want to get started with to make sure that your new name is properly represented
        everywhere you use it:
      </p>
      <p style="text-align: center;">
        <a href="/next" role="button">What do I do next?</a>
        <a href="/faq" role="button" class="outline">Got more questions?</a>
      </p>
      <p>
        <small>
          You can bookmark this page to easily come back to it later, with the details you entered already
          filled in.
          <br>
          If you share this page's address with anybody, they'll see it pre-filled with your details too.
        </small>
      </p>
    `;
    deedPollResult.hidden = false;
    deedPollModify.hidden = false;

    h1.scrollIntoView({ behavior: 'smooth' });
  }

  if(deedPollForm) {
    // Load from hash:
    if(window.location.hash.length > 0) {
      b64ToForm(window.location.hash.slice(1), deedPollForm);
      generateDeedPoll(deedPollForm);
    }

    // Pre-set date field if not already set:
    if(!deedPollForm.querySelector('[data-id="date"]').value) {
      deedPollForm.querySelector('[data-id="date"]').value = new Date().toISOString().split('T')[0];
    }

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
})();

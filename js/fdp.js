// JS is working:
document.body.classList.remove('no-js');
document.body.classList.add('yes-js');

// Form submission:
document.addEventListener('submit', e=>{
  if (!e.target.id === 'deed-poll') return;
  e.preventDefault();

  const lMargin=15; //left margin in mm
  const rMargin=15; //right margin in mm
  const pdfInMM=210;  // width of A4 in mm

  const doc = new jspdf.jsPDF();

  doc.text(30, 30, 'Deed of Change of Name');

  const para = `
    I [OLD NAME] of [ADDRESS] have given up my name [OLD NAME] and have adopted for all purposes
    the name [NEW NAME].

    Where applicable, I have informed the police that I have given up my name [OLD NAME] and have
    adopted the name [NEW NAME] and understand that a failure to do so is a criminal offence.

    I also understand that when I apply for official documents in my new name, such as a British
    Passport, the relevant authorities may check the history and validity of my old name [OLD NAME]
    and new name [NEW NAME]. They may also check the information in any other supporting documents
    they have requested.

    Signed as a deed on [date] as [OLD NAME] and [NEW NAME] in the presence of [witness 1 name]
    of [witness 1 address], and [witness 2 name] of [witness 2 address].

    [your new signature], [your old signature]

    [witness 1 signature], [witness 2 signature]
  `;

  const lines = doc.splitTextToSize(para, (pdfInMM - lMargin - rMargin));
	doc.text(lMargin, 20, lines);

  const data = doc.output('datauristring');
  e.target.innerHTML = `<a href="${data}" download>Download PDF</a>`;
});

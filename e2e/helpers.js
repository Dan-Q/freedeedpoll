export const person = {
  oldName: 'Testy McTestface',
  newName: 'Testy Testalot',
  address: '1 High Street, Oxford, OX1 1AA',
  date: '2026-01-01',
  firstWitnessName: 'Witty McWitnessface',
  firstWitnessAddress: '2 High Street, Oxford, OX1 1AA',
  secondWitnessName: 'Wendy McWitnessface',
  secondWitnessAddress: '3 High Street, Oxford, OX1 1AA',
};

const labels = {
  oldName: 'Old name:',
  newName: 'New name:',
  address: 'Address:',
  county: 'County (optional):',
  date: 'Date of change:',
  firstWitnessName: 'First witness\'s name:',
  firstWitnessAddress: 'First witness\'s address:',
  secondWitnessName: 'Second witness\'s name:',
  secondWitnessAddress: 'Second witness\'s address:',
};

export async function fillForm(page, values = person) {
  for(const [field, value] of Object.entries(values)) {
    if(field === 'firstNameChanged') {
      await page.getByLabel('I\'ve changed my first name').setChecked(value);
    } else {
      await page.getByLabel(labels[field], { exact: true }).fill(value);
    }
  }
}

export const submit = page => page.getByRole('button', { name: 'Create Deed Poll' }).click();

// Reads the generated PDF back out of the page (it's a blob: URL) and summarises it
export async function readPdf(page) {
  const href = await page.getByRole('button', { name: 'PDF', exact: true }).getAttribute('href');
  return page.evaluate(async href => {
    const bytes = new Uint8Array(await (await fetch(href)).arrayBuffer());
    const text = new TextDecoder('latin1').decode(bytes);
    return { header: text.slice(0, 5), pages: (text.match(/\/Type\s*\/Page[^s]/g) ?? []).length, size: bytes.length };
  }, href);
}

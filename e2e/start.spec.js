import { test, expect } from './fixtures.js'
import { person, fillForm, submit, readPdf } from './helpers.js'

const result = page => page.locator('#deed-poll-result');
const warnings = page => page.locator('#deed-poll-validation-errors');

test.beforeEach(async ({ page }) => {
  await page.goto('/start/');
});

test.describe('the form', () => {
  test('is shown when JavaScript runs, with the date pre-filled', async ({ page }) => {
    await expect(page.locator('form#deed-poll')).toBeVisible();
    await expect(page.locator('div.no-js')).toBeHidden();
    await expect(page.getByLabel('Date of change:', { exact: true })).toHaveValue(/^\d{4}-\d{2}-\d{2}$/);
    await expect(result(page)).toBeHidden();
  });

  test('warns as you type', async ({ page }) => {
    await page.getByLabel('Old name:', { exact: true }).fill('Testy McTestface');
    await page.getByLabel('New name:', { exact: true }).fill('Testy McTestface');
    await expect(warnings(page)).toBeVisible();
    await expect(warnings(page)).toContainText('"old name" and "new name" are the same');
    await expect(page.getByLabel('New name:', { exact: true })).toHaveAttribute('aria-invalid', 'true');

    await page.getByLabel('New name:', { exact: true }).fill('Testy Testalot');
    await expect(warnings(page)).toBeHidden();
    await expect(page.getByLabel('New name:', { exact: true })).toHaveAttribute('aria-invalid', 'false');
  });
});

test.describe('generating a deed poll', () => {
  test('produces a result with a title, the next steps and a one-page PDF', async ({ page }) => {
    await fillForm(page);
    await submit(page);

    await expect(result(page)).toBeVisible();
    await expect(page.locator('h1')).toHaveText('Deed Poll for Testy Testalot');
    await expect(page).toHaveTitle('Deed Poll for Testy Testalot');
    await expect(result(page)).toContainText('Your deed poll is ready to print and use');
    await expect(result(page).getByRole('button', { name: 'What do I do next?' })).toHaveAttribute('href', '/next');
    await expect(page.getByRole('button', { name: 'Download PDF' })).toHaveAttribute('download', 'deed-poll.pdf');
    await expect(result(page)).not.toContainText('too long to fit');

    const pdf = await readPdf(page);
    expect(pdf.header).toBe('%PDF-');
    expect(pdf.pages).toBe(1);
    expect(pdf.size).toBeGreaterThan(10_000);
  });

  test('offers the deed text, with the details in the right places', async ({ page }) => {
    await fillForm(page, { ...person, county: 'Oxfordshire' });
    await submit(page);
    await page.getByRole('button', { name: 'Show Text' }).click();

    const text = page.locator('#deed-poll-text');
    await expect(text).toBeVisible();
    await expect(text).toContainText('BY THIS DEED OF CHANGE OF NAME made by myself the undersigned Testy Testalot of 1 High Street, Oxford, OX1 1AA in the County of Oxfordshire formerly known as Testy McTestface, a British Citizen');
    await expect(text).toContainText('SIGNED AS A DEED THIS 1ST DAY OF JANUARY IN THE YEAR 2026');
    await expect(text.locator('strong', { hasText: 'Testy Testalot' }).first()).toBeVisible();
    await expect(text).toContainText('Witty McWitnessface');
    await expect(text).toContainText('3 High Street, Oxford, OX1 1AA');
    await expect(text).not.toContainText('Vaisey');
  });

  test('includes the Vaisey clause when the first name has changed', async ({ page }) => {
    await fillForm(page, { ...person, newName: 'Testify Testalot', firstNameChanged: true });
    await submit(page);
    await page.getByRole('button', { name: 'Show Text' }).click();
    await expect(page.locator('#deed-poll-text')).toContainText('Mr Justice Vaisey in re Parrott, Cox v Parrott');
  });

  test('uses blanks for the signature when told to skip warnings with empty fields', async ({ page }) => {
    await submit(page);
    await expect(warnings(page)).toBeVisible();
    await expect(result(page)).toBeHidden();
    await page.getByLabel('I\'ve read these warnings and want to continue anyway.').check();
    await submit(page);

    await expect(result(page)).toBeVisible();
    await expect(page.locator('h1')).toHaveText('Deed Poll for ________________');
    await page.getByRole('button', { name: 'Show Text' }).click();
    await expect(page.locator('#deed-poll-text')).toContainText('________________');
  });

  test('warns when the PDF will not fit on one page', async ({ page }) => {
    await fillForm(page, { ...person, address: 'A Very Long Road Name, '.repeat(120) });
    await submit(page);
    await expect(result(page)).toContainText('Your PDF deed poll turned out too long to fit onto the page');
  });
});

test.describe('validation on submit', () => {
  test('blocks submission and lists every blank field (except the pre-filled date)', async ({ page }) => {
    await submit(page);
    await expect(result(page)).toBeHidden();
    await expect(warnings(page)).toBeVisible();
    for(const blank of ['old name', 'new name', 'address', 'first witness\'s name', 'first witness\'s address', 'second witness\'s name', 'second witness\'s address']) {
      await expect(warnings(page)).toContainText(`The "${blank}" field is blank.`);
    }
    await expect(warnings(page)).not.toContainText('"date" field is blank'); // it's pre-filled with today
  });

  test('blocks a deed poll whose first name changed without the box being ticked, until acknowledged', async ({ page }) => {
    await fillForm(page, { ...person, newName: 'Testify Testalot' });
    await submit(page);
    await expect(result(page)).toBeHidden();
    await expect(warnings(page)).toContainText('not ticked the "I\'ve changed my first name" box');

    await page.getByLabel('I\'ve read these warnings and want to continue anyway.').check();
    await submit(page);
    await expect(result(page)).toBeVisible();
  });

  test('lets a valid submission straight through', async ({ page }) => {
    await fillForm(page);
    await submit(page);
    await expect(warnings(page)).toBeHidden();
    await expect(result(page)).toBeVisible();
  });
});

test.describe('bookmarking and sharing', () => {
  test('puts the details in the URL, and reopening it recreates the deed poll', async ({ page, context }) => {
    await fillForm(page);
    await submit(page);
    await expect(result(page)).toBeVisible();
    await expect.poll(() => new URL(page.url()).hash.length).toBeGreaterThan(1);

    const reopened = await context.newPage();
    await reopened.goto(page.url());
    await expect(reopened.locator('#deed-poll-result')).toBeVisible();
    await expect(reopened.locator('h1')).toHaveText('Deed Poll for Testy Testalot');
    await expect(reopened.getByLabel('Old name:', { exact: true })).toHaveValue('Testy McTestface');
    await expect(reopened.getByLabel('Second witness\'s address:')).toHaveValue(person.secondWitnessAddress);
  });

  // The hash format must not change, or bookmarks and shared links already out there will stop working
  test('opens a link in the existing hash format', async ({ page }) => {
    const hash = Buffer.from(JSON.stringify({
      oldName: 'Testy McTestface', newName: 'Testy Testalot', firstNameChanged: false, address: '1 High Street, Oxford, OX1 1AA',
      county: '', date: '2026-01-01', firstWitnessName: 'Witty McWitnessface', firstWitnessAddress: '2 High Street',
      secondWitnessName: 'Wendy McWitnessface', secondWitnessAddress: '3 High Street',
    })).toString('base64');
    await page.goto('about:blank'); // a hash-only change wouldn't reload the page, but a shared link is a fresh load
    await page.goto(`/start/#${hash}`);

    await expect(page.locator('#deed-poll-result')).toBeVisible();
    await expect(page.locator('h1')).toHaveText('Deed Poll for Testy Testalot');
    await expect(page.getByLabel('Address:', { exact: true })).toHaveValue('1 High Street, Oxford, OX1 1AA');
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('explains that JavaScript is needed instead of showing the form', async ({ page }) => {
    await expect(page.locator('div.no-js')).toBeVisible();
    await expect(page.locator('div.no-js')).toContainText('requires JavaScript to be enabled');
    await expect(page.locator('form#deed-poll')).toBeHidden();
  });
});

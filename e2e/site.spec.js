import { test, expect } from './fixtures.js'

const pages = [
  ['/', /Free Deed Poll/],
  ['/checklist/', 'Free Deed Poll Checklist'],
  ['/start/', 'Generate your Free Deed Poll'],
  ['/next/', 'Next Steps with your Free Deed Poll'],
  ['/faq/', /Frequently Asked Questions/],
  ['/help/', 'Free Deed Poll Help'],
  ['/privacy/', 'Free Deed Poll Privacy Statement'],
  ['/rejection/', /Free Deed Poll is rejected/],
  ['/video/', 'Free Deed Poll Video Demo'],
];

for(const [path, title] of pages) {
  test(`${path} loads without errors`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('body')).not.toHaveClass(/no-js/);
  });
}

test('the three steps in the navigation lead to the right pages', async ({ page }) => {
  await page.goto('/');
  const nav = page.locator('nav.site-nav');
  await nav.getByRole('link', { name: 'Checklist' }).click();
  await expect(page).toHaveURL(/\/checklist\/$/);
  await nav.getByRole('link', { name: 'Change your name' }).click();
  await expect(page).toHaveURL(/\/start\/$/);
  await nav.getByRole('link', { name: 'Tell people' }).click();
  await expect(page).toHaveURL(/\/next\/$/);
});

test.describe('FAQ', () => {
  // The deed poll form's warnings link to these entries
  for(const id of ['legal-restrictions', 'vaisey', 'change-of-title', 'witnesses', 'pdf-too-long', 'multiple-originals']) {
    test(`deep link to #${id} opens that entry`, async ({ page }) => {
      await page.goto(`/faq/#${id}`);
      await expect(page.locator(`details#${id}`)).toHaveAttribute('open', '');
    });
  }

  test('opening an entry puts it in the URL', async ({ page }) => {
    await page.goto('/faq/');
    await page.locator('details#vaisey > summary').click();
    await expect(page).toHaveURL(/\/faq\/#vaisey$/);
  });
});

test('pages that have moved redirect to the FAQ', async ({ page }) => {
  await page.goto('/free/');
  await expect(page).toHaveURL(/\/faq\/#really-free$/);
});

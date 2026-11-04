import { test as base, expect } from '@playwright/test'

// Every test fails if the page logs a console error or throws, so things like unsupported browser APIs get noticed.
export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    // Keep tests hermetic: nothing outside the site itself (e.g. the embedded YouTube player) is fetched
    const origin = new URL(baseURL).origin;
    await page.route(url => url.origin !== origin, route => route.fulfill({ status: 200, contentType: 'text/html', body: '' }));

    const problems = [];
    page.on('pageerror', error => problems.push(`pageerror: ${error.message}`));
    page.on('console', message => { if(message.type() === 'error') problems.push(`console.error: ${message.text()}`); });
    await use(page);
    expect(problems, 'unexpected errors in the browser').toEqual([]);
  },
});

export { expect };

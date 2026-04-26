/**
 * Cucumber step definitions — Browser (Selenium) steps
 */

import { After, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { Browser, Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';
const HEADLESS = process.env.SELENIUM_HEADLESS !== 'false';

async function getDriver() {
  const opts = new chrome.Options();
  if (HEADLESS) opts.addArguments('--headless=new');
  opts.addArguments('--no-sandbox', '--disable-dev-shm-usage', '--window-size=1920,1080');

  return new Builder().forBrowser(Browser.CHROME).setChromeOptions(opts).build();
}

After(async function () {
  if (this.driver) {
    await this.driver.quit();
    this.driver = null;
  }
});

// ─── Given ────────────────────────────────────────────────────────────

Given('I open the login page in a browser', async function () {
  this.driver = await getDriver();
  await this.driver.get(`${FRONTEND}/login`);
  await this.driver.wait(until.elementLocated(By.id('email')), 10000);
});

// ─── When ─────────────────────────────────────────────────────────────

When('I enter email {string} and password {string}', async function (email, password) {
  await this.driver.findElement(By.id('email')).sendKeys(email);
  await this.driver.findElement(By.id('password')).sendKeys(password);
});

When('I click the login button', async function () {
  await this.driver.findElement(By.css('button[type="submit"]')).click();
  await this.driver.sleep(2000); // wait for navigation
});

// ─── Then ─────────────────────────────────────────────────────────────

Then('I should be redirected to the dashboard', async function () {
  await this.driver.wait(async () => {
    const url = await this.driver.getCurrentUrl();
    return !url.includes('/login');
  }, 10000);

  const url = await this.driver.getCurrentUrl();
  assert.ok(!url.includes('/login'), `Expected redirect away from login, got ${url}`);
});

Then('I should see {string} on the page', async function (text) {
  const body = await this.driver.findElement(By.css('body'));
  const pageText = await body.getText();
  assert.ok(pageText.includes(text), `Expected to see "${text}" on the page`);
});

Then('I should remain on the login page', async function () {
  await this.driver.sleep(2000);
  const url = await this.driver.getCurrentUrl();
  assert.ok(url.includes('/login'), `Expected to remain on login page, got ${url}`);
});

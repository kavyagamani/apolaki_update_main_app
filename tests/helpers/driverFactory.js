/**
 * Selenium WebDriver factory.
 * Builds a Chrome driver (headless by default) shared across E2E tests.
 */

import { Browser, Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import config from './config.js';

/**
 * Create and return a new WebDriver instance.
 * @returns {Promise<import('selenium-webdriver').WebDriver>}
 */
export async function createDriver() {
  const options = new chrome.Options();

  if (config.selenium.headless) {
    options.addArguments('--headless=new');
  }

  options.addArguments(
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--window-size=1920,1080'
  );

  const driver = await new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();

  await driver.manage().setTimeouts({
    implicit: config.selenium.timeout,
    pageLoad: 30000,
    script: 10000,
  });

  return driver;
}

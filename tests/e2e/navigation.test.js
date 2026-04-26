/**
 * Selenium E2E Test — Navigation & Routing
 * Ensures all routes are accessible and navigation links work.
 * @tags e2e, navigation, smoke
 */

import { expect } from 'chai';
import { By } from 'selenium-webdriver';
import config from '../helpers/config.js';
import { createDriver } from '../helpers/driverFactory.js';
import LoginPage from '../pages/LoginPage.js';

describe('E2E › Navigation & Routing', function () {
  /** @type {import('selenium-webdriver').WebDriver} */
  let driver;

  before(async function () {
    driver = await createDriver();

    // Login first to access protected routes
    const loginPage = new LoginPage(driver);
    await loginPage.navigate();
    await loginPage.login(config.users.homeowner.email, config.users.homeowner.password);
    await driver.sleep(2000);
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  const protectedRoutes = [
    { name: 'Dashboard', path: '/', expectedText: 'Dashboard' },
    { name: 'Installations', path: '/installations', expectedText: 'Installation' },
    { name: 'Monitoring', path: '/monitoring', expectedText: 'Monitor' },
    { name: 'Assessment', path: '/assessment', expectedText: 'Assessment' },
  ];

  for (const route of protectedRoutes) {
    it(`@smoke should navigate to ${route.name} (${route.path})`, async function () {
      await driver.get(`${config.frontend.baseUrl}${route.path}`);
      await driver.sleep(1000);

      const body = await driver.findElement(By.css('body'));
      const text = await body.getText();

      expect(text.toLowerCase()).to.include(route.expectedText.toLowerCase());
    });
  }

  it('should redirect unauthenticated users to /login', async function () {
    // Clear localStorage to simulate unauthenticated state
    await driver.executeScript('localStorage.clear()');
    await driver.get(`${config.frontend.baseUrl}/installations`);
    await driver.sleep(1500);

    const url = await driver.getCurrentUrl();
    expect(url).to.include('/login');
  });

  it('should have navigation links in the navbar', async function () {
    // Re-login after clearing storage
    const loginPage = new LoginPage(driver);
    await loginPage.navigate();
    await loginPage.login(config.users.homeowner.email, config.users.homeowner.password);
    await driver.sleep(2000);

    const navLinks = await driver.findElements(By.css('.nav-menu .nav-link'));
    const linkTexts = [];
    for (const link of navLinks) {
      linkTexts.push(await link.getText());
    }

    expect(linkTexts.join(' ').toLowerCase()).to.include('dashboard');
    expect(linkTexts.join(' ').toLowerCase()).to.include('installation');
    expect(linkTexts.join(' ').toLowerCase()).to.include('monitor');
  });
});

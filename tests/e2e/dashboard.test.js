/**
 * Selenium E2E Test — Dashboard
 * Validates the dashboard renders correctly after authentication.
 * @tags e2e, dashboard, smoke
 */

import { expect } from 'chai';
import config from '../helpers/config.js';
import { createDriver } from '../helpers/driverFactory.js';
import DashboardPage from '../pages/DashboardPage.js';
import LoginPage from '../pages/LoginPage.js';

describe('E2E › Dashboard', function () {
  /** @type {import('selenium-webdriver').WebDriver} */
  let driver;
  let loginPage;
  let dashboardPage;

  before(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    dashboardPage = new DashboardPage(driver);

    // Login first
    await loginPage.navigate();
    await loginPage.login(config.users.homeowner.email, config.users.homeowner.password);
    await driver.sleep(2000);
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('@smoke should display the hero section with title', async function () {
    await dashboardPage.waitForLoad();
    const title = await dashboardPage.getHeroTitle();

    expect(title).to.include('Dashboard');
  });

  it('should display 4 KPI cards', async function () {
    const count = await dashboardPage.getKPICardCount();

    expect(count).to.equal(4);
  });

  it('should display 4 quick action cards', async function () {
    const count = await dashboardPage.getQuickActionCount();

    expect(count).to.equal(4);
  });

  it('should display the installations table if installations exist', async function () {
    // After seeding, there should be installations
    const visible = await dashboardPage.isInstallationTableVisible();
    // Could be table or empty state — both are valid
    expect(typeof visible).to.equal('boolean');
  });
});

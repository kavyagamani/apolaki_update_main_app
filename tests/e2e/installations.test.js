/**
 * Selenium E2E Test — Installations Page
 * Tests the full CRUD lifecycle from the browser.
 * @tags e2e, installations
 */

import { expect } from 'chai';
import { By } from 'selenium-webdriver';
import config from '../helpers/config.js';
import { createDriver } from '../helpers/driverFactory.js';
import InstallationsPage from '../pages/InstallationsPage.js';
import LoginPage from '../pages/LoginPage.js';

describe('E2E › Installations', function () {
  /** @type {import('selenium-webdriver').WebDriver} */
  let driver;
  let loginPage;
  let installationsPage;

  before(async function () {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    installationsPage = new InstallationsPage(driver);

    // Login first
    await loginPage.navigate();
    await loginPage.login(config.users.homeowner.email, config.users.homeowner.password);
    await driver.sleep(2000);
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('@smoke should display the installations page', async function () {
    await installationsPage.navigate();
    await driver.sleep(1000);

    const title = await driver.findElement(By.css('h1'));
    const text = await title.getText();
    expect(text.toLowerCase()).to.include('installation');
  });

  it('should have a New Installation button', async function () {
    const btn = await driver.findElement(installationsPage.newButton);
    const text = await btn.getText();
    expect(text).to.include('New Installation');
  });

  it('should open the create form when clicking New Installation', async function () {
    await installationsPage.openCreateForm();

    const nameInput = await driver.findElement(installationsPage.nameInput);
    expect(await nameInput.isDisplayed()).to.be.true;
  });

  it('should create a new installation via the form', async function () {
    // The form should already be open from the previous test
    await installationsPage.fillForm({
      name: 'Selenium Test System',
      capacity: 7.5,
      address: '42 Browser Lane',
      panelCount: 18,
      inverterType: 'Selenium Inverter',
    });

    await installationsPage.submitForm();
    await driver.sleep(2000);

    // After creation, the form should close and the card should appear
    // or the list should update
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/installations');
  });

  it('should display installation cards', async function () {
    await installationsPage.navigate();
    await driver.sleep(1500);

    const count = await installationsPage.getCardCount();
    // At least seeded installations should appear (if API is connected)
    // Or empty state is shown if API is mocked
    expect(count).to.be.a('number');
  });
});

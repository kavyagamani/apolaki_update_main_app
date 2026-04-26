/**
 * Selenium E2E Test — Signup Flow
 * @tags e2e, auth
 */

import { expect } from 'chai';
import { createDriver } from '../helpers/driverFactory.js';
import SignupPage from '../pages/SignupPage.js';

describe('E2E › Signup Flow', function () {
  /** @type {import('selenium-webdriver').WebDriver} */
  let driver;
  let signupPage;

  before(async function () {
    driver = await createDriver();
    signupPage = new SignupPage(driver);
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('should display the signup form', async function () {
    await signupPage.navigate();

    const el = await driver.findElement(signupPage.firstNameInput);
    expect(await el.isDisplayed()).to.be.true;
  });

  it('should register a new user and redirect to dashboard', async function () {
    await signupPage.navigate();

    const unique = `e2e_${Date.now()}@apolaki.solar`;
    await signupPage.signup({
      firstName: 'E2E',
      lastName: 'TestUser',
      email: unique,
      password: 'E2ETest@123!',
    });

    // Wait for redirect
    await driver.sleep(3000);
    const currentUrl = await driver.getCurrentUrl();
    // Should navigate away from signup on success
    expect(currentUrl).to.not.include('/signup');
  });

  it('should have a link to the login page', async function () {
    await signupPage.navigate();

    const loginLink = await driver.findElement(signupPage.loginLink);
    expect(await loginLink.isDisplayed()).to.be.true;
    expect(await loginLink.getText()).to.include('Login');
  });
});

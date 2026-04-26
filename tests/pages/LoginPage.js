/**
 * Selenium Page Object — Login Page
 * Encapsulates all locators and actions for the login screen.
 */

import { By, until } from 'selenium-webdriver';
import config from '../helpers/config.js';

export default class LoginPage {
  /** @param {import('selenium-webdriver').WebDriver} driver */
  constructor(driver) {
    this.driver = driver;
    this.url = `${config.frontend.baseUrl}/login`;

    // Locators
    this.emailInput    = By.id('email');
    this.passwordInput = By.id('password');
    this.submitButton  = By.css('button[type="submit"]');
    this.errorAlert    = By.css('.alert-error, .alert.alert-error');
    this.signupLink    = By.css('a[href="/signup"]');
  }

  async navigate() {
    await this.driver.get(this.url);
    await this.driver.wait(until.elementLocated(this.emailInput), 10000);
  }

  async login(email, password) {
    const emailEl = await this.driver.findElement(this.emailInput);
    await emailEl.clear();
    await emailEl.sendKeys(email);

    const passEl = await this.driver.findElement(this.passwordInput);
    await passEl.clear();
    await passEl.sendKeys(password);

    const btn = await this.driver.findElement(this.submitButton);
    await btn.click();
  }

  async getErrorMessage() {
    try {
      const el = await this.driver.wait(until.elementLocated(this.errorAlert), 5000);
      return await el.getText();
    } catch {
      return null;
    }
  }

  async isDisplayed() {
    try {
      await this.driver.wait(until.elementLocated(this.emailInput), 5000);
      return true;
    } catch {
      return false;
    }
  }
}

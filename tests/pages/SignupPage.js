/**
 * Selenium Page Object — Signup Page
 */

import { By, until } from 'selenium-webdriver';
import config from '../helpers/config.js';

export default class SignupPage {
  /** @param {import('selenium-webdriver').WebDriver} driver */
  constructor(driver) {
    this.driver = driver;
    this.url = `${config.frontend.baseUrl}/signup`;

    this.firstNameInput     = By.id('firstName');
    this.lastNameInput      = By.id('lastName');
    this.emailInput         = By.id('email');
    this.passwordInput      = By.id('password');
    this.confirmPassInput   = By.id('confirmPassword');
    this.submitButton       = By.css('button[type="submit"]');
    this.errorAlert         = By.css('.alert-error, .alert.alert-error');
    this.loginLink          = By.css('a[href="/login"]');
  }

  async navigate() {
    await this.driver.get(this.url);
    await this.driver.wait(until.elementLocated(this.emailInput), 10000);
  }

  async signup({ firstName, lastName, email, password }) {
    await this.driver.findElement(this.firstNameInput).sendKeys(firstName);
    await this.driver.findElement(this.lastNameInput).sendKeys(lastName);
    await this.driver.findElement(this.emailInput).sendKeys(email);
    await this.driver.findElement(this.passwordInput).sendKeys(password);
    await this.driver.findElement(this.confirmPassInput).sendKeys(password);
    await this.driver.findElement(this.submitButton).click();
  }
}

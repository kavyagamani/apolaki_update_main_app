/**
 * Selenium Page Object — Installations Page
 */

import { By, until } from 'selenium-webdriver';
import config from '../helpers/config.js';

export default class InstallationsPage {
  /** @param {import('selenium-webdriver').WebDriver} driver */
  constructor(driver) {
    this.driver = driver;
    this.url = `${config.frontend.baseUrl}/installations`;

    // Locators
    this.pageTitle       = By.css('h1');
    this.newButton       = By.css('button.btn-primary');
    this.nameInput       = By.id('name');
    this.capacityInput   = By.id('capacity');
    this.addressInput    = By.id('address');
    this.panelInput      = By.id('panelCount');
    this.inverterInput   = By.id('inverterType');
    this.submitButton    = By.css('form button[type="submit"]');
    this.cards           = By.css('.installation-card');
    this.deleteButtons   = By.css('.btn-danger');
    this.emptyState      = By.css('.empty-state');
  }

  async navigate() {
    await this.driver.get(this.url);
    await this.driver.wait(until.elementLocated(this.pageTitle), 10000);
  }

  async getCardCount() {
    const cards = await this.driver.findElements(this.cards);
    return cards.length;
  }

  async openCreateForm() {
    const btn = await this.driver.findElement(this.newButton);
    await btn.click();
    await this.driver.wait(until.elementLocated(this.nameInput), 5000);
  }

  async fillForm({ name, capacity, address, panelCount, inverterType }) {
    await this.driver.findElement(this.nameInput).sendKeys(name);
    if (capacity) {
      const cap = await this.driver.findElement(this.capacityInput);
      await cap.clear();
      await cap.sendKeys(String(capacity));
    }
    await this.driver.findElement(this.addressInput).sendKeys(address);
    if (panelCount) {
      const panel = await this.driver.findElement(this.panelInput);
      await panel.clear();
      await panel.sendKeys(String(panelCount));
    }
    if (inverterType) {
      await this.driver.findElement(this.inverterInput).sendKeys(inverterType);
    }
  }

  async submitForm() {
    const btn = await this.driver.findElement(this.submitButton);
    await btn.click();
  }

  async hasEmptyState() {
    try {
      await this.driver.findElement(this.emptyState);
      return true;
    } catch {
      return false;
    }
  }
}

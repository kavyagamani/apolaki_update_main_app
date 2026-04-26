/**
 * Selenium Page Object — Dashboard Page
 */

import { By, until } from 'selenium-webdriver';
import config from '../helpers/config.js';

export default class DashboardPage {
  /** @param {import('selenium-webdriver').WebDriver} driver */
  constructor(driver) {
    this.driver = driver;
    this.url = `${config.frontend.baseUrl}/`;

    // Locators
    this.heroTitle       = By.css('.hero-title');
    this.heroSubtitle    = By.css('.hero-subtitle');
    this.kpiCards        = By.css('.kpi-card');
    this.installTable    = By.css('.modern-table');
    this.navBrand        = By.css('.nav-brand');
    this.logoutButton    = By.css('button');
    this.quickActions    = By.css('.action-card');
    this.userEmail       = By.css('.nav-user span');
  }

  async navigate() {
    await this.driver.get(this.url);
    await this.driver.wait(until.elementLocated(this.heroTitle), 10000);
  }

  async getHeroTitle() {
    const el = await this.driver.findElement(this.heroTitle);
    return await el.getText();
  }

  async getKPICardCount() {
    const cards = await this.driver.findElements(this.kpiCards);
    return cards.length;
  }

  async getQuickActionCount() {
    const cards = await this.driver.findElements(this.quickActions);
    return cards.length;
  }

  async isInstallationTableVisible() {
    try {
      await this.driver.findElement(this.installTable);
      return true;
    } catch {
      return false;
    }
  }

  async getDisplayedEmail() {
    try {
      const el = await this.driver.findElement(this.userEmail);
      return await el.getText();
    } catch {
      return null;
    }
  }

  async waitForLoad() {
    await this.driver.wait(until.elementLocated(this.heroTitle), 15000);
  }
}

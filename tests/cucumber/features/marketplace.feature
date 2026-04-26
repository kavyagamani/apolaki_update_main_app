Feature: Marketplace
  As a user of the Apolaki Solar Platform
  I want to browse the solar product marketplace
  So that I can find and compare equipment

  @smoke
  Scenario: List all marketplace products
    Given the API service is running
    When I request all marketplace products
    Then I should receive a 200 status code
    And the response should contain at least 10 products

  Scenario: Filter products by category
    Given the API service is running
    When I request products in category "panels"
    Then I should receive a 200 status code
    And all returned products should have category "panels"

  Scenario: Retrieve a specific product
    Given the API service is running
    When I request product "20000000-0000-4000-a000-000000000001"
    Then I should receive a 200 status code
    And the response data should have property "name"
    And the response data should have property "price"

  Scenario: Non-existent product returns 404
    Given the API service is running
    When I request product "99999999-9999-9999-9999-999999999999"
    Then I should receive a 404 status code

Feature: Solar Installations Management
  As a homeowner on the Apolaki Solar Platform
  I want to manage my solar installations
  So that I can track my energy systems

  Background:
    Given the API service is running
    And I am logged in as "homeowner@apolaki.solar" with password "Solar@Home1!"

  @smoke
  Scenario: List all installations for a user
    When I request installations for user "00000000-0000-4000-a000-000000000002"
    Then I should receive a 200 status code
    And the response should contain a list of installations

  Scenario: Retrieve a specific installation
    When I request installation "10000000-0000-4000-a000-000000000001"
    Then I should receive a 200 status code
    And the response data should have property "name"

  Scenario: Create a new installation
    When I create an installation with:
      | name            | Test Cucumber Install     |
      | address         | 123 Cucumber Lane         |
      | city            | Manila                    |
      | state           | Metro Manila              |
      | capacity        | 12.5                      |
      | panelCount      | 30                        |
      | inverterType    | Cucumber Inverter 12K     |
    Then I should receive a 201 status code
    And the response data should have property "name" equal to "Test Cucumber Install"

  Scenario: Update an installation
    Given I create an installation with name "Update Me"
    When I update the installation name to "Updated by Cucumber"
    Then I should receive a 200 status code

  Scenario: Retrieve non-existent installation returns 404
    When I request installation "99999999-9999-9999-9999-999999999999"
    Then I should receive a 404 status code

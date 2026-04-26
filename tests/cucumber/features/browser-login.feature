Feature: End-to-End Login via Browser
  As a user of the Apolaki Solar Platform
  I want to log in through the web UI
  So that I can access my dashboard

  @smoke @e2e
  Scenario: Successful browser login
    Given I open the login page in a browser
    When I enter email "homeowner@apolaki.solar" and password "Solar@Home1!"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see "Dashboard" on the page

  @e2e
  Scenario: Failed browser login shows error
    Given I open the login page in a browser
    When I enter email "invalid@test.com" and password "WrongPassword!"
    And I click the login button
    Then I should remain on the login page

Feature: User Authentication
  As a user of the Apolaki Solar Platform
  I want to sign up, log in, and manage my session
  So that I can access the platform securely

  @smoke
  Scenario: Successful login with valid credentials
    Given the API service is running
    When I login with email "homeowner@apolaki.solar" and password "Solar@Home1!"
    Then I should receive a 200 status code
    And the response should contain a JWT token
    And the response should contain user details

  Scenario: Failed login with invalid password
    Given the API service is running
    When I login with email "homeowner@apolaki.solar" and password "WrongPassword!"
    Then I should receive a 401 status code
    And the response should contain an error message

  Scenario: Failed login with non-existent user
    Given the API service is running
    When I login with email "ghost@nowhere.com" and password "Whatever@1!"
    Then I should receive a 401 status code

  Scenario: Signup with valid details
    Given the API service is running
    When I signup with email "cucumber_<timestamp>@apolaki.solar" and password "CucumberTest@1!"
    Then I should receive a 201 status code
    And the response should contain a JWT token

  Scenario: Signup with duplicate email
    Given the API service is running
    And a user with email "homeowner@apolaki.solar" already exists
    When I signup with email "homeowner@apolaki.solar" and password "DuplicateTest@1!"
    Then I should receive a 409 status code

  Scenario: Login with missing fields
    Given the API service is running
    When I login with empty credentials
    Then I should receive a 400 status code

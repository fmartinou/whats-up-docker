Feature: WUD UI Exposure

  Scenario: WUD must expose an Image view
    When I GET /images
    Then response code should be 200
    And response header Content-Type should be text/html

  Scenario: WUD must expose a Trigger view
    When I GET /triggers
    Then response code should be 200
    And response header Content-Type should be text/html

  Scenario: WUD must expose a Trigger view
    When I GET /watchers
    Then response code should be 200
    And response header Content-Type should be text/html

  Scenario: WUD must redirect to the home page if page not found
    When I GET /nowhere
    Then response code should be 302

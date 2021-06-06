Feature: WUD UI Exposure

  Scenario: WUD must serve the ui
    When I GET /
    Then response code should be 200
    And response header Content-Type should be text/html

  Scenario: WUD must redirect to the ui if resource not found
    When I GET /nowhere
    Then response code should be 200
    And response header Content-Type should be text/html

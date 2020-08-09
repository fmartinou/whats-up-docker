Feature: WUD Log API Exposure
  Scenario: WUD must allow to get Log state
    When I GET /api/log
    Then response code should be 200
    And response body should be valid json
    And response body path $.level should be info

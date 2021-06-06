Feature: WUD App infos API Exposure
  Scenario: WUD must allow to get App infos
    When I GET /api/app
    Then response code should be 200
    And response body should be valid json
    And response body path $.name should be wud

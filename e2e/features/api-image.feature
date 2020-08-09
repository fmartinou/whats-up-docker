Feature: WUD Image API Exposure

  Scenario: WUD must allow to get all Images
    When I GET /api/images
    Then response code should be 200
    And response body should be valid json
    And response body path $ should be of type array

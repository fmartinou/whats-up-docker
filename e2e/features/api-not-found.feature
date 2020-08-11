Feature: WUD API 404 management

  Scenario: WUD must respond 404 if no API endpoint matches
    When I GET /api/nowhere
    Then response code should be 404

Feature: WUD Image API Exposure

  Scenario: WUD must allow to get all Images
    When I GET /api/images
    Then response code should be 200
    And response body should be valid json
    And response body path $ should be of type array with length 1

  Scenario: WUD must allow to get nginx image
    Given I GET /api/images
    And I store the value of body path $[0].id as imageId in scenario scope
    When I GET /api/images/`imageId`
    Then response code should be 200
    And response body should be valid json
    And response body path $.watcher should be docker.local
    And response body path $.registry should be hub
    And response body path $.registryUrl should be https://hub.docker.com
    And response body path $.organization should be library
    And response body path $.image should be nginx
    And response body path $.version should be 1.10-alpine
    And response body path $.architecture should be amd64
    And response body path $.os should be linux
    And response body path $.size should be 54042627
    And response body path $.isSemver should be true

  Scenario: WUD must allow to trigger a watch on nginx image
    Given I GET /api/images
    And I store the value of body path $[0].id as imageId in scenario scope
    When I POST to /api/images/`imageId`/watch
    Then response code should be 200
    And response body should be valid json
    And response body path $.result.newVersion should be 1.19-alpine
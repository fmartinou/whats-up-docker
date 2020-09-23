Feature: WUD Image API Exposure

    When I GET /api/images
    Then response code should be 200
    And response body should be valid json
    And response body path $ should be of type array with length 8

  Scenario Outline: WUD must allow to get all Images
    When I GET /api/images
    Then response code should be 200
    And response body should be valid json
    And response body path $ should be of type array with length 11
    And response body path $[<index>].registry should be <registry>
    And response body path $[<index>].registryUrl should be <registryUrl>
    And response body path $[<index>].image should be <image>
    And response body path $[<index>].version should be <version>
    And response body path $[<index>].result.newVersion should be <newVersion>
    Examples:
      | index | registry | registryUrl                                             | image          | version     | newVersion  |
      | 0     | acr      | https://wudtest.azurecr.io/v2                           | sub/sub/test   | 1.0.0       | 2.0.0       |
      | 1     | acr      | https://wudtest.azurecr.io/v2                           | sub/test       | 1.0.0       | 2.0.0       |
      | 2     | acr      | https://wudtest.azurecr.io/v2                           | test           | 1.0.0       | 2.0.0       |
      | 3     | ecr      | https://229211676173.dkr.ecr.eu-west-1.amazonaws.com/v2 | sub/sub/test   | 1.0.0       | 2.0.0       |
      | 4     | ecr      | https://229211676173.dkr.ecr.eu-west-1.amazonaws.com/v2 | sub/test       | 1.0.0       | 2.0.0       |
      | 5     | ecr      | https://229211676173.dkr.ecr.eu-west-1.amazonaws.com/v2 | test           | 1.0.0       | 2.0.0       |
      | 6     | gcr      | https://gcr.io/v2                                       | sub/sub/test   | 1.0.0       | 2.0.0       |
      | 7     | gcr      | https://gcr.io/v2                                       | sub/test       | 1.0.0       | 2.0.0       |
      | 8     | gcr      | https://gcr.io/v2                                       | test           | 1.0.0       | 2.0.0       |
      | 9     | hub      | https://registry-1.docker.io/v2                         | fmartinou/test | 1.0.0       | 2.0.0       |
      | 10    | hub      | https://registry-1.docker.io/v2                         | library/nginx  | 1.10-alpine | 1.19-alpine |

  Scenario: WUD must allow to get first image
    Given I GET /api/images
    And I store the value of body path $[0].id as imageId in scenario scope
    When I GET /api/images/`imageId`
    Then response code should be 200
    And response body should be valid json
    And response body path $.watcher should be docker.local
    And response body path $.registry should be acr
    And response body path $.registryUrl should be https://wudtest.azurecr.io/v2
    And response body path $.image should be sub/sub/test
    And response body path $.version should be 1.0.0
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
    And response body path $.result.newVersion should be 2.0.0
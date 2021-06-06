Feature: WUD Container API Exposure

    When I GET /api/containers
    Then response code should be 200
    And response body should be valid json
    And response body path $ should be of type array with length 8

  Scenario Outline: WUD must allow to get all containers
    When I GET /api/containers
    Then response code should be 200
    And response body should be valid json
    And response body path $ should be of type array with length 5
    And response body path $[<index>].image.registry.name should be <registry>
    And response body path $[<index>].image.registry.url should be <registryUrl>
    And response body path $[<index>].image.name should be <image>
    And response body path $[<index>].image.tag.value should be <tag>
    And response body path $[<index>].result.tag should be <resultTag>
    Examples:
      | index | registry | registryUrl                                             | image          | tag         | resultTag   |
      | 0     | ecr      | https://229211676173.dkr.ecr.eu-west-1.amazonaws.com/v2 | sub/sub/test   | 1.0.0       | 2.0.0       |
      | 1     | ecr      | https://229211676173.dkr.ecr.eu-west-1.amazonaws.com/v2 | sub/test       | 1.0.0       | 2.0.0       |
      | 2     | ecr      | https://229211676173.dkr.ecr.eu-west-1.amazonaws.com/v2 | test           | 1.0.0       | 2.0.0       |
      | 3     | hub      | https://registry-1.docker.io/v2                         | library/nginx  | 1.10-alpine | 1.21-alpine |
      | 4     | hub      | https://registry-1.docker.io/v2                         | fmartinou/test | 1.0.0       | 2.0.0       |

  Scenario: WUD must allow to get first container
    Given I GET /api/containers
    And I store the value of body path $[0].id as containerId in scenario scope
    When I GET /api/containers/`containerId`
    Then response code should be 200
    And response body should be valid json
    And response body path $.watcher should be local
    And response body path $.image.registry.name should be ecr
    And response body path $.image.registry.url should be https://229211676173.dkr.ecr.eu-west-1.amazonaws.com/v2
    And response body path $.image.name should be sub/sub/test
    And response body path $.image.tag.value should be 1.0.0
    And response body path $.image.architecture should be amd64
    And response body path $.image.os should be linux
    And response body path $.image.tag.semver should be true

  Scenario: WUD must allow to trigger a watch on nginx container
    Given I GET /api/containers
    And I store the value of body path $[0].id as containerId in scenario scope
    When I POST to /api/containers/`containerId`/watch
    Then response code should be 200
    And response body should be valid json
    And response body path $.result.tag should be 2.0.0
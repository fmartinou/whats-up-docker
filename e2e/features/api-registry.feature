Feature: WUD Registry API Exposure

  Scenario: WUD must allow to get all Registries
    When I GET /api/registries
    Then response code should be 200
    And response body should be valid json
    And response body path $ should be of type array with length 3
    And response body path $[0].id should be ecr
    And response body path $[0].type should be ecr
    And response body path $[0].name should be ecr
    And response body path $[0].configuration.region should be eu-west-1
    And response body path $[0].configuration.accesskeyid should be .\*.*.
    And response body path $[0].configuration.secretaccesskey should be .\*.*.
    And response body path $[1].configuration.clientemail should be gcr@wud-test.iam.gserviceaccount.com
    And response body path $[1].configuration.privatekey should be .\*.*.
    And response body path $[2].id should be hub
    And response body path $[2].type should be hub
    And response body path $[2].name should be hub
    And response body path $[2].configuration.login should be fmartinou
    And response body path $[2].configuration.token should be .\*.*.

  Scenario: WUD must allow to get specific Registry state
    When I GET /api/registries/hub
    Then response code should be 200
    And response body should be valid json
    And response body path $.id should be hub
    And response body path $.type should be hub
    And response body path $.name should be hub
    And response body path $.configuration.login should be fmartinou
    And response body path $.configuration.token should be .\*.*.

Feature: Prometheus exposure

  Scenario: WUD must expose prometheus metrics
    When I GET /metrics
    Then response code should be 200
    And response body should contain wud_watcher_total
    And response body should contain wud_registry_response
    And response body should contain wud_trigger_count
    And response body should contain process_cpu_user_seconds_total
    And response body should contain nodejs_eventloop_lag_seconds

    And response body should contain wud_images{registry="hub"
    And response body should contain wud_images{registry="hub"


  Scenario Outline: WUD must expose watched images
    When I GET /metrics
    Then response code should be 200
    And response body should contain registry="<registry>"
    And response body should contain registry_url="<registryUrl>"
    And response body should contain image="<image>"
    And response body should contain tag="<tag>"
    And response body should contain result_tag="<resultTag>"
    Examples:
      | registry | registryUrl                                             | image          | tag         | resultTag   |
      | ecr      | https://229211676173.dkr.ecr.eu-west-1.amazonaws.com/v2 | sub/sub/test   | 1.0.0       | 2.0.0       |
      | ecr      | https://229211676173.dkr.ecr.eu-west-1.amazonaws.com/v2 | sub/test       | 1.0.0       | 2.0.0       |
      | ecr      | https://229211676173.dkr.ecr.eu-west-1.amazonaws.com/v2 | test           | 1.0.0       | 2.0.0       |
      | hub      | https://registry-1.docker.io/v2                         | fmartinou/test | 1.0.0       | 2.0.0       |
      | hub      | https://registry-1.docker.io/v2                         | library/nginx  | 1.10-alpine | 1.20-alpine |

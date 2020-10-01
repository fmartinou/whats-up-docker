Feature: Prometheus exposure
    Scenario: WUD must expose prometheus metrics
    When I GET /metrics
    Then response code should be 200
    And response body should contain wud_watcher_total
    And response body should contain wud_registry_response
    And response body should contain wud_trigger_count
    And response body should contain process_cpu_user_seconds_total
    And response body should contain nodejs_eventloop_lag_seconds

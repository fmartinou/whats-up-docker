Feature: WUD Container API Exposure
    When I GET /api/containers
    Then response code should be 200
    And response body should be valid json
    And response body path $ should be of type array with length 18

  Scenario Outline: WUD must allow to get all containers
    When I GET /api/containers
    Then response code should be 200
    And response body should be valid json
    And response body path $[<index>].name should be <containerName>
    And response body path $[<index>].status should be running
    And response body path $[<index>].image.registry.name should be <registry>
    And response body path $[<index>].image.registry.url should be <registryUrl>
    And response body path $[<index>].image.name should be <imageName>
    And response body path $[<index>].image.tag.value should be <tag>
    And response body path $[<index>].result.tag should be <resultTag>
    And response body path $[<index>].updateAvailable should be <updateAvailable>
    Examples:
      | index | containerName            | registry | registryUrl                                             | imageName                    | tag              | resultTag        | updateAvailable |
      | 0     | ecr_sub_sub_test         | ecr      | https://229211676173.dkr.ecr.eu-west-1.amazonaws.com/v2 | sub/sub/test                 | 1.0.0            | 2.0.0            | true            |
      | 1     | ecr_sub_test             | ecr      | https://229211676173.dkr.ecr.eu-west-1.amazonaws.com/v2 | sub/test                     | 1.0.0            | 2.0.0            | true            |
      | 2     | ecr_test                 | ecr      | https://229211676173.dkr.ecr.eu-west-1.amazonaws.com/v2 | test                         | 1.0.0            | 2.0.0            | true            |
      | 3     | ghcr_radarr              | ghcr     | https://ghcr.io/v2                                      | linuxserver/radarr           | 3.2.1.5070-ls105 |4.1.0.6175-ls143 | true            |
      | 4     | hub_homeassistant_202161 | hub      | https://registry-1.docker.io/v2                         | homeassistant/home-assistant | 2021.6.1         | 2022.6.6        | true            |
      | 5     | hub_homeassistant_latest | hub      | https://registry-1.docker.io/v2                         | homeassistant/home-assistant | latest           | latest           | false           |
      | 6     | hub_nginx_120            | hub      | https://registry-1.docker.io/v2                         | library/nginx                | 1.20-alpine      | 1.22-alpine      | true            |
      | 7     | hub_nginx_latest         | hub      | https://registry-1.docker.io/v2                         | library/nginx                | latest           | latest           | true            |
      | 8     | hub_omnidb_latest        | hub      | https://registry-1.docker.io/v2                         | omnidbteam/omnidb            | latest           | latest           | false           |
      | 9     | hub_pihole_57            | hub      | https://registry-1.docker.io/v2                         | pihole/pihole                | v5.7             | v5.8.1           | true            |
      | 10    | hub_pihole_latest        | hub      | https://registry-1.docker.io/v2                         | pihole/pihole                | latest           | latest           | false           |
      | 11    | hub_pyload_latest        | hub      | https://registry-1.docker.io/v2                         | writl/pyload                 | latest           | latest           | false           |
      | 12    | hub_traefik_245          | hub      | https://registry-1.docker.io/v2                         | library/traefik              | 2.4.5            | 2.7.1            | true            |
      | 13    | hub_traefik_latest       | hub      | https://registry-1.docker.io/v2                         | library/traefik              | latest           | latest           | false           |
      | 14    | hub_vaultwarden_1222     | hub      | https://registry-1.docker.io/v2                         | vaultwarden/server           | 1.25.0-alpine    | 1.25.0-alpine    | false           |
      | 15    | hub_vaultwarden_latest   | hub      | https://registry-1.docker.io/v2                         | vaultwarden/server           | latest           | latest           | false           |
      | 16    | hub_youtubedb_latest     | hub      | https://registry-1.docker.io/v2                         | jeeaaasustest/youtube-dl     | latest           | latest           | false           |
      | 17    | lscr_radarr              | lscr     | https://lscr.io/v2                                      | linuxserver/radarr           | 3.2.1.5070-ls105 |4.1.0.6175-ls143 | true            |
      | 18    | quay_prometheus          | quay     | https://quay.io/v2                                      | prometheus/prometheus        | v2.30.0          |v2.36.2          | true            |

  Scenario: WUD must allow to get a container with semver
    Given I GET /api/containers
    And I store the value of body path $[0].id as containerId in scenario scope
    When I GET /api/containers/`containerId`
    Then response code should be 200
    And response body should be valid json
    And response body path $.watcher should be local
    And response body path $.name should be ecr_sub_sub_test
    And response body path $.image.registry.name should be ecr
    And response body path $.image.registry.url should be https://229211676173.dkr.ecr.eu-west-1.amazonaws.com/v2
    And response body path $.image.name should be sub/sub/test
    And response body path $.image.tag.value should be 1.0.0
    And response body path $.image.architecture should be amd64
    And response body path $.image.os should be linux
    And response body path $.image.tag.semver should be true
    And response body path $.result.tag should be 2.0.0
    And response body path $.updateAvailable should be true

  Scenario: WUD must allow to get a container with digest
    Given I GET /api/containers
    And I store the value of body path $[7].id as containerId in scenario scope
    When I GET /api/containers/`containerId`
    Then response code should be 200
    And response body should be valid json
    And response body path $.watcher should be local
    And response body path $.name should be hub_nginx_latest
    And response body path $.image.registry.name should be hub
    And response body path $.image.registry.url should be https://registry-1.docker.io/v2
    And response body path $.image.name should be library/nginx
    And response body path $.image.tag.value should be latest
    And response body path $.image.architecture should be amd64
    And response body path $.image.os should be linux
    And response body path $.image.tag.value should be latest
    And response body path $.image.tag.semver should be false
    And response body path $.image.digest.value should be sha256:f94d6dd9b5761f33a21bb92848a1f70ea11a1c15f3a142c19a44ea3a4c545a4d
    And response body path $.result.tag should be latest
    And response body path $.result.digest should be sha256:25dedae0aceb6b4fe5837a0acbacc6580453717f126a095aa05a3c6fcea14dd4
    And response body path $.updateAvailable should be true

  Scenario: WUD must allow to get a container with its link
    Given I GET /api/containers
    And I store the value of body path $[4].id as containerId in scenario scope
    When I GET /api/containers/`containerId`
    Then response code should be 200
    And response body should be valid json
    And response body path $.link should be https://github.com/home-assistant/core/releases/tag/2021.6.1
    And response body path $.result.link should be https://github.com/home-assistant/core/releases/tag/2022.6.6

  Scenario: WUD must allow to trigger a watch on a container
    Given I GET /api/containers
    And I store the value of body path $[0].id as containerId in scenario scope
    When I POST to /api/containers/`containerId`/watch
    Then response code should be 200
    And response body should be valid json
    And response body path $.result.tag should be 2.0.0

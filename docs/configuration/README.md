# Configuration
WUD is relying on Environment Variables and [Docker labels](https://docs.docker.com/config/labels-custom-metadata/) to configure all the components.

Please find below the documentation for each of them:
> [**Authentication**](/configuration/authentications/)

> [**Logs**](/configuration/logs/)

> [**Registries**](/configuration/registries/)

> [**Storage**](/configuration/storage/)

> [**Timezone**](/configuration/timezone/)

> [**Triggers**](/configuration/triggers/)

> [**watchers**](/configuration/watchers/)

## Complete example

```yaml
version: '3'

services:

  # Valid semver following by os name
  vaultwarden:
    image: vaultwarden/server:1.22.1-alpine
    container_name: bitwarden
    labels:
      - 'wud.tag.include=^\d+\.\d+\.\d+-alpine$$'
      - 'wud.link.template=https://github.com/dani-garcia/vaultwarden/releases/tag/$${major}.$${minor}.$${patch}'

  # Valid semver following by an build number (linux server style)
  duplicati:
    image: linuxserver/duplicati:v2.0.6.3-2.0.6.3_beta_2021-06-17-ls104
    container_name: duplicati
    labels:
      - 'wud.tag.include=^v\d+\.\d+\.\d+\.\d+-\d+\.\d+\.\d+\.\d+.*$$'

  # Valid calver
  homeassistant:
    image: homeassistant/home-assistant:2021.7.1
    container_name: homeassistant
    labels:
      - 'wud.tag.include=^\d+\.\d+\.\d+$$'
      - 'wud.link.template=https://github.com/home-assistant/core/releases/tag/$${major}.$${minor}.$${patch}'

  # Valid semver with a leading v
  pihole:
    image: pihole/pihole:v5.8.1
    container_name: pihole
    labels:
      - 'wud.tag.include=^v\d+\.\d+\.\d+$$'
      - 'wud.link.template=https://github.com/pi-hole/FTL/releases/tag/v$${major}.$${minor}.$${patch}'

  # Mutable tag (latest) with digest tracking
  pyload:
    image: writl/pyload:latest
    container_name: pyload
    labels:
      - 'wud.tag.include=latest'
      - 'wud.watch.digest=true'

  # Wud self tracking :)
  whatsupdocker:
    image: fmartinou/whats-up-docker:5.1.0
    container_name: wud
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /opt/wud/store:/store
    healthcheck:
      test: wget --no-verbose --tries=1 --no-check-certificate --spider http://localhost:3000
      interval: 10s
      timeout: 10s
      retries: 3
      start_period: 10s       
    labels:
      - 'wud.tag.include=^\d+\.\d+\.\d+$$'
      - 'wud.link.template=https://github.com/fmartinou/whats-up-docker/releases/tag/$${major}.$${minor}.$${patch}'
```
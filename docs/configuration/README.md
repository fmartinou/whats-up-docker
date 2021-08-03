# Configuration
WUD is relying on Environment Variables and [Docker labels](https://docs.docker.com/config/labels-custom-metadata/) to configure all the components.

Please find below the documentation for each of them:
- [Logs](/configuration/logs/)
- [Registries](/configuration/registries/)
- [Storage](/configuration/storage/)
- [Triggers](/configuration/triggers/)
- [watchers](/configuration/watchers/)

## Complete example

```yaml
version: '3'

services:

  # Valid semver following by os name
  bitwarden:
    image: vaultwarden/server:1.22.1-alpine
    container_name: bitwarden
    labels:
      - 'wud.tag.include=^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)-alpine$$'

  # Valid semver following by an build number (linux server style)
  duplicati:
    image: linuxserver/duplicati:v2.0.6.3-2.0.6.3_beta_2021-06-17-ls104
    container_name: duplicati
    labels:
      - 'wud.tag.include=^v[0-9]\d*\.[0-9]\d*\.[0-9]\d*\.[0-9]\d*-[0-9]\d*\.[0-9]\d*\.[0-9]\d*\.[0-9]\d*.*$$'

  # Valid calver
  homeassistant:
    image: homeassistant/home-assistant:2021.7.1
    container_name: homeassistant
    labels:
      - 'wud.tag.include=^([0-9]\d*)\.([0-9]\d*)\.([0-9]\d*)$$'

  # Valid semver with a leading v
  pihole:
    image: pihole/pihole:v5.8
    container_name: pihole
    labels:
      - 'wud.tag.include=^v(0|[1-9]\d*)\.(0|[1-9]\d*)$$'

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
    labels:
      - 'wud.tag.include=^([0-9]\d*)\.([0-9]\d*)\.([0-9]\d*)$$'
```
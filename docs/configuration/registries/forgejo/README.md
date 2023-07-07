# FORGEJO
![logo](forgejo.png)

The `forgejo` registry lets you configure a self-hosted [Forgejo](https://forgejo.org/) integration.

### Variables

| Env var                         |    Required    | Description                                                     | Supported values                                      | Default value when missing |
|---------------------------------|:--------------:|-----------------------------------------------------------------|-------------------------------------------------------|----------------------------| 
| `WUD_REGISTRY_FORGEJO_URL`      |  :red_circle:  | Registry URL (e.g. https://forgejo.acme.com)                      |                                                       |                            |
| `WUD_REGISTRY_FORGEJO_LOGIN`    | :red_circle:   | Gitea username                                                  | WUD_REGISTRY_FORGEJO_PASSWORD must be defined         |                            |
| `WUD_REGISTRY_FORGEJO_PASSWORD` |  :red_circle:  | Gitea password                                                  | WUD_REGISTRY_FORGEJO_LOGIN must be defined            |                            |
| `WUD_REGISTRY_FORGEJO_AUTH`     | :white_circle: | Htpasswd string (when htpasswd auth is enabled on the registry) | WUD_REGISTRY_FORGEJO_LOGIN/TOKEN  must not be defined |                            |
### Examples

#### Configure
<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    environment:
      - WUD_REGISTRY_FORGEJO_URL=https://forgejo.acme.com
      - WUD_REGISTRY_FORGEJO_LOGIN=john
      - WUD_REGISTRY_FORGEJO_PASSWORD=doe
```
#### **Docker**
```bash
docker run \
  -e "WUD_REGISTRY_FORGEJO_URL=https://forgejo.acme.com" \
  -e "WUD_REGISTRY_FORGEJO_LOGIN=john" \
  -e "WUD_REGISTRY_FORGEJO_PASSWORD=doe" \
  ...
  fmartinou/whats-up-docker
```
<!-- tabs:end -->

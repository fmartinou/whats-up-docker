# GITEA
![logo](gitea.png)

The `gitea` registry lets you configure a self-hosted [Gitea](https://gitea.com) integration.

### Variables

| Env var                       |    Required    | Description                                                     | Supported values                                    | Default value when missing |
|-------------------------------|:--------------:|-----------------------------------------------------------------|-----------------------------------------------------|----------------------------| 
| `WUD_REGISTRY_GITEA_URL`      |  :red_circle:  | Registry URL (e.g. https://gitea.acme.com)                      |                                                     |                            |
| `WUD_REGISTRY_GITEA_LOGIN`    | :red_circle:   | Gitea username                                                  | WUD_REGISTRY_GITEA_PASSWORD must be defined         |                            |
| `WUD_REGISTRY_GITEA_PASSWORD` |  :red_circle:  | Gitea password                                                  | WUD_REGISTRY_GITEA_LOGIN must be defined            |                            |
| `WUD_REGISTRY_GITEA_AUTH`     | :white_circle: | Htpasswd string (when htpasswd auth is enabled on the registry) | WUD_REGISTRY_GITEA_LOGIN/TOKEN  must not be defined |                            |
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
      - WUD_REGISTRY_GITEA_URL=https://gitea.acme.com
      - WUD_REGISTRY_GITEA_LOGIN=john
      - WUD_REGISTRY_GITEA_PASSWORD=doe
```
#### **Docker**
```bash
docker run \
  -e "WUD_REGISTRY_GITEA_URL=https://gitea.acme.com/" \
  -e "WUD_REGISTRY_GITEA_LOGIN=john" \
  -e "WUD_REGISTRY_GITEA_PASSWORD=doe" \
  ...
  fmartinou/whats-up-docker
```
<!-- tabs:end -->

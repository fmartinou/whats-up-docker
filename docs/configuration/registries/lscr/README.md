# LSCR (LinuxServer Container Registry)
![logo](linuxserver.png)

The `lscr` registry lets you configure [LSCR](https://www.linuxserver.io/blog/wrap-up-warm-for-the-winter) integration.

### Variables

| Env var             | Required       | Description                | Supported values  | Default value when missing |
| ------------------- |:--------------:| -------------------------- | ----------------- | -------------------------- | 
| `WUD_REGISTRY_LSCR` | :white_circle: | Set to enable the registry | `` (empty string) | undefined                  |

### Examples

<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    environment:
      - WUD_REGISTRY_LSCR=
```
#### **Docker**
```bash
docker run \
  -e WUD_REGISTRY_LSCR= \
  ...
  fmartinou/whats-up-docker
```
<!-- tabs:end -->

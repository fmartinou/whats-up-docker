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
  radarr:
    image: lscr.io/linuxserver/radarr:3.2.1.5070-ls105
    ...
    environment:
      - WUD_REGISTRY_LSCR= 
```
#### **Docker**
```bash
docker run \
  -e WUD_REGISTRY_LSCR="" \
  ...
  lscr.io/linuxserver/radarr:3.2.1.5070-ls105
```
<!-- tabs:end -->

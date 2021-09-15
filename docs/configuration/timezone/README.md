# Timezone

WUD is running in UTC by default. \
If you prefer using a local timezone, you have 2 solutions: 

### Solution 1: use the local time of your host machine.

<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    volumes:
      - /etc/localtime:/etc/localtime:ro
```
#### **Docker**
```bash
docker run -v /etc/localtime:/etc/localtime:ro ... fmartinou/whats-up-docker
```
<!-- tabs:end -->

### Solution 2: use the standard `TZ` environment variable.

<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    environment:
      - TZ=Europe/Paris
```
#### **Docker**
```bash
docker run -e "TZ=Europe/Paris" ... fmartinou/whats-up-docker
```
<!-- tabs:end -->

?> You can find the [list of the supported values here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).
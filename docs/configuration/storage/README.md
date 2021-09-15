# Storage
  
If you want the state to persist after the container removal, you need to mount  ```/store``` as a volume.

### Examples 

<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    volumes:
      - /path-on-my-host:/store
```
#### **Docker**
```bash
docker run \
  -v /path-on-my-host:/store
  ...
  fmartinou/whats-up-docker
```
<!-- tabs:end -->

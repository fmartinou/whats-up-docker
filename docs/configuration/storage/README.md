### Storage
  
If you want the state to persist after the container removal, you need to mount  ```/store``` as a volume.

#### Examples 

##### Docker run
```bash
docker run -v /path-on-my-host:/store ... fmartinou/whats-up-docker
```

##### Docker Compose configuration
```yaml
version: '3'
services:
  wud:
    image: fmartinou/whats-up-docker
    volumes:
        - /path-on-my-host:/store
```

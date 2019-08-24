## Http

The ```http``` trigger lets you send HTTP Requests.

### Variables

| Env var                                      | Description            | Supported values              | Default value |
| -------------------------------------------- |:----------------------:|:-----------------------------:|:-------------:| 
| ```WUD_TRIGGER_HTTP_{trigger_name}_URL```    | The URL of the webhook | Valid http or https endpoint  |               |
| ```WUD_TRIGGER_HTTP_{trigger_name}_METHOD``` | The HTTP method to use | GET, POST                     | POST          |

### Examples

#### Post an HTTP request to an existing server 

```bash
WUD_TRIGGER_HTTP_MYREMOTEHOST_URL="https://my-remote-host/new-version"
```

#### Example of received payload (POST)
```javascript
{
  "registry": "https://hub.docker.com",
  "organization": "library",
  "image": "traefik",
  "version": "1.7.13",
  "date": "2019-08-08T22:30:47.914Z",
  "architecture": "amd64",
  "os": "linux",
  "size": 79293686,
  "isSemver": true,
  "result": {
    "newVersion": "1.7.14",
    "newVersionDate": "2019-08-15T07:50:43.122622Z"
  }
}
```

#### Example of query string (GET)
```bash
registry=https://hub.docker.com&organization=library&image=traefik&version=1.7.13&date=2019-08-08T22:30:47.914Z&architecture=amd64&os=linux&size=79293686&isSemver=true&result[newVersion]=1.7.14&result[newVersionDate]=2019-08-15T07:50:43.122622Z
```

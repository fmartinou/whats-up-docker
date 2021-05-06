### Http

The ```http``` trigger lets you send image update notifications via HTTP.

#### Variables

| Env var                                      | Description            | Supported values              | Default value |
| -------------------------------------------- |:----------------------:|:-----------------------------:|:-------------:| 
| ```WUD_TRIGGER_HTTP_{trigger_name}_URL```    | The URL of the webhook | Valid http or https endpoint  |               |
| ```WUD_TRIGGER_HTTP_{trigger_name}_METHOD``` | The HTTP method to use | GET, POST                     | POST          |

#### Examples

##### Post an HTTP request to an existing server 

```bash
WUD_TRIGGER_HTTP_MYREMOTEHOST_URL="https://my-remote-host/new-version"
```

##### Example of payload (POST request)
```json
{
  "id":"657a87c8-7926-4e97-815b-60bb9fdada2a",
  "trigger":"https://hub.docker.com",
  "image":"library/mariadb",
  "version":"10.3.13",
  "versionDate":"2019-03-12T01:01:32.052509774Z",
  "architecture":"amd64",
  "os":"linux",
  "size":368482149,
  "isSemver":true,
  "result":{
     "tag":"10.5.4-focal"
  },
  "created":"2020-08-09T17:19:42.789Z",
  "updated":"2020-08-10T11:00:01.365Z"
}
```

##### Example of query string (GET request)
```bash
trigger=https://hub.docker.com&image=library%2Ftraefik&version=1.7.13&date=2019-08-08T22:30:47.914Z&architecture=amd64&os=linux&size=79293686&isSemver=true&result[tag]=1.7.14
```

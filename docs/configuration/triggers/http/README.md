### Http

The ```http``` trigger lets you send container update notifications via HTTP.

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
  "id":"31a61a8305ef1fc9a71fa4f20a68d7ec88b28e32303bbc4a5f192e851165b816",
  "name":"homeassistant",
  "watcher":"local",
  "includeTags":"^\\d+\\.\\d+.\\d+$",
  "image":{
    "id":"sha256:d4a6fafb7d4da37495e5c9be3242590be24a87d7edcc4f79761098889c54fca6",
    "registry":{
      "url":"123456789.dkr.ecr.eu-west-1.amazonaws.com"
    },
    "name":"test",
    "tag":{
      "value":"2021.6.4",
      "semver":true
    },
    "digest":{
      "watch":false,
      "repo":"sha256:ca0edc3fb0b4647963629bdfccbb3ccfa352184b45a9b4145832000c2878dd72"
    },
    "architecture":"amd64",
    "os":"linux",
    "created":"2021-06-12T05:33:38.440Z"
  },
  "result":{
    "tag":"2021.6.5"
  },
  "updateAvailable": true
}
```

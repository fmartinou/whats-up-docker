## Http

The ```http``` trigger lets you send HTTP Requests.

### Variables

| Env var                                   | Description            | Supported values              | Default value |
| ----------------------------------------- |:----------------------:|:-----------------------------:|:-------------:| 
| ```WUD_TRIGGER_HTTP_{trigger_name}_URL``` | The URL of the webhook | Valid http or https endpoint  |               |

### Examples

#### Post an HTTP request to an existing server 

```bash
WUD_TRIGGER_HTTP_MYREMOTEHOST_URL="https://my-remote-host/new-version"
```
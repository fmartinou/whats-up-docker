## GCR (Google Container Registry)
![logo](gcr.png)

The ```gcr```registry lets you configure [GCR](https://cloud.google.com/container-registry) integration.

### Variables

| Env var                        | Description                   | Supported values                                                                                                    | Default value |
| ------------------------------ |:----------------------------:|:--------------------------------------------------------------------------------------------------------------------:|:-------------:| 
| `WUD_REGISTRY_GCR_CLIENTEMAIL` | Service Account Client Email | See [Service Account credentials](https://cloud.google.com/container-registry/docs/advanced-authentication#json-key) |               |
| `WUD_REGISTRY_GCR_PRIVATEKEY`  | Service Account Private Key  | See [Service Account credentials](https://cloud.google.com/container-registry/docs/advanced-authentication#json-key) |               |

### Examples

```bash
WUD_REGISTRY_GCR_CLIENTEMAIL="johndoe@mysuperproject.iam.gserviceaccount.com"
WUD_REGISTRY_GCR_PRIVATEKEY="-----BEGIN PRIVATE KEY-----xxxxxxxxxxx\n-----END PRIVATE KEY-----\n"
```

### How to create a Service Account on Google Cloud Platform

#### 1. Go to the&nbsp;[Service Account page(https://console.cloud.google.com/iam-admin/serviceaccounts)
![image](./ecr_02.png)

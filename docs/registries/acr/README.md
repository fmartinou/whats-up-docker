## ACR (Azure Container Registry)
![logo](azure.png)

The ```acr```registry lets you configure [ACR](https://azure.microsoft.com/services/container-registry/) integration.

### Variables

| Env var                         | Description                 | Supported values                                                                                                                  | Default value |
| ------------------------------- |:---------------------------:|:---------------------------------------------------------------------------------------------------------------------------------:|:-------------:| 
| `WUD_REGISTRY_ACR_CLIENTID`     | Service Principal Client ID | See [Service Principal Auth](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-auth-service-principal) |               |
| `WUD_REGISTRY_ACR_CLIENTSECRET` | Service Principal Secret    | See [Service Principal Auth](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-auth-service-principal) |               |

### Examples

```bash
WUD_REGISTRY_ACR_CLIENTID="7c0195aa-112d-4ac3-be24-6664a13f3d2b"
WUD_REGISTRY_ACR_CLIENTSECRET="SBgHNi3zA5K.f9.f9ft~_hpqbS~.pk.t_i"
```

### How to create a Service Principal on Microsoft Azure Platform
TODO
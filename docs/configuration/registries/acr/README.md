# ACR (Azure Container Registry)
![logo](azure.png)

The `acr`registry lets you configure [ACR](https://azure.microsoft.com/services/container-registry/) integration.

### Variables

| Env var                         | Required     | Description                 | Supported values                                                                                                                  | Default value when missing |
| ------------------------------- |:------------:| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | 
| `WUD_REGISTRY_ACR_CLIENTID`     | :red_circle: | Service Principal Client ID | See [Service Principal Auth](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-auth-service-principal) |                            |
| `WUD_REGISTRY_ACR_CLIENTSECRET` | :red_circle: | Service Principal Secret    | See [Service Principal Auth](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-auth-service-principal) |                            |

### Examples

<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    environment:
      - WUD_REGISTRY_ACR_CLIENTID=7c0195aa-112d-4ac3-be24-6664a13f3d2b
      - WUD_REGISTRY_ACR_CLIENTSECRET=SBgHNi3zA5K.f9.f9ft~_hpqbS~.pk.t_i
```
#### **Docker**
```bash
docker run \
  -e WUD_REGISTRY_ACR_CLIENTID=7c0195aa-112d-4ac3-be24-6664a13f3d2b \
  -e WUD_REGISTRY_ACR_CLIENTSECRET=SBgHNi3zA5K.f9.f9ft~_hpqbS~.pk.t_i \
  ...
  fmartinou/whats-up-docker
```
<!-- tabs:end -->

### How to create Registry credentials on Microsoft Azure Platform

#### Create a Service Principal
Follow the [official Azure documentation](https://docs.microsoft.com/azure/active-directory/develop/howto-create-service-principal-portal).

#### Get the Client Id and the Client Secret of the created Service Principal
![image](acr_01.png)

#### Go to your Container Registry and click on the Access Control (IAM) Menu
![image](acr_02.png)

#### Click to Add a role assignment
Select the `AcrPull` role and assign to your Service Principal
![image](acr_03.png)

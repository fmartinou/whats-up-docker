# GCR (Google Container Registry)
![logo](gcr.png)

The `gcr` registry lets you configure [GCR](https://cloud.google.com/container-registry) integration.

### Variables

| Env var                        |    Required    | Description                                                       | Supported values                                                                                                     | Default value when missing |
| ------------------------------ |:--------------:|-------------------------------------------------------------------| -------------------------------------------------------------------------------------------------------------------- | -------------------------- | 
| `WUD_REGISTRY_GCR_CLIENTEMAIL` | :white_circle: | Service Account Client Email (required for private images access) | See [Service Account credentials](https://cloud.google.com/container-registry/docs/advanced-authentication#json-key) |                            |
| `WUD_REGISTRY_GCR_PRIVATEKEY`  | :white_circle: | Service Account Private Key (required for private images access)  | See [Service Account credentials](https://cloud.google.com/container-registry/docs/advanced-authentication#json-key) |                            |

### Examples

#### Configure for anonymous access
<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    environment:
      - WUD_REGISTRY_GCR=
```
#### **Docker**
```bash
docker run \
  -e WUD_REGISTRY_GCR="" \
  ...
  fmartinou/whats-up-docker
```
<!-- tabs:end -->

#### Configure for authenticated access
<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    environment:
      - WUD_REGISTRY_GCR_CLIENTEMAIL=johndoe@mysuperproject.iam.gserviceaccount.com
      - WUD_REGISTRY_GCR_PRIVATEKEY=-----BEGIN PRIVATE KEY-----xxxxxxxxxxx\n-----END PRIVATE KEY-----\n 
```
#### **Docker**
```bash
docker run \
  -e WUD_REGISTRY_GCR_CLIENTEMAIL="johndoe@mysuperproject.iam.gserviceaccount.com" \
  -e WUD_REGISTRY_GCR_PRIVATEKEY="-----BEGIN PRIVATE KEY-----xxxxxxxxxxx\n-----END PRIVATE KEY-----\n" \
  ...
  fmartinou/whats-up-docker
```
<!-- tabs:end -->

### How to create a Service Account on Google Cloud Platform

#### 1. Go to the&nbsp;[Service Account page](https://console.cloud.google.com/iam-admin/serviceaccounts)
![image](gcr_01.png)

#### 2. Create a new Service Account
![image](gcr_02.png)

#### 3. Add the Container Registry Service Role
![image](gcr_03.png)

#### 4. Save the Service Account 
![image](gcr_04.png)

#### 5. Create a new key for the newly created Service Account
![image](gcr_05.png)

#### 6. Download the keyfile JSON file and store it securely
![image](gcr_06.png)

#### 7. Open the JSON file, get the client_email and private_key values and configure WUD with them.

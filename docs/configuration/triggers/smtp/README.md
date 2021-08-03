### Smtp

The ```smtp``` trigger lets you send emails with smtp.

### Variables

| Env var                                    | Description        | Supported values              | Default value |
| ------------------------------------------ |:------------------:|:-----------------------------:|:-------------:| 
| ```WUD_TRIGGER_SMTP_{trigger_name}_HOST``` | Mock server host   | Valid hostname or IP address  |               |
| ```WUD_TRIGGER_SMTP_{trigger_name}_PORT``` | Mock server port   | Valid smtp port               |               |
| ```WUD_TRIGGER_SMTP_{trigger_name}_USER``` | Mock user          |                               |               |
| ```WUD_TRIGGER_SMTP_{trigger_name}_PASS``` | Mock password      |                               |               |
| ```WUD_TRIGGER_SMTP_{trigger_name}_FROM``` | Email from address | Valid email address           |               |
| ```WUD_TRIGGER_SMTP_{trigger_name}_TO```   | Email to address   | Valid email address           |               |

### Examples

#### Send an email with Gmail

<!-- tabs:start -->
#### **Docker Compose**
```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    environment:
        - WUD_TRIGGER_SMTP_GMAIL_HOST=smtp.gmail.com
        - WUD_TRIGGER_SMTP_GMAIL_PORT=465
        - WUD_TRIGGER_SMTP_GMAIL_USER=john.doe@gmail.com
        - WUD_TRIGGER_SMTP_GMAIL_PASS=mysecretpass
        - WUD_TRIGGER_SMTP_GMAIL_FROM=john.doe@gmail.com
        - WUD_TRIGGER_SMTP_GMAIL_TO=jane.doe@gmail.com
```

#### **Docker**
```bash
docker run \
    -e WUD_TRIGGER_SMTP_GMAIL_HOST="smtp.gmail.com" \
    -e WUD_TRIGGER_SMTP_GMAIL_PORT="465" \
    -e WUD_TRIGGER_SMTP_GMAIL_USER="john.doe@gmail.com" \
    -e WUD_TRIGGER_SMTP_GMAIL_PASS="mysecretpass" \
    -e WUD_TRIGGER_SMTP_GMAIL_FROM="john.doe@gmail.com" \
    -e WUD_TRIGGER_SMTP_GMAIL_TO="jane.doe@gmail.com" \
  ...
  fmartinou/whats-up-docker
```
<!-- tabs:end -->

!> For Gmail, you need to enable less secure apps first ([See gmail documentation](https://myaccount.google.com/lesssecureapps)).
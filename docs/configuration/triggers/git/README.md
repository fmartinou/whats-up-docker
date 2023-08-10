# Git

![logo](git.png)

The `git` trigger lets you update docker-compose.yml files stored in a git repository and then commit and push the changes.

The trigger will:

- Clone the specified repository
- Switch to / Create the specified branch (if set)
- Update the related docker-compose.yml file
- Commit the changes with a message describing the changes
- Push the changes to the remote

### Variables

| Env var                                              |    Required    | Description                                                     | Supported values | Default value when missing  |
| ---------------------------------------------------- | :------------: | --------------------------------------------------------------- | ---------------- | --------------------------- |
| `WUD_TRIGGER_GIT_{trigger_name}_FILE`      |  :red_circle:  | The docker-compose.yml file location, relative to the repo root |                  |                             |
| `WUD_TRIGGER_GIT_{trigger_name}_GITREPO`   |  :red_circle:  | The URL of the git repo                                         |                  |
| `WUD_TRIGGER_GIT_{trigger_name}_GITNAME`   | :white_circle: | The username to use for the commit message                      |                  | `whats-up-docker`           |
| `WUD_TRIGGER_GIT_{trigger_name}_GITEMAIL`  | :white_circle: | The email to use for the commit message                         |                  | `whats-up-docker@localhost` |
| `WUD_TRIGGER_GIT_{trigger_name}_GITBRANCH` | :white_circle: | The branch to use                                               |                  |                             |

?> This trigger also supports the [common configuration variables](configuration/triggers/?id=common-trigger-configuration). but only supports the `batch` mode.

!> This trigger will only work with locally watched containers.

!> Do not forget to mount the necessary ssh key into the repository(Github deploy keys are a great option for this. Remeber it needs both read AND write access)

### Examples

<!-- tabs:start -->

#### **Docker Compose**

```yaml
version: '3'

services:
  whatsupdocker:
    image: fmartinou/whats-up-docker
    ...
    volumes:
    - /etc/my-services/id_rsa:/home/node/.ssh/id_rsa
    - /etc/my-services/id_rsa.pub:/home/node/.ssh/id_rsa.pub
    environment:
      - WUD_TRIGGER_GIT_EXAMPLE_FILE=docker-compose.yml
      - WUD_TRIGGER_GIT_EXAMPLE_GITREPO=git@github.com:fmartinou/whats-up-docker.git
```

#### **Docker**

```bash
docker run \
  -v /etc/my-services/id_rsa:/home/node/.ssh/id_rsa
  -v /etc/my-services/id_rsa.pub:/home/node/.ssh/id_rsa.pub
  -e "WUD_TRIGGER_GIT_EXAMPLE_FILE=docker-compose.yml" \
  -e "WUD_TRIGGER_GIT_EXAMPLE_GITREPO=git@github.com:fmartinou/whats-up-docker.git" \
  ...
  fmartinou/whats-up-docker
```

<!-- tabs:end -->

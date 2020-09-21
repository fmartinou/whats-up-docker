## Supported labels

To fine-tune the behaviour of WUD, you can add labels on your containers.

#### Supported labels
| Label                 | Description                         | Supported values       |
| --------------------- |:-----------------------------------:|:----------------------:|
| ```wud.watch```       | Watch this container                | Valid Boolean          |
| ```wud.tag.include``` | Regex to include specific tags only | Valid JavaScript Regex |
| ```wud.tag.exclude``` | Regex to exclude specific tags      | Valid JavaScript Regex |

#### Examples

##### Watch only specific containers
Configure WUD to watch "labeled" containers only
```bash
WUD_WATCHER_{watcher_name}_WATCHBYDEFAULT=false
```

Then add the labels on the containers you want to watch.
```bash
docker run -d --name mariadb --label wud.watch=true mariadb:10.4.5
```

##### Include only 3 digits semver tags
You can filter (by inclusion or inclusion) which versions can be candidates for update.

For example, you can indicate that you want to watch x.y.z versions only
```bash
# Docker run example
docker run -d --name mariadb --label wud.tag.include='^[0-9]\d*\.[0-9]\d*\.[0-9]\d*$$' mariadb:10.4.5

# Docker Compose example
version: '3'

services:

    mariadb:
        image: mariadb:10.4.5
        labels:
            - 'wud.tag.include=^[0-9]\d*\.[0-9]\d*\.[0-9]\d*$$'
```

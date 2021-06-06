### Logs

You can adjust the log level with env var WUD_LOG_LEVEL.

#### Variables

| Env var              | Description | Supported values            | Default value  |
| -------------------- |:-----------:|:---------------------------:|:--------------:| 
| ```WUD_LOG_LEVEL```  | Log level   | error info debug trace      | info           |
| ```WUD_LOG_FORMAT``` | Log format  | text json                   | text           |

#### Examples

##### Set debug level
```bash
WUD_LOG_LEVEL=debug
```

##### Set json format (to export to ElasticSearch for example)
```bash
WUD_LOG_format=json
```

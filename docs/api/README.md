### REST API

You can access _**WUD**_ state using the HTTP REST API. \
(see API details below)

By default, the API is enabled and exposed on port `3000`.

You can override this behaviour using the following environment variables.
### Variables

| Env var               | Description                   | Supported values | Default value  |
| --------------------- |:-----------------------------:|:----------------:|:--------------:| 
| ```WUD_API_ENABLED``` | If REST API must be exposed   | true false       | true           |
| ```WUD_API_PORT```    | Http listener port            | 0 - 65535        | 3000           |


### Examples

#### Disable http listener
```bash
WUD_API_ENABLED=false
```

#### Set http listener port to 8080
```bash
WUD_API_PORT=8080
```

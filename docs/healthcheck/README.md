## HealthCheck

WUD exposes an endpoint to check the service healthiness.

### Endpoint
The healthiness is exposed at [/health](http://localhost:3000/health).

If the application is healthy, the Http Response Status Code is `200` (`500` otherwise).

### Example
```json
{
  "uptime": 123
}
```

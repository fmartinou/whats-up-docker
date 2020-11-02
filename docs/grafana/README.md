## Grafana
![logo](grafana.png)

You can use [Grafana](https://grafana.com/) to display charts and graphs [using Prometheus metrics](prometheus/).

### Watched images
You can also display WUD watched images on Grafana.

#### Example to display the image Table

![image](./grafana_table.png)

```
# Example of Prometheus query
sum by(registry_url, image, os, architecture, version, new_version, updated) (wud_images)
```

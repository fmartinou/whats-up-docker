## Prometheus metrics
![logo](prometheus.png)

WUD exposes various metrics that [Prometheus](https://prometheus.io/) can scrap.

### Endpoint
The metrics are exposed at [/metrics](http://localhost:3000/metrics).

### Metrics

#### WUD specific metrics
```bash
# HELP wud_trigger_count Total count of trigger events
# TYPE wud_trigger_count counter

# HELP wud_registry_response The Registry response time (in second)
# TYPE wud_registry_response summary
wud_registry_response{quantile="0.01",type="acr",name="acr"} 0.513
wud_registry_response{quantile="0.05",type="acr",name="acr"} 0.513
wud_registry_response{quantile="0.5",type="acr",name="acr"} 0.525
wud_registry_response{quantile="0.9",type="acr",name="acr"} 0.559
wud_registry_response{quantile="0.95",type="acr",name="acr"} 0.559
wud_registry_response{quantile="0.99",type="acr",name="acr"} 0.559
wud_registry_response{quantile="0.999",type="acr",name="acr"} 0.559
wud_registry_response_sum{type="acr",name="acr"} 1.597
wud_registry_response_count{type="acr",name="acr"} 3
wud_registry_response{quantile="0.01",type="ecr",name="ecr"} 0.509
wud_registry_response{quantile="0.05",type="ecr",name="ecr"} 0.509
wud_registry_response{quantile="0.5",type="ecr",name="ecr"} 1.434
wud_registry_response{quantile="0.9",type="ecr",name="ecr"} 1.507
wud_registry_response{quantile="0.95",type="ecr",name="ecr"} 1.507
wud_registry_response{quantile="0.99",type="ecr",name="ecr"} 1.507
wud_registry_response{quantile="0.999",type="ecr",name="ecr"} 1.507
wud_registry_response_sum{type="ecr",name="ecr"} 3.45
wud_registry_response_count{type="ecr",name="ecr"} 3
wud_registry_response{quantile="0.01",type="gcr",name="gcr"} 0.658
wud_registry_response{quantile="0.05",type="gcr",name="gcr"} 0.658
wud_registry_response{quantile="0.5",type="gcr",name="gcr"} 0.6606666666666667
wud_registry_response{quantile="0.9",type="gcr",name="gcr"} 0.662
wud_registry_response{quantile="0.95",type="gcr",name="gcr"} 0.662
wud_registry_response{quantile="0.99",type="gcr",name="gcr"} 0.662
wud_registry_response{quantile="0.999",type="gcr",name="gcr"} 0.662
wud_registry_response_sum{type="gcr",name="gcr"} 1.9820000000000002
wud_registry_response_count{type="gcr",name="gcr"} 3
wud_registry_response{quantile="0.01",type="hub",name="hub"} 0.988
wud_registry_response{quantile="0.05",type="hub",name="hub"} 0.988
wud_registry_response{quantile="0.5",type="hub",name="hub"} 0.994
wud_registry_response{quantile="0.9",type="hub",name="hub"} 1
wud_registry_response{quantile="0.95",type="hub",name="hub"} 1
wud_registry_response{quantile="0.99",type="hub",name="hub"} 1
wud_registry_response{quantile="0.999",type="hub",name="hub"} 1
wud_registry_response_sum{type="hub",name="hub"} 1.988
wud_registry_response_count{type="hub",name="hub"} 2

# HELP wud_watcher_total The number of watched images
# TYPE wud_watcher_total gauge
wud_watcher_total{type="docker",name="local"} 11

# HELP wud_images The watched images
# TYPE wud_images gauge
wud_images{registry="hub",registry_url="https://registry-1.docker.io/v2",image="library/nginx",version="1.10-alpine",version_date="2017-03-03T22:03:51.199773111Z",architecture="amd64",os="linux",size="54042627",is_semver="true",include_tags="^[0-9]\\d*\\.[0-9]\\d*-alpine$",exclude_tags="undefined",new_version="1.19-alpine", to_be_updated="true"} 1
```

#### Standard process metrics
```bash
# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.
# TYPE process_cpu_user_seconds_total counter
process_cpu_user_seconds_total 0.43806500000000004

# HELP process_cpu_system_seconds_total Total system CPU time spent in seconds.
# TYPE process_cpu_system_seconds_total counter
process_cpu_system_seconds_total 0.049822

# HELP process_cpu_seconds_total Total user and system CPU time spent in seconds.
# TYPE process_cpu_seconds_total counter
process_cpu_seconds_total 0.48788699999999996

# HELP process_start_time_seconds Start time of the process since unix epoch in seconds.
# TYPE process_start_time_seconds gauge
process_start_time_seconds 1601627305

# HELP process_resident_memory_bytes Resident memory size in bytes.
# TYPE process_resident_memory_bytes gauge
process_resident_memory_bytes 74395648

# HELP process_virtual_memory_bytes Virtual memory size in bytes.
# TYPE process_virtual_memory_bytes gauge
process_virtual_memory_bytes 950431744

# HELP process_heap_bytes Process heap size in bytes.
# TYPE process_heap_bytes gauge
process_heap_bytes 116568064

# HELP process_open_fds Number of open file descriptors.
# TYPE process_open_fds gauge
process_open_fds 22

# HELP process_max_fds Maximum number of open file descriptors.
# TYPE process_max_fds gauge
process_max_fds 1048576
```

#### Standard Node.js metrics
```bash
# HELP nodejs_eventloop_lag_seconds Lag of event loop in seconds.
# TYPE nodejs_eventloop_lag_seconds gauge
nodejs_eventloop_lag_seconds 0.013967205

# HELP nodejs_eventloop_lag_min_seconds The minimum recorded event loop delay.
# TYPE nodejs_eventloop_lag_min_seconds gauge
nodejs_eventloop_lag_min_seconds 0.000086912

# HELP nodejs_eventloop_lag_max_seconds The maximum recorded event loop delay.
# TYPE nodejs_eventloop_lag_max_seconds gauge
nodejs_eventloop_lag_max_seconds 0.508821503

# HELP nodejs_eventloop_lag_mean_seconds The mean of the recorded event loop delays.
# TYPE nodejs_eventloop_lag_mean_seconds gauge
nodejs_eventloop_lag_mean_seconds 0.012621618267074414

# HELP nodejs_eventloop_lag_stddev_seconds The standard deviation of the recorded event loop delays.
# TYPE nodejs_eventloop_lag_stddev_seconds gauge
nodejs_eventloop_lag_stddev_seconds 0.02283534676636928

# HELP nodejs_eventloop_lag_p50_seconds The 50th percentile of the recorded event loop delays.
# TYPE nodejs_eventloop_lag_p50_seconds gauge
nodejs_eventloop_lag_p50_seconds 0.010715135

# HELP nodejs_eventloop_lag_p90_seconds The 90th percentile of the recorded event loop delays.
# TYPE nodejs_eventloop_lag_p90_seconds gauge
nodejs_eventloop_lag_p90_seconds 0.013647871

# HELP nodejs_eventloop_lag_p99_seconds The 99th percentile of the recorded event loop delays.
# TYPE nodejs_eventloop_lag_p99_seconds gauge
nodejs_eventloop_lag_p99_seconds 0.023576575

# HELP nodejs_active_handles Number of active libuv handles grouped by handle type. Every handle type is C++ class name.
# TYPE nodejs_active_handles gauge
nodejs_active_handles{type="Pipe"} 1
nodejs_active_handles{type="Socket"} 3
nodejs_active_handles{type="WriteStream"} 1
nodejs_active_handles{type="Server"} 1

# HELP nodejs_active_handles_total Total number of active handles.
# TYPE nodejs_active_handles_total gauge
nodejs_active_handles_total 6

# HELP nodejs_active_requests Number of active libuv requests grouped by request type. Every request type is C++ class name.
# TYPE nodejs_active_requests gauge

# HELP nodejs_active_requests_total Total number of active requests.
# TYPE nodejs_active_requests_total gauge
nodejs_active_requests_total 0

# HELP nodejs_heap_size_total_bytes Process heap size from Node.js in bytes.
# TYPE nodejs_heap_size_total_bytes gauge
nodejs_heap_size_total_bytes 26259456

# HELP nodejs_heap_size_used_bytes Process heap size used from Node.js in bytes.
# TYPE nodejs_heap_size_used_bytes gauge
nodejs_heap_size_used_bytes 24616000

# HELP nodejs_external_memory_bytes Node.js external memory size in bytes.
# TYPE nodejs_external_memory_bytes gauge
nodejs_external_memory_bytes 1738842

# HELP nodejs_heap_space_size_total_bytes Process heap space size total from Node.js in bytes.
# TYPE nodejs_heap_space_size_total_bytes gauge
nodejs_heap_space_size_total_bytes{space="read_only"} 151552
nodejs_heap_space_size_total_bytes{space="new"} 1048576
nodejs_heap_space_size_total_bytes{space="old"} 19542016
nodejs_heap_space_size_total_bytes{space="code"} 622592
nodejs_heap_space_size_total_bytes{space="map"} 1576960
nodejs_heap_space_size_total_bytes{space="large_object"} 3268608
nodejs_heap_space_size_total_bytes{space="code_large_object"} 49152
nodejs_heap_space_size_total_bytes{space="new_large_object"} 0

# HELP nodejs_heap_space_size_used_bytes Process heap space size used from Node.js in bytes.
# TYPE nodejs_heap_space_size_used_bytes gauge
nodejs_heap_space_size_used_bytes{space="read_only"} 150392
nodejs_heap_space_size_used_bytes{space="new"} 1036360
nodejs_heap_space_size_used_bytes{space="old"} 18851160
nodejs_heap_space_size_used_bytes{space="code"} 350112
nodejs_heap_space_size_used_bytes{space="map"} 979272
nodejs_heap_space_size_used_bytes{space="large_object"} 3251736
nodejs_heap_space_size_used_bytes{space="code_large_object"} 2880
nodejs_heap_space_size_used_bytes{space="new_large_object"} 0

# HELP nodejs_heap_space_size_available_bytes Process heap space size available from Node.js in bytes.
# TYPE nodejs_heap_space_size_available_bytes gauge
nodejs_heap_space_size_available_bytes{space="read_only"} 0
nodejs_heap_space_size_available_bytes{space="new"} 11064
nodejs_heap_space_size_available_bytes{space="old"} 526680
nodejs_heap_space_size_available_bytes{space="code"} 230304
nodejs_heap_space_size_available_bytes{space="map"} 595064
nodejs_heap_space_size_available_bytes{space="large_object"} 0
nodejs_heap_space_size_available_bytes{space="code_large_object"} 0
nodejs_heap_space_size_available_bytes{space="new_large_object"} 1047424

# HELP nodejs_version_info Node.js version info.
# TYPE nodejs_version_info gauge
nodejs_version_info{version="v14.11.0",major="14",minor="11",patch="0"} 1

# HELP nodejs_gc_duration_seconds Garbage collection duration by kind, one of major, minor, incremental or weakcb.
# TYPE nodejs_gc_duration_seconds histogram
nodejs_gc_duration_seconds_bucket{le="0.001",kind="incremental"} 5
nodejs_gc_duration_seconds_bucket{le="0.01",kind="incremental"} 5
nodejs_gc_duration_seconds_bucket{le="0.1",kind="incremental"} 5
nodejs_gc_duration_seconds_bucket{le="1",kind="incremental"} 6
nodejs_gc_duration_seconds_bucket{le="2",kind="incremental"} 6
nodejs_gc_duration_seconds_bucket{le="5",kind="incremental"} 6
nodejs_gc_duration_seconds_bucket{le="+Inf",kind="incremental"} 6
nodejs_gc_duration_seconds_sum{kind="incremental"} 0.12669281899999998
nodejs_gc_duration_seconds_count{kind="incremental"} 6
nodejs_gc_duration_seconds_bucket{le="0.001",kind="major"} 0
nodejs_gc_duration_seconds_bucket{le="0.01",kind="major"} 3
nodejs_gc_duration_seconds_bucket{le="0.1",kind="major"} 3
nodejs_gc_duration_seconds_bucket{le="1",kind="major"} 3
nodejs_gc_duration_seconds_bucket{le="2",kind="major"} 3
nodejs_gc_duration_seconds_bucket{le="5",kind="major"} 3
nodejs_gc_duration_seconds_bucket{le="+Inf",kind="major"} 3
nodejs_gc_duration_seconds_sum{kind="major"} 0.01499841
nodejs_gc_duration_seconds_count{kind="major"} 3
nodejs_gc_duration_seconds_bucket{le="0.001",kind="minor"} 1
nodejs_gc_duration_seconds_bucket{le="0.01",kind="minor"} 1
nodejs_gc_duration_seconds_bucket{le="0.1",kind="minor"} 1
nodejs_gc_duration_seconds_bucket{le="1",kind="minor"} 1
nodejs_gc_duration_seconds_bucket{le="2",kind="minor"} 1
nodejs_gc_duration_seconds_bucket{le="5",kind="minor"} 1
nodejs_gc_duration_seconds_bucket{le="+Inf",kind="minor"} 1
nodejs_gc_duration_seconds_sum{kind="minor"} 0.0005726689999999999
nodejs_gc_duration_seconds_count{kind="minor"} 1
nodejs_gc_duration_seconds_bucket{le="0.001",kind="weakcb"} 1
nodejs_gc_duration_seconds_bucket{le="0.01",kind="weakcb"} 1
nodejs_gc_duration_seconds_bucket{le="0.1",kind="weakcb"} 1
nodejs_gc_duration_seconds_bucket{le="1",kind="weakcb"} 1
nodejs_gc_duration_seconds_bucket{le="2",kind="weakcb"} 1
nodejs_gc_duration_seconds_bucket{le="5",kind="weakcb"} 1
nodejs_gc_duration_seconds_bucket{le="+Inf",kind="weakcb"} 1
nodejs_gc_duration_seconds_sum{kind="weakcb"} 4.94e-7
nodejs_gc_duration_seconds_count{kind="weakcb"} 1
```

### Grafana
> WUD prometheus metrics can be used to display various graphs [with Grafana](grafana/).
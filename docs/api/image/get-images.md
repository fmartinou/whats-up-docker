## Get Images

This operation lets you get all the watched images.

```bash
curl http://wud:3000/api/images

[
   {
      "id":"657a87c8-7926-4e97-815b-60bb9fdada2a",
      "trigger":"https://hub.docker.com",
      "image":"library/mariadb",
      "version":"10.3.13",
      "versionDate":"2019-03-12T01:01:32.052509774Z",
      "architecture":"amd64",
      "os":"linux",
      "size":368482149,
      "isSemver":true,
      "result":{
         "tag":"10.5.4-focal"
      },
      "created":"2020-08-09T17:19:42.789Z",
      "updated":"2020-08-10T11:00:01.365Z"
   },
   {
      "id":"09ec652c-3b61-450f-bf7d-4af789a0da71",
      "trigger":"https://hub.docker.com",
      "image":"library/elasticsearch",
      "version":"7.6.1",
      "versionDate":"2020-02-29T00:20:16.060732943Z",
      "architecture":"amd64",
      "os":"linux",
      "size":790379171,
      "isSemver":true,
      "result":{
         "tag":"7.8.1"
      },
      "created":"2020-08-09T17:19:42.734Z",
      "updated":"2020-08-10T11:00:01.423Z"
   }
]
```

You can filter the results by query params.

```bash
curl http://wud:3000/api/images?image=mariadb

curl http://wud:3000/api/images?version=1.2.3

curl http://wud:3000/api/images?image=mariadb&version=10.3.13

...
```
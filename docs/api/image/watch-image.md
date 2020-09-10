## Watch Image

This operation triggers a manual watch on an image.

```bash
curl -X POST http://wud:3000/api/images/657a87c8-7926-4e97-815b-60bb9fdada2a/watch

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
     "newVersion":"10.5.4-focal",
  },
  "created":"2020-08-09T17:19:42.789Z",
  "updated":"2020-08-10T11:00:01.365Z"
}
```
# Changelog

## 5.6.0
- :star: Add Trigger configurable threshold ([see here](configuration/authentications/triggers/))

## 5.5.0
- :star: Add Openid Connect authentication ([see here](configuration/authentications/oidc/))
- :fire: Fix duplicate notifications when multiple Docker watchers configured

## 5.4.0
- :star: Add Authentication system ([see here](configuration/authentications/))
- :star: Add ability to specify a link pointing to the container version (changelog...) ([see here](configuration/watchers/?id=associate-a-link-to-the-container-version))
- :star: Update all dependencies

## 5.3.0
- :star: Add [Apprise](https://github.com/caronc/apprise) trigger
- :star: Support TZ env var for local time configuration
- :star: Improve logs
- :star: Update all dependencies
- :fire: Fix [DEP0152] DeprecationWarning (caused by prom-client)
- :fire: Fix paging issue when getting tag list (proven error on Github Container Registry)

## 5.2.0
- :star: Allow excluding specific containers from being watched
- :star: Add Github Container Registry support
- :star: Add Docker Compose examples to the documentation

## 5.1.0
- :star: Upgrade to nodejs 16
- :star: Embed Material Design icons & Google fonts in UI for offline access
- :star: Update all dependencies
- :star: Improve code coverage

## 5.0.2
- :fire: Fix digest wrong results for v1 manifests

## 5.0.1
- :star: Highlight containers in UI when new digest


- :fire: Fix wrong update status when new digest
- :fire: Fix container removal when container went away

## 5.0.0
- :star: New UI
- :star: Watch individual containers instead of images
- :star: Digest management optimizations

!> **Breaking changes!** \
WUD is now **container centric** instead of image centric. \
The data model changed, the API changed, some integrations changed... \
Please take a look at the documentation before upgrading to analyse all potential impacts on your integrations.

## 4.1.2
- :fire: Add better support for tags partially coerced as semver 

## 4.1.1
- :fire: Fix error when image doesn't have a RepoDigest (e.g. locally built images)
- :fire: Fix documentation bad links

## 4.1.0
- :star: Revamp documentation


- :fire: Fix wrong digests for arch different from amd64
- :fire: Remove the hass sensor when the container goes away

## 4.0.2
- :star: Add WUD current version in the logs


- :fire: Fix false-positive notifications

## 4.0.1
- :star: Add Container name


- :fire: Fix missing digest for images with v2 manifests

## 4.0.0
- :star: Add Support for Non Semver image versions
- :star: Add TLS support for Remote Docker API over TCP
- :star: Add Option to watch all containers (not only the running ones)
- :star: Add Log format (text by default instead of json)

## 3.5.0
- :star: Add Registry Concept & ACR / ECR / GCR / Docker Hub (private repositories) implementations
- :star: Add [Home-Assistant](https://www.home-assistant.io/) MQTT integration
- :star: Add Prometheus metrics & HealthCheck endpoint
- :star: Support sha256 image references
- :star: Load local assets instead of relying on external CDN
- :star: Add Pushover trigger
- :star: Update all dependencies


- :fire: Fix toggle menu in UI
- :fire: Fix missing Http Trigger
- :fire: Fix duplicated images
- :fire: Fix IFTTT trigger
- :fire: Fix semver candidates filter

## 2.3.1
- :star: Add REST API
- :star: Add UI
- :star: Add support for Docker Hub private repositories
- :star: Upgrade to Node.js 14
- :star: Update dependencies


- :fire: Fix error when current tag is a "coerced" semver
- :fire: Fix missing Http Trigger

## 1.0.0
- :star: Yeah!

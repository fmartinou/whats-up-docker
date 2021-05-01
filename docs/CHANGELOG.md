# Changelog

### develop
- :star: Add Support for Non Semver image versions

### 3.5.0
- :star: Add [Home-Assistant](https://www.home-assistant.io/) MQTT integration

### 3.4.0
- :star: Add `to_be_updated` prometheus metric tag
- :star: Update all dependencies

### 3.3.1
- :fire: Allow anonymous Hub configuration

### 3.3.0
- :star: Support sha256 image references
- :star: Update dependencies

### 3.2.3
- :star: Load local assets instead of relying on external CDN

### 3.2.2
- :fire: Fix WUD crash when Pushover userKey or applicationToken is invalid

### 3.2.1
- :fire: Fix duplicated images

### 3.2.0
- :star: Add Pushover trigger

### 3.1.3
- :fire: Fix IFTTT trigger & documentation

### 3.1.2
- :star: Update dependencies

### 3.1.1
- :star: Add watched images as Prometheus metrics
- :fire: Handle identical images with different versions
- :fire: Fix semver candidates filter
- :fire: Fix 'Cannot read property 'newVersion' of undefined' when no tag candidate found

### 3.1.0
- :star: Add Prometheus metrics
- :star: Add HealthCheck endpoint
- :star: Update dependencies

### 3.0.0
- :star: Add Registry Concept
- :star: Add ACR
- :star: Add ECR
- :star: Add GCR
- :fire: Fix toggle menu in UI

!> **Breaking Change** \
Some configuration variables have been changed \
Please review the documentation and make the necessary adjustments  

!> **Breaking Change** \
Data schema has changed \
Delete _WUD_ store before update

### 2.3.1
- :fire: Fix missing Http Trigger

### 2.3.0
- :star: Add support for Docker Hub Base64 Credentials

### 2.2.1
- :fire: Fix some documentation typos

### 2.2.0
- :star: Add ability to trigger individual searches (API & UI support)

### 2.1.0
- :star: Add support for Docker Hub private repositories

### 2.0.0
- :star: Add REST API
- :star: Add UI

!> **Breaking Change** \
Data schema has changed \
Delete _WUD_ store before update

### 1.1.2
- :fire: Fix error when current tag is a "coerced" semver
- :star: Update dependencies
- :star: improve documentation (label usage)

### 1.1.1
- :star: Update dependencies

### 1.1.0
- :star: Upgrade to Node.js 14
- :star: Update dependencies

### 1.0.1
- :star: Add debug logs
- :star: improve documentation
- :fire: Fix Docker watcher configuration check

### 1.0.0
- :star: Yeah!

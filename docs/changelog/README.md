# Changelog

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

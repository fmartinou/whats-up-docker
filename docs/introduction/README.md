# Introduction

![Docker pulls](https://img.shields.io/docker/pulls/fmartinou/whats-up-docker)
![License](https://img.shields.io/github/license/fmartinou/whats-up-docker)
![Travis](https://img.shields.io/travis/fmartinou/whats-up-docker/master)
![Maintainability](https://img.shields.io/codeclimate/maintainability/fmartinou/whats-up-docker)
![Coverage](https://img.shields.io/codeclimate/coverage/fmartinou/whats-up-docker)

## What's up Docker? <small>(aka **WUD**)</small>
Gets you notified when new versions of your Docker containers are available and lets you react the way you want.

#### WUD is built on 3 concepts:

> `WATCHERS` query your Docker hosts to get the containers to watch

> `REGISTRIES` query the Docker registries to find available updates

> `TRIGGERS` perform actions when updates are available

![image](wud_arch.png)

## Many supported triggers
> Send notifications using **Smtp**, [**Apprise**](https://github.com/caronc/apprise-api), [**Ifttt**](https://ifttt.com), [**Pushover**](https://pushover.net), [**Slack**](https://slack.com), [**Telegram**](https://telegram.org/), [**Discord**](https://discord.com/)...

> Automatically update your [**docker**](https://www.docker.com) containers or your [**docker-compose**](https://docs.docker.com/compose) stack.

> Integrate with third-party systems using [**Kafka**](https://kafka.apache.org), [**Mqtt**](https://mqtt.org), **Http Webhooks**...

## Many supported registries
> [**Azure Container Registry**](https://azure.microsoft.com/services/container-registry)

> [**AWS Elastic Container Registry**](https://aws.amazon.com/ecr)

> [**Google Container Registry**](https://cloud.google.com/container-registry)

> [**Github Container Registry**](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-docker-registry)

> [**Docker Hub (public & private repositories)**](http://hub.docker.com)

## REST API & Web UI
![image](../ui/ui.png)

## Good integration with
> [**Home-Assistant**](https://www.home-assistant.io/)

> [**Prometheus**](https://prometheus.io/)

> [**Grafana**](https://grafana.com/)

## Ready to go?
> [**Follow the quick start guide!**](quickstart/)


## Contact & Support
- Create a [GitHub issue](https://github.com/fmartinou/whats-up-docker/issues) for bug reports, feature requests, or questions
- Add a ⭐️ [star on GitHub](https://github.com/fmartinou/whats-up-docker) or [Buy me coffee](https://www.buymeacoffee.com/61rUNMm)&nbsp;to support the project!

<a href="https://www.buymeacoffee.com/61rUNMm" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

## License
This project is licensed under the [MIT license](https://github.com/fmartinou/whats-up-docker/blob/master/LICENSE).

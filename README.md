# What's up Docker?
 
  ![Travis](https://img.shields.io/travis/fmartinou/whats-up-docker/master)
  ![Maintainability](https://img.shields.io/codeclimate/maintainability/fmartinou/whats-up-docker)
  ![Coverage](https://img.shields.io/codeclimate/coverage/fmartinou/whats-up-docker)
  ![Docker pulls](https://img.shields.io/docker/pulls/fmartinou/whats-up-docker)

![](docs/wud_logo_500.png)

**What's up Docker?** (aka **WUD**) gets you notified when a new version of your Docker Container is available.

**WUD** is built on top of 3 concepts:
- **WATCHERS** query your Docker hosts to get the running images
- **REGISTRIES** check whether updates are available
- **TRIGGERS** get you notified upon available updates

![image](docs/introduction/wud_arch.png)

**WUD** can be easily configured using regular Environment Variables & Docker labels.

## Many supported triggers
- [Apprise](https://github.com/caronc/apprise-api)
- [Ifttt](https://ifttt.com/)
- [Kafka](https://kafka.apache.org/)
- [Mqtt](https://mqtt.org/)
- [Pushover](https://pushover.net/)
- [Slack](https://slack.com/)
- Smtp
- ...

## Many supported registries
- [ACR](https://azure.microsoft.com/services/container-registry/)
- [ECR](https://aws.amazon.com/ecr/)
- [GCR](https://cloud.google.com/container-registry/)
- [GHCR](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-docker-registry)
- [HUB](http://hub.docker.com/)

## REST API & fresh UI
![image](docs/ui/ui.png)

## Good integration with
- [Home-Assistant](https://www.home-assistant.io/)
- [Prometheus](https://prometheus.io/)
- [Grafana](https://grafana.com/)
- ...

## Ready to go?
### Check out the [documentation](https://fmartinou.github.io/whats-up-docker/) to get started!

## Contact & Support
- Create a [GitHub issue](https://github.com/fmartinou/whats-up-docker/issues) for bug reports, feature requests, or questions
- Add a ⭐️ [star on GitHub](https://github.com/fmartinou/whats-up-docker) or[Buy me coffee](https://www.buymeacoffee.com/61rUNMm) to support the project!

<a href="https://www.buymeacoffee.com/61rUNMm" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

## License
This project is licensed under the [MIT license](https://github.com/fmartinou/whats-up-docker/blob/master/LICENSE).

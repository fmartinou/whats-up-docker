BUILDX_VER=v0.11.1
PLATFORMS=linux/amd64,linux/arm64,linux/arm/v7
IMAGE_NAME=whats-up-docker
IMAGE_VERSION=latest
GITHUB_USERNAME=patmagauran
DOCKER_USERNAME=patmagauran
install:
	mkdir -vp ~/.docker/cli-plugins/ ~/dockercache
	curl --silent -L "https://github.com/docker/buildx/releases/download/${BUILDX_VER}/buildx-${BUILDX_VER}.linux-amd64" > ~/.docker/cli-plugins/docker-buildx
	chmod a+x ~/.docker/cli-plugins/docker-buildx

prepare: install
	docker buildx create --use

build:
	docker buildx build --push \
		--platform ${PLATFORMS} \
		--build-arg WUD_VERSION=${IMAGE_VERSION} \
		-t ghcr.io/${GITHUB_USERNAME}/${IMAGE_NAME}:${IMAGE_VERSION} ./
		
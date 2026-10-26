# Jenkins propio del proyecto (HU-21): Jenkins LTS + Docker CLI + buildx + compose + Node 22.
# buildx activa BuildKit: imágenes en paralelo y con caché (sin él, compose usa el builder clásico).
# Usa el Docker del host a través del socket montado en docker-compose.yml.
FROM jenkins/jenkins:lts-jdk21

USER root
ARG NODE_MAJOR=22
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl gnupg \
 && install -m 0755 -d /etc/apt/keyrings \
 && curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc \
 && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
      > /etc/apt/sources.list.d/docker.list \
 && curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash - \
 && apt-get install -y --no-install-recommends docker-ce-cli docker-buildx-plugin docker-compose-plugin nodejs \
 && corepack enable \
 && rm -rf /var/lib/apt/lists/*

USER jenkins
COPY --chown=jenkins:jenkins plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

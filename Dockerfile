# cSpell:ignore tzdata zoneinfo localtime dpkg noninteractive
ARG NODE_VERSION=24

# 共通
FROM node:${NODE_VERSION} AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# タイムゾーン設定
RUN apt-get update && apt-get install -y tzdata \
  && ln -fs /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
  && dpkg-reconfigure -f noninteractive tzdata

ENV TZ=Asia/Tokyo

ARG USERNAME=node

# 開発環境
FROM base AS development

RUN corepack install -g pnpm@latest

RUN mkdir -p /app /pnpm && \
  chown -R ${USERNAME}:${USERNAME} /app /pnpm

WORKDIR /app

COPY --chown=${USERNAME}:${USERNAME} package.json pnpm-lock.yaml ./

USER ${USERNAME}

# RUN pnpm config set store-dir /pnpm/store --global

# RUN pnpm install --frozen-lockfile

# CMD ["/bin/sh", "-c", "pnpm start:dev"]

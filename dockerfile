FROM ghcr.io/astral-sh/uv:0.5.24-debian-slim

RUN apt-get update && apt-get -qq install -y --no-install-recommends \
    ca-certificates \
    git \
    && rm -rf /var/lib/apt/lists/*


WORKDIR /app

RUN uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

ENV PATH="/root/.local/bin:$PATH"

CMD ["/bin/bash"]

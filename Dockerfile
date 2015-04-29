FROM  ubuntu-debootstrap:15.04

# Install packages
RUN PACKAGES="build-essential curl python git ca-certificates" \
&& set -x \
&& apt-get update -y \
&& apt-get install -y $PACKAGES --no-install-recommends \
&& rm -rf /var/lib/apt/lists/*

# Install io.js
RUN IOJS_VERSION="v1.8.1" \
&& set -x \
&& curl https://iojs.org/dist/$IOJS_VERSION/iojs-$IOJS_VERSION-linux-x64.tar.xz | tar xJ --strip-components 1 -C /usr/local

# Install Foodie-platform
ENV NODE_ENV=production FOODIE_UPLOADS_DIR=/foodie/uploads FOODIE_HTTP_PORT=3000
EXPOSE  3000
RUN set -x && mkdir -p /foodie/platform $FOODIE_UPLOADS_DIR
WORKDIR /foodie/platform
COPY  package.json package.json
RUN set -x && npm install && rm -rf /root/.node-gyp /root/.npm /tmp/npm*
COPY  ./ ./
CMD ["node", "."]

FROM  alpine:3.1

# Install packages
RUN PACKAGES="build-base python git ca-certificates curl" \
&& set -x \
&& apk -U add $PACKAGES \
&& rm -rf /var/cache/apk/*

# Install io.js
RUN IOJS_VERSION="v2.0.0" \
&& set -x \
&& curl https://iojs.org/dist/$IOJS_VERSION/iojs-$IOJS_VERSION.tar.xz | tar xJ \
&& cd iojs-$IOJS_VERSION && ./configure && make -j 4 && make install \
&& cd .. && rm -rf iojs-$IOJS_VERSION

# Install Foodie-platform
ENV NODE_ENV=production FOODIE_HTTP_PORT=3000
EXPOSE  3000
RUN set -x && mkdir /foodie
WORKDIR /foodie
COPY  package.json package.json
RUN set -x && npm install --no-color && rm -rf /root/.node-gyp /root/.npm /tmp/npm*
COPY  ./ ./
CMD ["node", "."]

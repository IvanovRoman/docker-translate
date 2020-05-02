FROM node:11-alpine

ENV CHROME_BIN="/usr/bin/chromium-browser" \
  NODE_ENV="production"
RUN set -x \
  && apk update \
  && apk upgrade \
  && apk add --no-cache \
  dumb-init \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  nodejs \
  yarn \
  && yarn add puppeteer@1.19.0 \
  \
  # Cleanup
  && apk del --no-cache make gcc g++ python binutils-gold gnupg libstdc++ \
  && rm -rf /usr/include \
  && rm -rf /var/cache/apk/* /root/.node-gyp /usr/share/man /tmp/* \
  && echo
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
COPY . /app
RUN cd /app && npm install --quiet
EXPOSE 3000
WORKDIR /app
ENTRYPOINT ["/usr/bin/dumb-init"]
CMD npm run start
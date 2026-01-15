# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.11.1

FROM node:${NODE_VERSION} AS build

# Run the application as a non-root user.
USER node

WORKDIR /usr/src/app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.yarn to speed up subsequent builds.
# Leverage a bind mounts to package.json and yarn.lock to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile --ignore-scripts

# Copy the rest of the source files into the image.
COPY . .

# Build the application.
RUN yarn tsc

################################################################################

#Production stage
FROM node:${NODE_VERSION}-alpine AS production

# Run the application as a non-root user.
USER node

# Use production node environment by default.
ENV NODE_ENV production

WORKDIR /usr/src/app

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --production --frozen-lockfile --ignore-scripts

# Copy the build 'dist/' into the image.
COPY --from=build /usr/src/app/dist .

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD ["node", "server.js"]


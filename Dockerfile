# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

ARG NODE_VERSION=18.15.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
# ENV NODE_ENV production
# Not setting this now as there build failes because there are some devDependencies that run in production mode
# But when NODE_ENV is set to procuction during build, devDependencies are not installed and build failes

WORKDIR /usr/src/app

# Copy the rest of the source files into the image.
COPY . .

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.yarn to speed up subsequent builds.
# Leverage a bind mounts to package.json and yarn.lock to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile

# Run the application as a non-root user.
# USER node

# TODO: There are some packages like log and new-relic which cannot run in non-root usermode
#       it requires permisson create files, find a solution for it and run in non-root user mode

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD ["yarn", "start"]

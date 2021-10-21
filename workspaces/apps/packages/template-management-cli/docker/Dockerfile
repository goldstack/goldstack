FROM goldstack/goldstack-docker-build:0.1.3

COPY / /app

RUN yarn

# assuming things are already compiled

WORKDIR /app/workspaces/apps/packages/template-management-cli

ENTRYPOINT ["yarn", "cli"]
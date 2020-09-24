FROM goldstack/goldstack-docker-build:0.1.2

COPY / /app

RUN yarn

# assuming things are already compiled
# RUN yarn compile

WORKDIR /app/workspaces/templates-management/packages/template-management-cli

ENTRYPOINT ["yarn", "cli"]
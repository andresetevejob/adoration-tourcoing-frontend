# ---- build ----
FROM node:20-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/user-app/package.json apps/user-app/package.json
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
RUN npm run build --workspace=apps/user-app

# ---- runtime ----
FROM nginx:1.27-alpine AS runtime
COPY apps/user-app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/user-app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

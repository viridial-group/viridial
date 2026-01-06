### Dockerfile for shadcn-vue frontend
FROM node:18-alpine AS build
WORKDIR /app

# Build admin
COPY admin/package*.json ./admin/
RUN cd admin && npm ci
COPY admin ./admin
RUN cd admin && npm run build

# Build agency
COPY agency/package*.json ./agency/
RUN cd agency && npm ci
COPY agency ./agency
RUN cd agency && npm run build

# Build web
COPY web/package*.json ./web/
RUN cd web && npm ci
COPY web ./web
RUN cd web && npm run build

FROM nginx:stable-alpine
# Copy built outputs into subfolders
COPY --from=build /app/admin/dist /usr/share/nginx/html/admin
COPY --from=build /app/agency/dist /usr/share/nginx/html/agency
COPY --from=build /app/web/dist /usr/share/nginx/html
COPY deploy/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

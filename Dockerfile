# ---- Stage 1: build frontend ----
FROM node:20-alpine AS frontend-builder
WORKDIR /app/web
COPY web/package.json ./
RUN npm install
COPY web/ ./
RUN npm run build

# ---- Stage 2: build Go backend ----
FROM golang:1.22-alpine AS backend-builder
WORKDIR /app
RUN apk add --no-cache git
COPY go.mod ./
COPY cmd ./cmd
COPY internal ./internal
RUN GONOSUMDB=* GOFLAGS=-mod=mod CGO_ENABLED=0 GOOS=linux \
    go build -o /app/pgbouncer-manager ./cmd/server

# ---- Stage 3: minimal runtime ----
FROM alpine:3.19
RUN apk add --no-cache ca-certificates openssh-client
WORKDIR /app
COPY --from=backend-builder /app/pgbouncer-manager ./pgbouncer-manager
COPY --from=frontend-builder /app/web/dist ./web/dist
EXPOSE 8088
ENTRYPOINT ["./pgbouncer-manager"]

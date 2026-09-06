FROM golang:1.26-alpine AS build

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/api ./cmd/api

FROM alpine:3.22

RUN adduser -D -H appuser

WORKDIR /app
COPY --from=build /out/api ./api

USER appuser

EXPOSE 5004

ENTRYPOINT ["/app/api"]
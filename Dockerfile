FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY cmd ./cmd
COPY configs ./configs
RUN go build -o /out/openhands ./cmd/server

FROM alpine:3.20
WORKDIR /app
COPY --from=build /out/openhands /app/openhands
COPY configs /app/configs
EXPOSE 8090
CMD ["/app/openhands"]

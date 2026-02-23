FROM golang:1.22-alpine AS build
WORKDIR /src
COPY main.go ./
RUN go build -o /out/sandbox-runtime .
FROM alpine:3.20
COPY --from=build /out/sandbox-runtime /sandbox-runtime
CMD ["/sandbox-runtime"]

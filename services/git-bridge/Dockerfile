FROM golang:1.22-alpine AS build
WORKDIR /src
COPY main.go ./
RUN go build -o /out/git-bridge .
FROM alpine:3.20
COPY --from=build /out/git-bridge /git-bridge
CMD ["/git-bridge"]

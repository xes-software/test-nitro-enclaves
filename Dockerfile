FROM denoland/deno:alpine-2.5.2 AS builder
COPY ./serve.ts .
RUN deno compile --unstable-vsock -A -o server server.ts

FROM alpine:3.22.2
COPY --from=builder server .
COPY aws-nitro-enclaves-sdk-c/bin/kmstool-enclave-cli/kmstool_enclave_cli /usr/local/bin/
COPY aws-nitro-enclaves-sdk-c/bin/kmstool-enclave-cli/libnsm.so /usr/lib/
RUN chmod +x /usr/local/bin/kmstool_enclave_cli

CMD ["./server"]
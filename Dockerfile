FROM denoland/deno:alpine-2.5.2 AS builder

COPY ./server.ts .
RUN deno compile --unstable-vsock -A --output server server.ts

COPY aws-nitro-enclaves-sdk-c/bin/kmstool-enclave-cli/kmstool_enclave_cli /usr/local/bin/
COPY aws-nitro-enclaves-sdk-c/bin/kmstool-enclave-cli/libnsm.so /usr/lib/
RUN chmod +x /usr/local/bin/kmstool_enclave_cli

CMD ["./server"]
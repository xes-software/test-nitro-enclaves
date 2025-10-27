FROM denoland/deno:alpine-2.5.2 AS builder
COPY ./server.ts .
RUN deno bundle --minify -o server.js server.ts

COPY aws-nitro-enclaves-sdk-c/bin/kmstool-enclave-cli/kmstool_enclave_cli /usr/local/bin/
COPY aws-nitro-enclaves-sdk-c/bin/kmstool-enclave-cli/libnsm.so /usr/lib/
RUN chmod +x /usr/local/bin/kmstool_enclave_cli

CMD ["deno", "run", "--unstable-vsock", "-A", "server.js"]
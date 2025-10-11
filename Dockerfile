FROM denoland/deno:alpine-2.5.2

COPY server.ts ./
COPY aws-nitro-enclaves-sdk-c/bin/kmstool-enclave-cli/kmstool_enclave_cli ./
COPY aws-nitro-enclaves-sdk-c/bin/kmstool-enclave-cli/libnsm.so /usr/lib64/

CMD ["deno", "run", "--unstable-vsock", "--allow-net", "server.ts"]
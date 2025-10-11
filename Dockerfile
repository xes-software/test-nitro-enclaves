FROM denoland/deno:alpine-2.5.2

COPY test-nitro-enclaves/server.ts ./
COPY test-nitro-enclaves/aws-nitro-enclaves-sdk-c/bin/kmstool-enclave-cli/kmstool_enclave_cli ./
COPY test-nitro-enclaves/aws-nitro-enclaves-sdk-c/bin/kmstool-enclave-cli/libnsm.so /usr/lib64/

CMD ["deno", "run", "--unstable-vsock", "--allow-net", "server.ts"]
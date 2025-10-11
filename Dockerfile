FROM denoland/deno:alpine-2.5.2

COPY server.ts ./
COPY aws-nitro-enclaves-sdk-c/bin/kmstool-enclave-cli/kmstool_enclave_cli /usr/local/bin/
COPY aws-nitro-enclaves-sdk-c/bin/kmstool-enclave-cli/libnsm.so /usr/lib64/

RUN chmod +x /usr/local/bin/kmstool_enclave_cli

CMD ["deno", "run", "--unstable-vsock", "-A", "server.ts"]
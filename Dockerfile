FROM denoland/deno:alpine-2.5.2

COPY server.ts ./
COPY kmstool_enclave_cli ./
COPY libnsm.so /usr/lib64/

CMD ["deno", "run", "--unstable-vsock", "--allow-net", "server.ts"]
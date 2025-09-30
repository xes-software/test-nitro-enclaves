FROM denoland/deno:alpine-2.5.2
COPY . .
CMD ["deno", "run", "--unstable-vsock", "--allow-net", "server.ts"]
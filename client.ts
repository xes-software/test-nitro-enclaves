const client = Deno.createHttpClient({
  proxy: {
    transport: "vsock",
    cid: 16,
    port: 3000,
  },
});

const result = await fetch("http://vsock/stuff", {
  client,
  body: JSON.stringify({ hello: "hello" }),
  method: "POST",
});

console.log("Logging result:", await result.text());

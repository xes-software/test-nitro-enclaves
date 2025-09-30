try {
  Deno.serve({ transport: "vsock", cid: -1, port: 3000 }, async (req, info) => {
    console.log("Logging cid:", info.remoteAddr.cid);
    console.log(await req.json());
    return new Response("stuff");
  });
} catch (e) {
  console.log(e);
  await new Promise((resolve) => setTimeout(resolve, 60000));
}

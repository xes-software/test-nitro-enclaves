try {
  Deno.serve({ transport: "vsock", cid: -1, port: 3000 }, async (req, info) => {
    console.log("Logging cid:", info.remoteAddr.cid);

    const { secretAccessKey, sessionToken, accessKeyId } =
      (await req.json()) as {
        accessKeyId: string;
        sessionToken: string;
        secretAccessKey: string;
      };

    const command = new Deno.Command("kmstool_enclave_cli", {
      args: [
        "genrandom",
        "--region",
        "us-east-1",
        "--aws-access-key-id",
        accessKeyId,
        "--aws-secret-access-key",
        secretAccessKey,
        "--aws-session-token",
        sessionToken,
        "--proxy-port",
        "8000",
        "--length",
        "32",
      ],
    });

    const { code, stdout, stderr } = await command.output();

    console.log("Exit code:", code);
    console.log("STDOUT:", new TextDecoder().decode(stdout));
    console.log("STDERR:", new TextDecoder().decode(stderr));

    return new Response("stuff");
  });
} catch (e) {
  console.log(e);
  await new Promise((resolve) => setTimeout(resolve, 60000));
}

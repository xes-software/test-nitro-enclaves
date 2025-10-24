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

    const genDataKeyCommand = new Deno.Command("kmstool_enclave_cli", {
      args: [
        "genkey",
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
        "--key-id",
        "164ea6b3-0d6f-4386-9529-ffa1a978176c",
        "--key-spec",
        "AES-256",
      ],
    });

    const decryptDataKeyCommand = new Deno.Command("kmstool_enclave_cli", {
      args: [
        "decrypt",
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
        "--key-id",
        "164ea6b3-0d6f-4386-9529-ffa1a978176c",
        "--encryption-algorithm",
        "AES-256",
      ],
    });

    const { code, stdout, stderr } = await command.output();
    console.log("Exit code:", code);
    const output = new TextDecoder().decode(stdout);
    const randomBytes = output.split(":")[1];
    console.log("Logging output:", output);
    console.log(`Logging randomBytes:[${randomBytes}]`);
    console.log("STDOUT:", new TextDecoder().decode(stdout));
    console.log("STDERR:", new TextDecoder().decode(stderr));

    const {
      code: genCode,
      stdout: genStdout,
      stderr: genStderr,
    } = await genDataKeyCommand.output();
    console.log("GEN Exit code:", genCode);
    console.log("GEN STDOUT:", new TextDecoder().decode(genStdout));
    console.log("GEN STDERR:", new TextDecoder().decode(genStderr));

    const genOutput = new TextDecoder().decode(genStdout);
    const [genCipher, genPlaintext] = genOutput.split("\n");
    console.log("GEN Cipher:", genCipher);
    console.log("GEN Plaintext:", genPlaintext);

    const {
      code: decryptCode,
      stdout: decryptStdout,
      stderr: decryptStderr,
    } = await decryptDataKeyCommand.output();
    console.log("Decrypt Exit code:", decryptCode);
    console.log("Decrypt STDOUT:", new TextDecoder().decode(decryptStdout));
    console.log("Decrypt STDERR:", new TextDecoder().decode(decryptStderr));

    const decryptOutput = new TextDecoder().decode(decryptStdout);
    const decryptPlaintext = decryptOutput.split(":")[1];
    console.log(`decrypt Plaintext: [${decryptPlaintext}`);

    return new Response(
      `Generated plaintext: [${genPlaintext}]; Decrypted plaintext: [${decryptPlaintext}]`
    );
  });
} catch (e) {
  console.log(e);
  await new Promise((resolve) => setTimeout(resolve, 60000));
}

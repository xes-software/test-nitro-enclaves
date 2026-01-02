import { Ed25519PrivateKey, ready } from "@cardano-sdk/crypto";
import { encodeBase64, decodeBase64 } from "@std/encoding";

try {
  await ready();
  Deno.serve({ transport: "vsock", cid: -1, port: 3000 }, async (req) => {
    const { secretAccessKey, sessionToken, accessKeyId, kmsKeyId } =
      (await req.json()) as {
        accessKeyId: string;
        sessionToken: string;
        secretAccessKey: string;
        kmsKeyId: string;
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
        kmsKeyId,
        "--key-spec",
        "AES-256",
      ],
    });

    const { code, stdout, stderr } = await command.output();
    console.log("Exit code:", code);
    const output = new TextDecoder().decode(stdout);
    const randomBytes = output.split(":")[1].trim();
    const randomBytesArray = decodeBase64(randomBytes);

    console.log("Logging output:", output);
    console.log(`Logging randomBytes:[${randomBytes}]`);
    console.log("STDOUT:", new TextDecoder().decode(stdout));
    console.log("STDERR:", new TextDecoder().decode(stderr));

    const privateKey = Ed25519PrivateKey.fromNormalBytes(randomBytesArray);
    console.log("Private Key after conversion:", privateKey.bytes().toBase64());
    console.log("Private Key before conversion:", randomBytes);

    const publicKey = privateKey.toPublic();
    const publicKeyHashHex = publicKey.hash().hex();
    console.log("Public key hash hex:", publicKey.hash().hex());
    console.log("Public key .hex():", publicKey.hex());

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
    const cipherText = genCipher.split(":")[1].trim();
    const plaintext = genPlaintext.split(":")[1].trim();

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      Uint8Array.fromBase64(plaintext),
      { name: "AES-GCM" },
      true,
      ["encrypt", "decrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedPrivateKey = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      randomBytesArray
    );

    const encryptedPrivateKeyBase64 = encodeBase64(encryptedPrivateKey);

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
        "--ciphertext",
        cipherText,
        "--proxy-port",
        "8000",
      ],
    });
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

    const result = {
      encryptedPrivateKeyBase64,
      publicKeyHashHex,
      cipherText,
      ivBase64: encodeBase64(iv),
    };

    return new Response(JSON.stringify(result));
  });
} catch (e) {
  console.log(e);
  await new Promise((resolve) => setTimeout(resolve, 60000));
}

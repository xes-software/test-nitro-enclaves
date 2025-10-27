import {
  STSClient,
  AssumeRoleCommand,
  GetCallerIdentityCommand,
} from "npm:@aws-sdk/client-sts@3.908.0";

const stsClient = new STSClient({ region: "us-east-1" });
const identityCommand = new GetCallerIdentityCommand({});
const identity = await stsClient.send(identityCommand);

const arnParts = identity.Arn!.split("/");
const roleName = arnParts[1];
const accountId = identity.Account;

const roleArn = `arn:aws:iam::${accountId}:role/${roleName}`;

const roleCommand = new AssumeRoleCommand({
  RoleArn: roleArn,
  RoleSessionName: "TestSession",
});
const role = await stsClient.send(roleCommand);
console.log("Role:", role);
const accessKeyId = role.Credentials!.AccessKeyId!;
const sessionToken = role.Credentials!.SessionToken!;
const secretAccessKey = role.Credentials!.SecretAccessKey!;

const client = Deno.createHttpClient({
  proxy: {
    transport: "vsock",
    cid: 16,
    port: 3000,
  },
});

const result = await fetch("http://vsock/stuff", {
  client,
  body: JSON.stringify({ accessKeyId, sessionToken, secretAccessKey }),
  method: "POST",
});

console.log("Logging result:", await result.json());

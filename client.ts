import {
  STSClient,
  AssumeRoleCommand,
  GetCallerIdentityCommand,
} from "npm:@aws-sdk/client-sts@3.908.0";

const stsClient = new STSClient({ region: "us-east-1" });
const identityCommand = new GetCallerIdentityCommand({});
const identity = await stsClient.send(identityCommand);
const roleCommand = new AssumeRoleCommand({
  RoleArn: identity.Arn,
  RoleSessionName: "TestSession",
});
const role = await stsClient.send(roleCommand);
console.log("Role:", role);

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

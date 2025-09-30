# deploy with ec2 instance:

Create an ec2 instance with nitro enclaves enabled with amazon linux 2023 (m5.xlarge).

```bash

cd ~

# Install nitro enclaves functionality
sudo dnf install aws-nitro-enclaves-cli -y
sudo dnf install aws-nitro-enclaves-cli-devel -y
sudo usermod -aG ne ec2-user
sudo usermod -aG docker ec2-user

# Install git
sudo dnf install -y git
git clone https://github.com/xes-software/test-nitro-enclaves.git

# Install deno
curl -fsSL https://deno.land/install.sh | sh

# Build docker image
docker build ./test-nitro-enclaves -t enclave

# Build enclave image
nitro-cli build-enclave --docker-uri enclave --output-file enclave.eif

# Start enclave
nitro-cli run-enclave --cpu-count 2 --memory 5000 --enclave-cid 16 --eif-path enclave.eif --debug-mode

# Start server to talk to enclave
deno run -A ./test-nitro-enclaves/client.ts
```

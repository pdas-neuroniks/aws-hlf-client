# sudo apt-get update
# sudo apt-get upgrade -y
# sudo apt install unzip -y
# sudo apt-get install git -y
# sudo apt-get install curl -y
# sudo apt-get install docker.io -y
# sudo apt install docker-compose -y
# sudo apt install tree -y
# docker --version
# docker-compose --version
sudo apt-get install -y jq

sleep 5

sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -a -G docker $USER


sleep 5
wget https://go.dev/dl/go1.14.4.linux-amd64.tar.gz
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.14.4.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
go version

sleep 5
sudo apt-cache show nodejs
sudo apt install nodejs -y
curl -sL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup.sh
sudo bash /tmp/nodesource_setup.sh
sudo apt-get install -y nodejs
node --version
npm --version

sleep 5
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
aws --version
sudo rm awscliv2.zip && sudo rm -rf aws

sleep 5
aws s3 cp s3://us-east-1.managedblockchain/etc/managedblockchain-tls-chain.pem /home/ubuntu/managedblockchain-tls-chain.pem
openssl x509 -noout -text -in /home/ubuntu/managedblockchain-tls-chain.pem

sleep 5
sudo reboot now
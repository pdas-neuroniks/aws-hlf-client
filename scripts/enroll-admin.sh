fabric-ca-client enroll \
    -u 'https://admin:A6minPw8A6minPw@ca.m-3pv7agmbbnan3eqyf3x3llddqu.n-jyv5ovyrazfkxl4bpwzhok3t7y.managedblockchain.us-east-1.amazonaws.com:30002' 
    --tls.certfiles /home/ubuntu/resource/managedblockchain-tls-chain.pem \
    -M /home/ubuntu/resource/admin-msp

cp -r /home/ubuntu/resource/admin-msp/signcerts /home/ubuntu/resource/admin-msp/admincerts



curl https://ca.m-3pv7agmbbnan3eqyf3x3llddqu.n-jyv5ovyrazfkxl4bpwzhok3t7y.managedblockchain.us-east-1.amazonaws.com:30002/cainfo -k


fabric-ca-client enroll \
  -u "https://admin:$(aws secretsmanager get-secret-value --secret-id arn:aws:secretsmanager:us-east-1:108625623765:secret:BlockcedeDevHLFNetworkAdmin-bxnQ9cO3hDiI-ARLHYa --query SecretString --output text)@ca.m-3pv7agmbbnan3eqyf3x3llddqu.n-jyv5ovyrazfkxl4bpwzhok3t7y.managedblockchain.us-east-1.amazonaws.com:30002" \
  --tls.certfiles /home/ubuntu/resource/managedblockchain-tls-chain.pem \
  -M /home/ubuntu/resource/admin-msp


docker exec cli configtxgen \
    -outputCreateChannelTx /opt/home/mychannel.pb \
    -profile OneOrgChannel -channelID mychannel \
    --configPath /opt/home/admin-msp


/opt/home/admin-msp/cacerts:



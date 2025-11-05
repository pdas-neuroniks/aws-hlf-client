fabric-ca-client enroll \
    -u 'https://ca.m-76kcdfjjmrerrgvqmqxk4hppdy.n-ur4arjlu2jg33grsypbqyvkgim.managedblockchain.us-east-1.amazonaws.com:30002' \
    --id.name admin
    --id.secret el0L$+BXf(:VAH1$%o3h[a-ged6A$+T%@
    --tls.certfiles /home/ubuntu/resource/managedblockchain-tls-chain.pem -M /home/ubuntu/resource/admin-msp

curl https://ca.m-76kcdfjjmrerrgvqmqxk4hppdy.n-ur4arjlu2jg33grsypbqyvkgim.managedblockchain.us-east-1.amazonaws.com:30002/cainfo -k


fabric-ca-client enroll \
  -u "https://admin:$(aws secretsmanager get-secret-value --secret-id arn:aws:secretsmanager:us-east-1:108625623765:secret:BlockcedeDevHLFNetworkAdmin-0d7lAkv8BXYZ-PVChH6 --query SecretString --output text)@ca.m-76kcdfjjmrerrgvqmqxk4hppdy.n-ur4arjlu2jg33grsypbqyvkgim.managedblockchain.us-east-1.amazonaws.com:30002" \
  --tls.certfiles /home/ubuntu/resource/managedblockchain-tls-chain.pem \
  -M /home/ubuntu/resource/admin-msp
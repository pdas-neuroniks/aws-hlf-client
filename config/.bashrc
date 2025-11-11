# GOPATH is the location of your work directory
export GOPATH=$HOME/go

# CASERVICEENDPOINT is the endpoint to reach your member's CA
export CASERVICEENDPOINT=ca.m-ga2tf7fkbzbxtcydzhxebi3v6a.n-3ibx7ieydjdnborkil7y46iu7u.managedblockchain.us-east-1.amazonaws.com:30002

# ORDERER is the endpoint to reach your network's orderer
export ORDERER=orderer.n-3ibx7ieydjdnborkil7y46iu7u.managedblockchain.us-east-1.amazonaws.com:30001

export PEERNODE=nd-jaweivam6naxrm55i64xskqw74.m-ga2tf7fkbzbxtcydzhxebi3v6a.n-3ibx7ieydjdnborkil7y46iu7u.managedblockchain.us-east-1.amazonaws.com:30003

# Update PATH so that you can access the go binary system wide
export GOROOT=/usr/local/go/bin
export PATH=$PATH:$GOROOT/bin:$GOROOT/bin
export PATH=$PATH:/home/ubuntu/fabric-samples/bin
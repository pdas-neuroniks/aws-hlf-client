const FabricCAClient = require('fabric-ca-client');
const utilities = require('./utilities');

// Extract environment variables
const adminPasswordArn = 'arn:aws:secretsmanager:us-east-1:108625623765:secret:BlockcedeDevHLFNetworkAdmin-oJeJ4OBnlelE-CHtju7' || process.env.ADMIN_PASSWORD_ARN;
const caEndpoint = 'ca.m-vfdlclj4vbbttjf5zccs4kwmlm.n-mg5a2tjkybbapklh6gxvba427m.managedblockchain.us-east-1.amazonaws.com:30002' || process.env.CA_ENDPOINT;
const privateKeyArn = 'arn:aws:secretsmanager:us-east-1:108625623765:secret:BlockcedeDevHLFNetworkAdmin-sM88vgxOrHSF-1gXezU' || process.env.PRIVATE_KEY_ARN;
const signedCertArn = 'arn:aws:secretsmanager:us-east-1:108625623765:secret:BlockcedeDevHLFNetworkAdmin-2esplnxfwze0-M5M84i' || process.env.SIGNED_CERT_ARN;
const tlsCertBucket = 'us-east-1.managedblockchain' || process.env.TLS_CERT_BUCKET;
const tlsCertKey = 'etc/managedblockchain-tls-chain.pem' || process.env.TLS_CERT_KEY;

const caUrl = `https://${caEndpoint}`;
const caName = utilities.getCaName(caEndpoint);

// Enroll the admin only on creation
exports.handler = async (event) => {
  if (event.RequestType === 'Create') {
    try {
      // Get the TLS cert from S3
      const caTlsCert = await utilities.getS3Object(tlsCertBucket, tlsCertKey);
      console.log('caTlsCert', caTlsCert)
      // Get the admin credentials from Secrets Manager
      const adminPwd = await utilities.getSecret(adminPasswordArn);
      console.log('adminPwd',adminPwd)
      // Create a new client for interacting with the CA
      const ca = new FabricCAClient(caUrl, { trustedRoots: caTlsCert, verify: false }, caName);
      console.log('ca',ca)
      // Enroll the admin user, and import the new identity into Secrets Manager
      const enrollment = await ca.enroll({ enrollmentID: 'admin123', enrollmentSecret: adminPwd });
      console.log('enrollment',enrollment)
      await utilities.putSecret(privateKeyArn, enrollment.key.toBytes());
      await utilities.putSecret(signedCertArn, enrollment.certificate);
    } catch (error) {
      console.error(`Failed to enroll admin user: ${error}`);
    }
  }
};

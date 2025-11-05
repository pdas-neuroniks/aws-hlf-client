const FabricCAClient = require('fabric-ca-client');
const utilities = require('./utilities');
require('dotenv').config()
console.log(process.env)


// Extract environment variables
const adminPasswordArn = process.env.ADMIN_PASSWORD_ARN;
const caEndpoint = process.env.CA_ENDPOINT;
const privateKeyArn = process.env.PRIVATE_KEY_ARN;
const signedCertArn = process.env.SIGNED_CERT_ARN;
const tlsCertBucket = process.env.TLS_CERT_BUCKET;
const tlsCertKey = process.env.TLS_CERT_KEY;

const caUrl = `https://${caEndpoint}`;
const caName = utilities.getCaName(caEndpoint);

// Enroll the admin only on creation
async function main() {
  
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
    const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: adminPwd });
    console.log('enrollment',enrollment)
    const privateKeyArnOutput = await utilities.putSecret(privateKeyArn, enrollment.key.toBytes());
    console.log('privateKeyArnOutput', privateKeyArnOutput)
    const signedCertArnOutput = await utilities.putSecret(signedCertArn, enrollment.certificate);
    console.log('signedCertArnOutput', signedCertArnOutput)
  } catch (error) {
    console.error(`Failed to enroll admin user: ${error}`);
  }

};

main();
const FabricCAClient = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const utilities = require('./utilities');
const { buildWallet } = require('./AppUtil');
require('dotenv').config('../.env');
console.log(process.env)


// Extract environment variables
const adminPasswordArn = process.env.ADMIN_PASSWORD_ARN;
const memberId = process.env.MEMBER_ID;
const caEndpoint = process.env.CA_ENDPOINT;
const privateKeyArn = process.env.PRIVATE_KEY_ARN;
const signedCertArn = process.env.SIGNED_CERT_ARN;
const tlsCertBucket = process.env.TLS_CERT_BUCKET;
const tlsCertKey = process.env.TLS_CERT_KEY;

const WALLET_PATH = '../wallet';
const adminUserId='admin'
const caUrl = `https://${caEndpoint}`;
const caName = utilities.getCaName(caEndpoint);

// Enroll the admin only on creation
async function main() {
  
  try {
    const wallet = await buildWallet(Wallets, path.join(WALLET_PATH, `${memberId}-wallet`));
    // Check to see if we've already enrolled the admin user.
		const identity = await wallet.get(adminUserId);
		if (identity) {
			console.log('An identity for the admin user already exists in the wallet');
			return;
		}

		
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
    const enrollment = await ca.enroll({ enrollmentID: adminUserId, enrollmentSecret: adminPwd });
    console.log('enrollment',enrollment)

    const privateKeyArnOutput = await utilities.putSecret(privateKeyArn, enrollment.key.toBytes());
    console.log('privateKeyArnOutput', privateKeyArnOutput)
    const signedCertArnOutput = await utilities.putSecret(signedCertArn, enrollment.certificate);
    console.log('signedCertArnOutput', signedCertArnOutput)

    const x509Identity = {
			credentials: {
				certificate: enrollment.certificate,
				privateKey: enrollment.key.toBytes(),
			},
			mspId: memberId,
			type: 'X.509',
		};
		await wallet.put(adminUserId, x509Identity);
    console.log('Successfully enrolled admin user and imported it into the wallet');

  } catch (error) {
    console.error(`Failed to enroll admin user: ${error}`);
  }

};

main();
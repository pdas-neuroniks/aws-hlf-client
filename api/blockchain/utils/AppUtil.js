/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const fs = require('fs');
const path = require('path');
const AWS = require("aws-sdk");
const {Wallets} = require("fabric-network");
const REGION_CODE = process.env.REGION_CODE || 'us-east-1';


exports.buildCCPOrg1 = () => {
	// load the common connection configuration file
	const ccpPath = path.resolve(__dirname, '..', '..', '..', 'config', 'connection-profile.json');
	const fileExists = fs.existsSync(ccpPath);
	if (!fileExists) {
		throw new Error(`no such file or directory: ${ccpPath}`);
	}
	const contents = fs.readFileSync(ccpPath, 'utf8');

	// build a JSON object from the file contents
	const ccp = JSON.parse(contents);

	console.log(`Loaded the network configuration located at ${ccpPath}`);
	return ccp;
};

exports.buildCCPOrg2 = () => {
	// load the common connection configuration file
	const ccpPath = path.resolve(__dirname, '..', '..', 'test-network',
		'organizations', 'peerOrganizations', 'org2.example.com', 'connection-org2.json');
	const fileExists = fs.existsSync(ccpPath);
	if (!fileExists) {
		throw new Error(`no such file or directory: ${ccpPath}`);
	}
	const contents = fs.readFileSync(ccpPath, 'utf8');

	// build a JSON object from the file contents
	const ccp = JSON.parse(contents);

	console.log(`Loaded the network configuration located at ${ccpPath}`);
	return ccp;
};

exports.buildWallet = async (Wallets, walletPath) => {
	// Create a new  wallet : Note that wallet is for managing identities.
	let wallet;
	if (walletPath) {
		wallet = await Wallets.newFileSystemWallet(walletPath);
		console.log(`Built a file system wallet at ${walletPath}`);
	} else {
		wallet = await Wallets.newInMemoryWallet();
		console.log('Built an in memory wallet');
	}

	return wallet;
};

exports.prettyJSONString = (inputString) => {
	if (inputString) {
		return JSON.stringify(JSON.parse(inputString), null, 2);
	}
	else {
		return inputString;
	}
}

exports.getSecret = async (secretId) => {
	try{
		const SECRET_BINARY = 'SecretBinary';
		let privateRequests = new AWS.SecretsManager({region: REGION_CODE})
			.getSecretValue({SecretId:secretId });
		let SecretBinary=null;
		const data = await privateRequests.promise()
		if(SECRET_BINARY in data){
			SecretBinary = Buffer.from(data.SecretBinary);
			return SecretBinary.toString();
		}
		else{
			return null;
		}
	}catch(err){
		if (err) {
			return null;
		}
	}
};

exports.createWalletIdentity = async (Wallets, publickey, privatekey, mspOrg1) => {
        const x509Identity = {
            credentials: {
                certificate: publickey,
                privateKey: privatekey,
            },
            mspId: mspOrg1,
            type: 'X.509',
        };
	return x509Identity
};

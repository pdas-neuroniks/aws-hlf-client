const express = require('express');
const FabricCAServices = require('fabric-ca-client');
const AWS = require('aws-sdk');
const {buildCCPOrg1, getSecret} = require('../utils/AppUtil');
const {buildCAClient} = require('../utils/CAUtil');
const createError = require('http-errors');
const { Gateway, Wallets } = require('fabric-network');
const { BlockDecoder } = require('fabric-common');
const fabricprotos = require('fabric-protos');
const Long = require('long');
const { StringDecoder } = require('string_decoder');



// Helper
const helper = require('../../../scripts/AppUtil');
const CHANNEL_NAME = 'mychannel'
const REGION_CODE = process.env.REGION


function consolelog(message, param = '') {
    if (true) console.log('[network:enroll]', message, param)
}


module.exports = {

    enroll: async function(req, res) {

        try {

            var secretsmanager = new AWS.SecretsManager({region: REGION_CODE});
            const {user} = req.body
            if (! user){
                return res.status(400).json({response: {
                    // "user": user,
                    "success":false,
                    "message":"User is required!"
                }});
            }
            const ccp = buildCCPOrg1();
            const caClient = buildCAClient(FabricCAServices, ccp, 'ca-org1');
            // const wallet = await buildWallet(Wallets, walletPath);
            const User_Identity_secret = await getSecret(environment + "/privatekey/" + user)
            if (User_Identity_secret) {
                console.log(`An identity for the user ${user} already exists in the wallet`);
                return res.status(409).json({response: {
                        "user": user,
                        "success":false,
                        "message":"User with this username already exist!"
                    }});
            }

            const admin_Identity_secret = await getSecret(environment + "/privatekey/" + adminUserId)
            console.log(admin_Identity_secret.toString())
            console.log(await getSecret(environment + "/publickey/" + adminUserId))
            // const adminIdentity = await wallet.get(adminUserId);
            if (!admin_Identity_secret) {
                console.log('An identity for the admin user does not exist in the wallet');
                console.log('Enroll the admin user before retrying');
                return res.status(409).json({response: {
                        "user": user,
                        "success":false,
                        "message":"An identity for the admin user does not exist in the wallet. Enroll the admin user before retrying"
                    }});
            }
            const wallet = await Wallets.newInMemoryWallet();

            // const wallet = await Wallets.newInMemoryWallet();
            const Admin_x509Identity = await createWalletIdentity(Wallets,
                await getSecret(environment + "/publickey/" + adminUserId), admin_Identity_secret, mspOrg1)

            await wallet.put(user, Admin_x509Identity)

            const provider = wallet.getProviderRegistry().getProvider(Admin_x509Identity.type);
            const adminUser = await provider.getUserContext(Admin_x509Identity, adminUserId);
            const secret = await caClient.register({
                // affiliation: affiliation,
                enrollmentID: user,
                role: 'client'
            }, adminUser);
            const enrollment = await caClient.enroll({
                enrollmentID: user,
                enrollmentSecret: secret
            });
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: mspOrg1,
                type: 'X.509',
            };
            // await wallet.put(user, x509Identity);
            var params = {
                Name: environment + '/publickey/' + user,
                Description: 'Public key file',
                SecretBinary: enrollment.certificate
            };
            secretsmanager.createSecret(params, function(err, data){
                if(err){
                    console.error("Error >> ", err, err.stack);
                }
                else{
                    console.log("Data >> ", data);
                }
            });
            var params = {
                Name: environment + '/privatekey/' + user,
                Description: 'Private key file',
                SecretBinary: enrollment.key.toBytes()
            };
            secretsmanager.createSecret(params, function(err, data){
                if(err){
                    console.error("Error >> ", err, err.stack);
                }
                else{
                    console.log("Data >> ", data);
                }
            });

            console.log(`Successfully registered and enrolled user ${user} and imported it into the wallet`);


            res.status(200).json({response: {
                    "user": user,
                    "success":true,
                    "message":"User enrolled successfully"
                }});

        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            res.status(500).json({error: error});
        }

    }

}
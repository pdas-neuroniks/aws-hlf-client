const express = require('express');
const createError = require('http-errors');
const moment = require('moment');
const { Gateway, Wallets } = require('fabric-network');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const os = require('os');


// Constant
const CHANNEL_NAME = 'mychannel'
const CHAINCODE_NAME = 'biologics_go_v01'


// Helper
const helper = require('../../../scripts/AppUtil');


function consolelog(message, param = '') {
    if (true) console.log('[biologics:add]', message, param)
}


module.exports = {

    addOrder: async function(req, res) {
        try {

            consolelog("=================");
            consolelog("Create New Order");
            consolelog("=================");

            /**docId, representativeEmail, dataHash, version, metadata, createdAt*/
            
            const { dataHash, title, metadata, documentPath, comments, encryptionLevel } = req.body;

            const orderId = uuidv4();
            const createdAt = new Date();
            const createdAtUTC = moment.utc(createdAt).format('DD-MM-yyyy HH:mm:ss');
            const createdBy = 'admin'
            
            const ccp = await helper.buildCCPOrg1()

            const walletPath = await helper.getWalletPath(process.env.MEMBER_ID)
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            //

            let identity = await wallet.get(createdBy);
            if (!identity) {
                consolelog(`An identity for the user ${createdBy} does not exist in the wallet.`);
                return res.status(404).json({
                    status: false,
                    data: null,
                    errorMessage: common.constructErrorMessage(`An identity for the user ${createdBy} does not exist in the wallet.`)
                })
            }
           

            const connectOptions = {
                wallet,
                identity: createdBy,
                discovery: { enabled: true, asLocalhost: AS_LOCALHOST }
            }
            

            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);
            

            const network = await gateway.getNetwork(CHANNEL_NAME);
            const contract = network.getContract(CHAINCODE_NAME);
            

            /** docId, representativeEmail, dataHash, version, title,  metadata, createdAt, documentPath, comments, encryptionLevel */

            const payload = {
                ...req.body,
                orderId,
                createdAtUTC
            }
            await contract.submitTransaction('CreateOrder', JSON.stringify(payload));


            await gateway.disconnect();
            consolelog("Gateway Disconnected!")

            return res.status(200).json({
                status: true,
                data: {
                    ...req.body,
                    orderId,
                    txId: 'pending...'
                },
                errorMessage: null
            })

        } catch (error) {
            console.error(error.message)

            return res.status(500).json({
                status: false,
                data: null,
                errorMessage: `${error.message}`
            })
        }
    },
}




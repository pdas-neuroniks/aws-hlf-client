const express = require('express');
const createError = require('http-errors');
const moment = require('moment');
const { Gateway, Wallets } = require('fabric-network');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const os = require('os');


// Constant
const CHANNEL_NAME = 'mychannel'
const CHAINCODE_NAME = 'biologics_go_v02'


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
                discovery: { enabled: true, asLocalhost: false }
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

    updateOrder: async function(req, res) {
        try {

            consolelog("Update Order")

            // let carnumber = req.body.carnumber;
            let orderId = req.params.ORDERID ? req.params.ORDERID : "";
            consolelog("Order Id", orderId)

            const createdAt = new Date()
            const modifiedAtUTC = moment.utc(createdAt).format('DD-MM-yyyy HH:mm:ss')
            const createdBy = 'admin';
            

            const ccp = await helper.buildCCPOrg1()

            const walletPath = await helper.getWalletPath(process.env.MEMBER_ID)
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            

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
                discovery: { enabled: true, asLocalhost: false }
            }

            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);

            const network = await gateway.getNetwork(CHANNEL_NAME);

            const contract = network.getContract(CHAINCODE_NAME);

            
            const payload = {
                ...req.body,
                orderId,
                modifiedAtUTC
            }
            await contract.submitTransaction('UpdateOrderStatus', JSON.stringify(payload));

            await gateway.disconnect();

            return res.status(200).json({
                status: true,
                data: {
                    ...req.body,
                    orderId,
                    modifiedAtUTC
                },
                errorMessage: null
            })

        } catch (error) {
            console.error(error.message)
            return res.status(500).json({
                status: false,
                data: null,
                errorMessage: `${error.message}.`
            })
        }
    },

    getOrderByPagination: async function(req, res) {
        try {

            consolelog("=================");
            consolelog("Get Order By Pagination");
            consolelog("=================");

            /**docId, representativeEmail, dataHash, version, metadata, createdAt*/
            
            const { orderId, bookmark, pageSize } = req.body;

            const pagesize = pageSize || "10";
            // const createdAt = new Date();
            // const createdAtUTC = moment.utc(createdAt).format('DD-MM-yyyy HH:mm:ss');
            const createdBy = 'admin'
            
            const ccp = await helper.buildCCPOrg1()

            const walletPath = await helper.getWalletPath(process.env.MEMBER_ID)
            const wallet = await Wallets.newFileSystemWallet(walletPath);

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
                discovery: { enabled: true, asLocalhost: false }
            }
            
            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);
            

            const network = await gateway.getNetwork(CHANNEL_NAME);
            const contract = network.getContract(CHAINCODE_NAME);
            

            /** -c '{"function": "GetAllOrdersWithPagination", "args":["{\"selector\":{\"orderId\":\"'${ORDER_ID}'\"}}", "", "10"]}' */

            let queryString = {}
            queryString.selector = {};
            // queryString.selector.orderId = orderId;
            queryString.selector.docType = "order_records";
            // queryString.selector.createdBy = createdBy;
            // queryString.sort = [{"modifiedAt":"desc"}]

            let results = await contract.submitTransaction('GetAllOrdersWithPagination', JSON.stringify(queryString), bookmark || "", pagesize);


            await gateway.disconnect();
            consolelog("Gateway Disconnected!")

            return res.status(200).json({
                status: true,
                results: JSON.parse(results.toString()),
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




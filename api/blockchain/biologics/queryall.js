const express = require('express');
const createError = require('http-errors');
const { Gateway, Wallets } = require('fabric-network');
const { BlockDecoder } = require('fabric-common');
const fabricprotos = require('fabric-protos');


// Helper
const helper = require('../../../scripts/AppUtil');
const CHANNEL_NAME = 'mychannel'
const CHAINCODE_NAME = 'biologics_go_v02'


function consolelog(message, param = '') {
    if (true) console.log('[biologics:queryall]', message, param)
}


module.exports = {

    queryAllOrders: async function(req, res) {
        try {

            consolelog("Get-All-Orders");

            let _identity = 'admin';
            let organization = req.params.ORG;

            const ccp = await helper.buildCCPOrg1()
            
            const walletPath = await helper.getWalletPath(process.env.MEMBER_ID)
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            
            let identity = await wallet.get(_identity);
            if (!identity) {
                consolelog(`An identity for the user ${_identity} does not exist in the wallet.`);
                return res.status(404).json({
                    status: false,
                    data: '',
                    errorMessage: `An identity for the user ${_identity} does not exist in the wallet.`
                })
            }
            

            const connectOptions = {
                wallet,
                identity: _identity,
                discovery: { enabled: true, asLocalhost: false }
            }
            
            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);
            
            const network = await gateway.getNetwork(CHANNEL_NAME);
            
            // const contract = network.getContract('qscc');
            // consolelog("Contract received.", contract)
            const contract = network.getContract(CHAINCODE_NAME);

            let results = await contract.evaluateTransaction('GetAllOrders')

            await gateway.disconnect();

            consolelog("GateWay Disconnected!!!!!");

            return res.status(200).json({
                status: true,
                results: JSON.parse(results.toString())
            })


        } catch (error) {
            console.error(error.message)

            return res.status(400).json({
                status: true,
                chaininfo: null,
                errorMessage: JSON.stringify(error)
            })

        }
    },

    queryOneOrder: async function(req, res) {
        try {

            consolelog("Get-One-Order");

            let _identity = 'admin';
            // let carnumber = req.body.carnumber;
            let orderId = req.params.ORDERID ? req.params.ORDERID : "";
            consolelog("Order Id", orderId)

            const ccp = await helper.buildCCPOrg1()
            
            const walletPath = await helper.getWalletPath(process.env.MEMBER_ID)
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            
            let identity = await wallet.get(_identity);
            if (!identity) {
                consolelog(`An identity for the user ${_identity} does not exist in the wallet.`);
                return res.status(404).json({
                    status: false,
                    data: '',
                    errorMessage: `An identity for the user ${_identity} does not exist in the wallet.`
                })
            }
            

            const connectOptions = {
                wallet,
                identity: _identity,
                discovery: { enabled: true, asLocalhost: false }
            }
            
            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);
            
            const network = await gateway.getNetwork(CHANNEL_NAME);
            
            // const contract = network.getContract('qscc');
            // consolelog("Contract received.", contract)
            const contract = network.getContract(CHAINCODE_NAME);

            let results = await contract.evaluateTransaction('getOrder', `${orderId}`)

            await gateway.disconnect();

            consolelog("GateWay Disconnected!!!!!");

            return res.status(200).json({
                status: true,
                resulsts: JSON.parse(results.toString())
            })


        } catch (error) {
            console.error(error.message)

            return res.status(400).json({
                status: true,
                chaininfo: null,
                errorMessage: JSON.stringify(error)
            })

        }
    },

    getOrderHistory: async function(req, res) {
        try {

            consolelog("Get-Order-History");

            let _identity = 'admin';
            // let carnumber = req.body.carnumber;
            let orderId = req.params.ORDERID ? req.params.ORDERID : "";
            consolelog("Order Id", orderId)

            const ccp = await helper.buildCCPOrg1()
            
            const walletPath = await helper.getWalletPath(process.env.MEMBER_ID)
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            
            let identity = await wallet.get(_identity);
            if (!identity) {
                consolelog(`An identity for the user ${_identity} does not exist in the wallet.`);
                return res.status(404).json({
                    status: false,
                    data: '',
                    errorMessage: `An identity for the user ${_identity} does not exist in the wallet.`
                })
            }
            

            const connectOptions = {
                wallet,
                identity: _identity,
                discovery: { enabled: true, asLocalhost: false }
            }
            
            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);
            
            const network = await gateway.getNetwork(CHANNEL_NAME);
            
            // const contract = network.getContract('qscc');
            // consolelog("Contract received.", contract)
            const contract = network.getContract(CHAINCODE_NAME);

            let results = await contract.evaluateTransaction('GetOrderHistory', `${orderId}`)

            await gateway.disconnect();

            consolelog("GateWay Disconnected!!!!!");

            return res.status(200).json({
                status: true,
                resulsts: JSON.parse(results.toString())
            })


        } catch (error) {
            console.error(error.message)

            return res.status(400).json({
                status: true,
                chaininfo: null,
                errorMessage: JSON.stringify(error)
            })

        }
    },
    
}
const express = require('express');
const createError = require('http-errors');
const { Gateway, Wallets } = require('fabric-network');
const { BlockDecoder } = require('fabric-common');
const fabricprotos = require('fabric-protos');
const Long = require('long');
const { StringDecoder } = require('string_decoder');



// Helper
const helper = require('../../../scripts/AppUtil');
const CHANNEL_NAME = 'mychannel'


function consolelog(message, param = '') {
    if (true) console.log('[network:info]', message, param)
}


module.exports = {

    getChainInfo: async function(req, res) {
        try {

            consolelog("Get-Chain-Info");

            let _identity = 'admin';
            let organization = req.params.ORG;

            const ccp = await helper.buildCCPOrg1()
            consolelog(ccp)

            const walletPath = await helper.getWalletPath(process.env.MEMBER_ID)
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            consolelog(wallet)

            let identity = await wallet.get(_identity);
            if (!identity) {
                consolelog(`An identity for the user ${_identity} does not exist in the wallet.`);
                return res.status(404).json({
                    status: false,
                    data: '',
                    errorMessage: `An identity for the user ${_identity} does not exist in the wallet.`
                })
            }
            consolelog("Idetity checked")

            const connectOptions = {
                wallet,
                identity: _identity,
                discovery: { enabled: true, asLocalhost: true }
            }
            consolelog("connectOptions checked", connectOptions)
            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);
            consolelog("gateway checked")
            const network = await gateway.getNetwork(CHANNEL_NAME);
            consolelog("network checked")
            const contract = network.getContract('qscc');
            consolelog("Contract received.", contract)

            /**
            GetChainInfo       string = "GetChainInfo"
            GetBlockByNumber   string = "GetBlockByNumber"
            GetBlockByHash     string = "GetBlockByHash"
            GetTransactionByID string = "GetTransactionByID"
            GetBlockByTxID     string = "GetBlockByTxID" 

            */
            // await contract.evaluateTransaction('GetChainInfo', CHANNEL_NAME); // test call
            let results = '' // await contract.evaluateTransaction('GetChainInfo', CHANNEL_NAME);
            consolelog("Results received.")
            consolelog(await contract.evaluateTransaction('GetChainInfo', CHANNEL_NAME);)
            //let results = await contract.evaluateTransaction('getPeersStatus', CHANNEL_NAME);

            await gateway.disconnect();

            consolelog("GateWay Disconnected!!!!!");
            const blockProto = fabricprotos.common.BlockchainInfo.decode(results)
            let long = new Long(blockProto.height.low, blockProto.height.high, blockProto.height.unsigned)
            
            return res.status(200).json({
                status: true,
                chaininfo: {
                    height: long.toString(),
                    currentBlockHash: blockProto.currentBlockHash.toString('hex'),
                    previousBlockHash: blockProto.previousBlockHash.toString('hex')
                },
                errorMessage: null
            })


            //consolelog(results.toString())

        } catch (error) {
            console.error(error.message)

            return res.status(400).json({
                status: true,
                chaininfo: null,
                errorMessage: JSON.stringify(error)
            })

        }
    },

    getTransactionByTxID: async function(req, res) {
        try {

            consolelog("Get-Transaction-By-ID");

            let _identity = 'admin';

            let tnxId = req.params.TNXID;
            //let organization = req.params.ORG;

            const representativeOrganisation = await sharedCommon.returnBackOrganizationName(req.params.ORG);

            if(tnxId){
                    

                const ccp = await helper.getCCP(representativeOrganisation)

                const walletPath = await helper.getWalletPath(representativeOrganisation)
                const wallet = await Wallets.newFileSystemWallet(walletPath);
                

                let identity = await wallet.get(_identity);
                if (!identity) {
                    consolelog(`An identity for the user ${_identity} does not exist in the wallet.`);
                    return res.status(404).json({
                        status: false,
                        data: '',
                        errorMessage: common.constructErrorMessage(`An identity for the user ${_identity} does not exist in the wallet.`)
                    })
                }
                //consolelog("Idetity checked")

                const connectOptions = {
                        wallet,
                        identity: _identity,
                        discovery: { enabled: true, asLocalhost: AS_LOCALHOST }
                    }
                    //consolelog("Connect Options ready")

                const gateway = new Gateway();
                await gateway.connect(ccp, connectOptions);
                //consolelog("Gateway connected.")

                const network = await gateway.getNetwork(CHANNEL_NAME);
                //consolelog("Network Received.")

                const contract = network.getContract('qscc');
                //consolelog("Contract received.")

                let results = await contract.evaluateTransaction('GetTransactionByID', CHANNEL_NAME, tnxId);
                
                await gateway.disconnect();
                consolelog("GateWay Disconnected!!!!!");

                

                //const resultDecoded = JSON.stringify(fabricprotos.common.Block.decode(results));
                const resultDecoded = fabricprotos.protos.ProcessedTransaction.decode(results);
                
                
                // results.toString('hex')'
                let blockDecoded = BlockDecoder.decodeTransaction(results);
                //console.log(JSON.parse(JSON.stringify(blockDecoded), null, 100))

                let dataWriten = blockDecoded.transactionEnvelope.payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[1].rwset.writes;

                let resultsJSON = JSON.parse(dataWriten[0].value.toString())
                let payload = {
                    dataHash: resultsJSON.dataHash,
                    createdAt: resultsJSON.createdAt,
                    createdAtUTC: sharedCommon.retureBackUTCDate(resultsJSON,"createdAtUTC"),
                    createdBy: resultsJSON.createdBy,
                    docId: resultsJSON.docId,
                    docStatus: resultsJSON.docStatus,
                    docType: resultsJSON.docType,
                    isActive: resultsJSON.isActive === 1 ? true : false,
                    metadata: resultsJSON.metadata,
                    modifiedAt: resultsJSON.modifiedAt,
                    modifiedAtUTC: sharedCommon.retureBackUTCDate(resultsJSON,"modifiedAtUTC"),
                    modifiedBy: resultsJSON.modifiedBy,
                    sharedWithList: resultsJSON.sharedWithList ? JSON.parse(resultsJSON.sharedWithList) : null,
                    title: resultsJSON.title,
                    txId: resultsJSON.txId,
                    version: resultsJSON.version,
                    documentPath: resultsJSON.documentPath ? resultsJSON.documentPath :'',
                    comments: resultsJSON.comments ? resultsJSON.comments :'',
                    encryptionLevel: parseInt(resultsJSON.encryptionLevel) >= 0 ? parseInt(resultsJSON.encryptionLevel):0
                }

                // recursive convert buffer
                // const data = blockDecoded.transactionEnvelope.signature;
                // console.log(Buffer.from(JSON.parse(JSON.stringify(Buffer.from(data)))).toString())

                // consolelog("transactionEnvelope.signature", blockDecoded.transactionEnvelope.signature.toString('hex'))
                //return res.status(200).json({blockDecoded: blockDecoded.transactionEnvelope.payload.data.actions[0].payload.action.proposal_response_payload.extension})
                
                return res.status(200).json({
                    status: true,
                    transactions: {
                        validation: fabricprotos.protos.TxValidationCode[resultDecoded.validationCode],
                        key: dataWriten[0].key,
                        is_delete: dataWriten[0].is_delete,
                        payload
                    },
                    errorMessage: null
                })

            }else{
                return res.status(400).json({
                    status: true,
                    data: null,
                    errorMessage: common.constructErrorMessage(`${createError.BadRequest().message}. Transaction Id is missing.`,)
                })
            }


        } catch (error) {
            console.error(error.message)

            return res.status(500).json({
                status: true,
                data: null,
                errorMessage: common.constructErrorMessage(`${createError.InternalServerError().message}. ${error.message}.`,)
            })
        }
    },

    getBlockByNumber: async function(req, res) {
        try {

            consolelog("Get-Block-By-Number");

            let _identity = 'admin';

            let blockNum = req.params.BLOCK_NUM;

            if(blockNum){
                

                const ccp = await helper.getCCP('Org1')

                const walletPath = await helper.getWalletPath('Org1')
                const wallet = await Wallets.newFileSystemWallet(walletPath);
                

                let identity = await wallet.get(_identity);
                if (!identity) {
                    consolelog(`An identity for the user ${_identity} does not exist in the wallet.`);
                    return res.status(404).json({
                        status: false,
                        data: '',
                        errorMessage: common.constructErrorMessage(`An identity for the user ${_identity} does not exist in the wallet.`)
                    })
                }
                //consolelog("Idetity checked")

                const connectOptions = {
                        wallet,
                        identity: _identity,
                        discovery: { enabled: true, asLocalhost: AS_LOCALHOST }
                    }
                    //consolelog("Connect Options ready")

                const gateway = new Gateway();
                await gateway.connect(ccp, connectOptions);
                //consolelog("Gateway connected.")

                const network = await gateway.getNetwork(CHANNEL_NAME);
                //consolelog("Network Received.")

                const contract = network.getContract('qscc');
                //consolelog("Contract received.")

                let results = await contract.evaluateTransaction('GetBlockByNumber', CHANNEL_NAME, blockNum);
                
                await gateway.disconnect();
                consolelog("GateWay Disconnected!!!!!");

                //const resultDecoded = JSON.stringify(fabricprotos.common.Block.decode(results));
                //const resultDecoded = fabricprotos.protos.ProcessedTransaction.decode(results)
                
                // results.toString('hex')'
                let blockDecoded = BlockDecoder.decode(results);
                //let dataWriten = blockDecoded.transactionEnvelope.payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[1].rwset.writes;

                //consolelog("T-0-T-A-L", JSON.stringify(blockDecoded))
                
                return res.status(200).json({
                    status: true,
                    blocks: blockDecoded,
                    errorMessage: null
                })


            }else{
                return res.status(400).json({
                    status: true,
                    data: null,
                    errorMessage: common.constructErrorMessage(`${createError.BadRequest().message}. Blocknumber is missing.`)
                })
            }
        } catch (error) {
            console.error(error.message)

            return res.status(500).json({
                status: true,
                data: null,
                errorMessage: common.constructErrorMessage(`${createError.InternalServerError().message}. ${error.message}.`,)
            })
        }
    },

    
}
const express = require('express');
const createError = require('http-errors');
const moment = require('moment');
const { Gateway, Wallets } = require('fabric-network');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const os = require('os');


// Constant
const {DEBUG, CHAINCODE_NAME, CHANNEL_NAME, AS_LOCALHOST, JWT_CONF, ADMIN_USER_NAME} = require('../../controllers/utils/env')


// Helper
const helper = require('../utils/helper');

// common function
const common = require('../../controllers/utils/commonfunc');
const sharedCommon = require('../../../shared/lib/commonfunc');


function consolelog(message, param = '') {
    if (DEBUG) console.log('[documents:add]', message, param)
}


module.exports = {

    addDocuments: async function(req, res) {
        try {

            consolelog("=================");
            consolelog("Create New Documents");
            consolelog("=================");

            /**docId, representativeEmail, dataHash, version, metadata, createdAt*/
            
            const { dataHash, title, metadata, documentPath, comments, encryptionLevel } = req.body;

            const docId = uuidv4();
            const createdAt = new Date();
            const createdAtUTC = moment.utc(createdAt).format('DD-MM-yyyy HH:mm:ss');
            const createdBy = res.locals.userDetails._representativeEmail
            const representativeOrganisation = await sharedCommon.returnBackOrganizationName(res.locals.userDetails._representativeOrganisation)
            const version = "0";

            let _encryptionLevel = '0'
            if(encryptionLevel){
                if(parseInt(encryptionLevel) > 0){
                    _encryptionLevel = encryptionLevel.toString()
                }
            }
            // const _comments = comments ? comments: '';


            const ccp = await helper.getCCP(representativeOrganisation)

            const walletPath = await helper.getWalletPath(representativeOrganisation)
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
            await contract.submitTransaction('addDocument', docId, createdBy, dataHash, version, title, metadata, createdAt.toISOString(), documentPath, comments, _encryptionLevel);

            //consolelog("My User", res.locals.iamuser)

            let params = res.locals.iamuser.params
            let payload = {
                docId, title, createdAt
            }

            if(params){
                let _tempParams = JSON.parse(params);

                if(_tempParams.hasOwnProperty("my_docs")){
                    if(_tempParams.my_docs.filter(x => x.docId === payload.docId).length === 0) {
                        _tempParams.my_docs.push(payload)
                    }
                }else{
                    _tempParams.my_docs = new Array()
                    _tempParams.shared_with_me = new Array()

                    _tempParams.my_docs.push(payload)
                }

                params = JSON.stringify(_tempParams)
            }else{
                let _tempObj = {}
                _tempObj.my_docs = new Array()
                _tempObj.shared_with_me = new Array()

                _tempObj.my_docs.push(payload)

                params = JSON.stringify(_tempObj)
            }

            // representativeEmail, lastLogin, params, representativeName, representativeRole, isActive, representativePassword
            await contract.submitTransaction('updateUser', createdBy, '', params, '', '', '', '');

            await gateway.disconnect();
            //consolelog("Gateway Disconnected!")

            return res.status(200).json({
                status: true,
                data: {
                    docId,
                    docType: 'doc_document',
                    docStatus: 'create',
                    title,
                    metadata,
                    version,
                    encryptionLevel: parseInt(_encryptionLevel),
                    dataHash,
                    createdAt: createdAt.toISOString(),
                    createdAtUTC,
                    createdBy,
                    modifiedAt: createdAt.toISOString(),
                    modifiedAtUTC: createdAtUTC,
                    modifiedBy: createdBy,
                    isActive: true,
                    //sharedWithList: JSON.parse(res.locals.thisdocument.sharedWithList),
                    documentPath,
                    comments,
                    txId: 'pending...'
                },
                errorMessage: null
            })

        } catch (error) {
            console.error(error.message)

            return res.status(500).json({
                status: false,
                data: null,
                errorMessage: common.constructErrorMessage(`${createError.InternalServerError().message}. ${error.message}`)
            })
        }
    },
}




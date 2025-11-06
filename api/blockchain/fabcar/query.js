const express = require('express');
const createError = require('http-errors');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const os = require('os');
const moment = require('moment');

// Constant
const {DEBUG, CHAINCODE_NAME, CHANNEL_NAME, AS_LOCALHOST, ADMIN_USER_NAME, CUSTOMER_ADMINISTRATORS_USER_NAME, ROLE} = require('../../controllers/utils/env')


// Helper
const helper = require('../utils/helper');

// Common
const common = require('../../controllers/utils/commonfunc');
const sharedCommon = require('../../../shared/lib/commonfunc');

function consolelog(message, param = '') {
    if (DEBUG) console.log('[documents:query]', message, param)
}


module.exports = {

    listAllDocuments: async function(req, res) {
        try {

            consolelog("Query All Documents")

            const createdBy = res.locals.userDetails._representativeEmail
            const representativeOrganisation = await sharedCommon.returnBackOrganizationName(res.locals.userDetails._representativeOrganisation);

            const ccp = await helper.getCCP(representativeOrganisation)

            const walletPath = await helper.getWalletPath(representativeOrganisation)
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
                discovery: { enabled: true, asLocalhost: AS_LOCALHOST }
            }

            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);

            const network = await gateway.getNetwork(CHANNEL_NAME);

            const contract = network.getContract(CHAINCODE_NAME);

            //consolelog(identity)
            
            //let results = await contract.evaluateTransaction('queryStringByCreator', SUPER_ADMIN_USER)

            let queryString = {}
            queryString.selector = {};
            queryString.selector.docType = 'doc_document';

            

            let results = await contract.evaluateTransaction('queryAssert', JSON.stringify(queryString))
            
            await gateway.disconnect();

            try{

                let resultsJSON = JSON.parse(results.toString());

                let reply = []

                for (let each in resultsJSON) {
                    (function(idx, arr) {
                        reply.push({
                            docId: arr[idx].Record.docId,
                            dataHash: arr[idx].Record.dataHash,
                            //sharedWithList = ''
                            createdAt: arr[idx].Record.createdAt,
                            createdAtUTC: sharedCommon.retureBackUTCDate(arr[idx].Record,"createdAtUTC"),
                            createdBy: arr[idx].Record.createdBy,
                            modifiedAt: arr[idx].Record.modifiedAt,
                            modifiedAtUTC: sharedCommon.retureBackUTCDate(arr[idx].Record,"modifiedAtUTC"),
                            modifiedBy: arr[idx].Record.modifiedBy,
                            version: arr[idx].Record.version,
                            metadata: arr[idx].Record.metadata,
                            isActive: parseInt(arr[idx].Record.isActive) === 1 ? true:false,
                            documentPath: arr[idx].Record.documentPath ? arr[idx].Record.documentPath : '',
                            comments: arr[idx].Record.comments ? arr[idx].Record.comments : '',
                            encryptionLevel: parseInt(arr[idx].Record.encryptionLevel) >= 0 ? parseInt(arr[idx].Record.encryptionLevel):0
                        })

                    })(each, resultsJSON)
                }
            
                return res.status(200).json({
                    status: true,
                    documents: reply,
                    errorMessage: null
                })

            }catch(error){
                return res.status(400).json({
                    status: false,
                    data: null,
                    errorMessage: common.constructErrorMessage(`${createError.BadRequest().message}. ${error.message}.`)
                })
            }

        } catch (error) {
            console.error(error.message)
            return res.status(500).json({
                status: false,
                data: null,
                errorMessage: common.constructErrorMessage(`${createError.InternalServerError().message}. ${error.message}.`)
            })
        }
    },

    getMyDocuments: async function(req, res) {
        try {

            const createdBy = res.locals.userDetails._representativeEmail
            const representativeOrganisation = await sharedCommon.returnBackOrganizationName(res.locals.userDetails._representativeOrganisation);

            

            let pageSize = req.query.pagesize ? req.query.pagesize : "10";
            let bookmark = req.query.bookmark ? req.query.bookmark : ""

            consolelog(`Query Documents by pagination ${pageSize} ${bookmark}`)

            const ccp = await helper.getCCP(representativeOrganisation)

            const walletPath = await helper.getWalletPath(representativeOrganisation)
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
                discovery: { enabled: true, asLocalhost: AS_LOCALHOST }
            }

            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);

            const network = await gateway.getNetwork(CHANNEL_NAME);

            const contract = network.getContract(CHAINCODE_NAME);

            //consolelog(identity)
            
            //let results = await contract.evaluateTransaction('queryStringByCreator', SUPER_ADMIN_USER)

            let queryString = {}
            queryString.selector = {};
            queryString.selector.docType = 'doc_document';
            queryString.selector.createdBy = createdBy;
            

            
            const results = await contract.evaluateTransaction('queryDocumentsWithPagination', JSON.stringify(queryString), pageSize, bookmark)
            
            await gateway.disconnect();

            const resultsJSON = JSON.parse(results.toString());

            let reply = []

            
            if(resultsJSON.data.length){
                for (let each in resultsJSON.data) {
                    (function(idx, arr) {
                        reply.push({
                            docId: arr[idx].Record.docId,
                            docType: arr[idx].Record.docType,
                            docStatus: arr[idx].Record.docStatus ? arr[idx].Record.docStatus : '',
                            title: arr[idx].Record.title ? arr[idx].Record.title:'',
                            metadata: arr[idx].Record.metadata,
                            version: arr[idx].Record.version,
                            dataHash: arr[idx].Record.dataHash,
                            createdAt: arr[idx].Record.createdAt,
                            createdAtUTC: sharedCommon.retureBackUTCDate(arr[idx].Record,"createdAtUTC"),
                            createdBy: arr[idx].Record.createdBy,
                            modifiedAt: arr[idx].Record.modifiedAt,
                            modifiedAtUTC: sharedCommon.retureBackUTCDate(arr[idx].Record,"modifiedAtUTC"),
                            modifiedBy: arr[idx].Record.modifiedBy,
                            isActive: parseInt(arr[idx].Record.isActive) === 1 ? true:false,
                            //sharedWithList: JSON.parse(res.locals.thisdocument.sharedWithList),
                            txId: arr[idx].Record.txId,
                            documentPath: arr[idx].Record.documentPath ? arr[idx].Record.documentPath : '',
                            comments: arr[idx].Record.comments ? arr[idx].Record.comments : '',
                            encryptionLevel: parseInt(arr[idx].Record.encryptionLevel) >= 0 ? parseInt(arr[idx].Record.encryptionLevel):0
                        })

                    })(each, resultsJSON.data)
                }                    
            }

            return res.status(200).json({
                status: true,
                documents: {
                    documents: reply,
                    metadata: resultsJSON.metadata
                },
                errorMessage: null
            })

            

        } catch (error) {
            console.error(error.message)
            return res.status(500).json({
                status: false,
                data: null,
                errorMessage: common.constructErrorMessage(`${createError.InternalServerError().message}. ${error.message}.`)
            })
        }
    },


    getDocumentsByDocId: async function(req, res){

        try {
            consolelog("Query one document");

            //consolelog(res.locals.thisdocument)

        
            const resultJSON = res.locals.thisdocument
            const createdBy = res.locals.userDetails._representativeEmail
            //const docId = req.params.DOCUMENT_ID.toLowerCase();
            //const representativeOrganisation = res.locals.userDetails._representativeOrganisation

            let isViewAllowed = false;


            /**
             * Check it the Token Bearer is the owner of the document
             * of is the document been shared with the Token Bearer
             */
            
            if(createdBy === resultJSON.createdBy){
                isViewAllowed=true
            }else{
                const sharedUserList = resultJSON.sharedWithList;
                if(sharedUserList){
                    const _sharedUserList = JSON.parse(sharedUserList);
                    const _index = _sharedUserList.findIndex(x => x === createdBy)
                    //consolelog("_index", _index)
                    if(_index !== -1){
                        isViewAllowed = true
                    }
                }
            }

            if(isViewAllowed){

                let modifiedAtDT = null;
                let createdAtDT = null;

                if(resultJSON.hasOwnProperty('modifiedAtUTC')){
                    modifiedAtDT = new Date(resultJSON.modifiedAtUTC)
                }

                if(resultJSON.hasOwnProperty('createdAtUTC')){
                    createdAtDT = new Date(resultJSON.createdAtUTC)
                }

                const reply = {
                    docId: resultJSON.docId,
                    docType: resultJSON.docType,
                    docStatus: resultJSON.docStatus ? resultJSON.docStatus : '',
                    title: resultJSON.title ? resultJSON.title:'',
                    metadata: resultJSON.metadata,
                    version: resultJSON.version,
                    dataHash: resultJSON.dataHash,
                    createdAt: resultJSON.createdAt,
                    createdAtUTC: createdAtDT ? moment.utc(createdAtDT).format('DD-MM-yyyy HH:mm:ss') : '',
                    createdBy: resultJSON.createdBy,
                    modifiedAt: resultJSON.modifiedAt,
                    modifiedAtUTC: modifiedAtDT ? moment.utc(modifiedAtDT).format('DD-MM-yyyy HH:mm:ss') : '',
                    modifiedBy: resultJSON.modifiedBy,
                    isActive: parseInt(resultJSON.isActive) === 1 ? true:false,
                    sharedWithList: resultJSON.sharedWithList ? JSON.parse(resultJSON.sharedWithList) : null,
                    txId: resultJSON.txId,
                    documentPath: resultJSON.documentPath ? resultJSON.documentPath : '',
                    comments: resultJSON.comments ? resultJSON.comments : '',
                    encryptionLevel: parseInt(resultJSON.encryptionLevel) >= 0 ? parseInt(resultJSON.encryptionLevel):0
                }
    
                return res.status(200).json({
                    status: true,
                    data: reply,
                    errorMessage: null
                })

            }else{
                return res.status(401).json({
                    status: false,
                    data: null,
                    errorMessage: common.constructErrorMessage(`${createError.Unauthorized().message}. You are not allowed to view this document.`)
                })
            }


        } catch (error) {
            console.error(error.message)
            return res.status(500).json({
                status: false,
                data: null,
                errorMessage: common.constructErrorMessage(`${createError.InternalServerError().message}. ${error.message}.`)
            })
        }
    },


    getOneDocumentsNext: async function(req, res, next){

        try {
            //consolelog("Query one document");

            const createdBy = res.locals.userDetails._representativeEmail
            const docId = req.params.DOCUMENT_ID.toLowerCase();
            const representativeOrganisation = await sharedCommon.returnBackOrganizationName(res.locals.userDetails._representativeOrganisation);

        
            const ccp = await helper.getCCP(representativeOrganisation)

            const walletPath = await helper.getWalletPath(representativeOrganisation)
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
                discovery: { enabled: true, asLocalhost: AS_LOCALHOST }
            }

            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);

            const network = await gateway.getNetwork(CHANNEL_NAME);

            const contract = network.getContract(CHAINCODE_NAME);

            //consolelog(identity)

            let results = await contract.evaluateTransaction('readDocument', docId)

            await gateway.disconnect();

            res.locals.thisdocument = JSON.parse(results.toString())

            next();
            

        } catch (error) {
            console.error(error.message)
            return res.status(500).json({
                status: false,
                data: null,
                errorMessage: common.constructErrorMessage(`${createError.InternalServerError().message}. ${error.message}.`)
            })
        }
    },

    
    getHistoryRecords: async function(req, res){

        try {
            consolelog("Query document history");

            const createdBy = res.locals.userDetails._representativeEmail
            const docId = req.params.DOCUMENT_ID.toLowerCase();
            const representativeOrganisation = await sharedCommon.returnBackOrganizationName(res.locals.userDetails._representativeOrganisation);

        
            const ccp = await helper.getCCP(representativeOrganisation)

            const walletPath = await helper.getWalletPath(representativeOrganisation)
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
                discovery: { enabled: true, asLocalhost: AS_LOCALHOST }
            }

            const gateway = new Gateway();
            await gateway.connect(ccp, connectOptions);

            const network = await gateway.getNetwork(CHANNEL_NAME);

            const contract = network.getContract(CHAINCODE_NAME);

            //consolelog(identity)

            const results = await contract.evaluateTransaction('getHistory', docId)

            await gateway.disconnect();

            const resultsJSON = JSON.parse(results.toString())

            try{

                let reply = []

                if(resultsJSON.length){
                    for (let each in resultsJSON) {
                        (function(idx, arr) {

                            //console.log(arr[idx])
                            let responstTS = "";

                            if(arr[idx].Timestamp){
                                const seconds = arr[idx].Timestamp.seconds
                                const nanos = String(arr[idx].Timestamp.nanos).substring(0,3)
                                const timestamp = seconds + nanos
                                const dt = new Date(parseInt(timestamp))
                                responstTS = dt.toISOString();
                            }

                            let modifiedAtDT = null;
                            let createdAtDT = null;

                            if(arr[idx].Value.hasOwnProperty('modifiedAtUTC')){
                                modifiedAtDT = new Date(arr[idx].Value.modifiedAtUTC)
                            }

                            if(arr[idx].Value.hasOwnProperty('createdAtUTC')){
                                createdAtDT = new Date(arr[idx].Value.createdAtUTC)
                            }
    
                            reply.push({
                                Timestamp: responstTS,
                                Value: {
                                    docId: arr[idx].Value.docId,
                                    docType: arr[idx].Value.docType,
                                    docStatus: arr[idx].Value.docStatus ? arr[idx].Value.docStatus : '',
                                    title: arr[idx].Value.title ? arr[idx].Value.title:'',
                                    metadata: arr[idx].Value.metadata,
                                    version: arr[idx].Value.version,
                                    dataHash: arr[idx].Value.dataHash,
                                    createdAt: arr[idx].Value.createdAt,
                                    createdAtUTC: createdAtDT ? moment.utc(createdAtDT).format('DD-MM-yyyy HH:mm:ss') : '',
                                    createdBy: arr[idx].Value.createdBy,
                                    modifiedAt: arr[idx].Value.modifiedAt,
                                    modifiedAtUTC: modifiedAtDT ? moment.utc(modifiedAtDT).format('DD-MM-yyyy HH:mm:ss') : '',
                                    modifiedBy: arr[idx].Value.modifiedBy,
                                    isActive: parseInt(arr[idx].Value.isActive) === 1 ? true:false,
                                    sharedWithList: arr[idx].Value.sharedWithList ? JSON.parse(arr[idx].Value.sharedWithList) : null,
                                    txId: arr[idx].Value.txId,
                                    documentPath: arr[idx].Value.documentPath ? arr[idx].Value.documentPath : '',
                                    comments: arr[idx].Value.comments ? arr[idx].Value.comments : '',
                                    encryptionLevel: parseInt(arr[idx].Value.encryptionLevel) >= 0 ? parseInt(arr[idx].Value.encryptionLevel):0
                                }
                            })
    
                        })(each, resultsJSON)
                    }                    
                }

                return res.status(200).json({
                    status: true,
                    documents: reply,
                    errorMessage: null
                }) 

            }catch(error){
                return res.status(400).json({
                    status: false,
                    data: null,
                    errorMessage: common.constructErrorMessage(`${createError.BadRequest().message}. ${error.message}.`)
                })
            } 
    
            

        } catch (error) {
            console.error(error.message)
            return res.status(500).json({
                status: false,
                data: null,
                errorMessage: common.constructErrorMessage(`${createError.InternalServerError().message}. ${error.message}.`)
            })
        }
    },
    
    
}
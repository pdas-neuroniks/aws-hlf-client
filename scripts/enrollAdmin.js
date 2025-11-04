/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const os = require('os');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('./CAUtil.js');
const { buildWallet, buildCCPOrg } = require('./AppUtil.js');

// ENV VARIABLE 
const {WALLET_PATH, ADMIN_USER_NAME} = require('../api/controllers/utils/env')

function prettyJSONString(inputString) {
    return JSON.stringify(JSON.parse(inputString), null, 2);
}


async function main() {
    try {
        // build an in memory object with the network configuration (also known as a connection profile)
        const ccp = buildCCPOrg("1");
        // console.log("=== ccp1 ===")
        // console.log(ccp)

        // build an instance of the fabric ca services client based on
        // the information in the network configuration
        const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
        // console.log("=== caClient1 ===")
        // console.log(caClient)

        // setup the wallet to hold the credentials of the application user
        const wallet = await buildWallet(Wallets, path.join(WALLET_PATH, `org1-wallet`));
        // console.log("=== wallet1 ===")
        // console.log(wallet)

        // in a real application this would be done on an administrative flow, and only once
        await enrollAdmin(caClient, wallet, 'Org1MSP');

        // in a real application this would be done only when a new user was required to be added
        // and would be part of an administrative flow
        await registerAndEnrollUser(caClient, wallet, 'Org1MSP', 'admin', 'org1.department1');




        // build an in memory object with the network configuration (also known as a connection profile)
        const ccp2 = buildCCPOrg("2");
        // console.log("=== ccp2 ===")
        // console.log(ccp2)

        // build an instance of the fabric ca services client based on
        // the information in the network configuration
        const caClient2 = buildCAClient(FabricCAServices, ccp2, 'ca.org2.example.com');
        // console.log("=== caClient2 ===")
        // console.log(caClient2)

        // setup the wallet to hold the credentials of the application user
        const wallet2 = await buildWallet(Wallets, path.join(WALLET_PATH, `org2-wallet`));
        // console.log("=== wallet2 ===")
        // console.log(wallet2)

        // in a real application this would be done on an administrative flow, and only once
        await enrollAdmin(caClient2, wallet2, 'Org2MSP');

        // in a real application this would be done only when a new user was required to be added
        // and would be part of an administrative flow
        await registerAndEnrollUser(caClient2, wallet2, 'Org2MSP', 'admin', 'org2.department1');


    } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }
}

main();
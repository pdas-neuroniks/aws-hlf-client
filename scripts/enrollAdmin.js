/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';
require('dotenv').config('../.env');
console.log(process.env)
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const os = require('os');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('./CAUtil.js');
const { buildWallet, buildCCPOrg1 } = require('./AppUtil.js');

// ENV VARIABLE 
const WALLET_PATH = path.join(__dirname, '..', 'wallet');
const memberId = process.env.MEMBER_ID;

function prettyJSONString(inputString) {
    return JSON.stringify(JSON.parse(inputString), null, 2);
}


async function main() {
    try {
        // build an in memory object with the network configuration (also known as a connection profile)
        const ccp = buildCCPOrg1();
        console.log("=== ccp1 ===")
        console.log(ccp)

        // build an instance of the fabric ca services client based on
        // the information in the network configuration
        const caClient = buildCAClient(FabricCAServices, ccp, memberId);
        console.log("=== caClient ===")
        console.log(caClient)

        // setup the wallet to hold the credentials of the application user
        const wallet = await buildWallet(Wallets, path.join(WALLET_PATH, `${memberId}-wallet`));
        console.log("=== wallet1 ===")
        console.log(wallet)

        // in a real application this would be done on an administrative flow, and only once
        await enrollAdmin(caClient, wallet, memberId);

        // in a real application this would be done only when a new user was required to be added
        // and would be part of an administrative flow
        await registerAndEnrollUser(caClient, wallet, memberId, 'admin', `${memberId}.department1`);

    } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }
}

main();
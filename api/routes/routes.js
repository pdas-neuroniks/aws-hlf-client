const express = require('express');
const app = express();
const router = express.Router();

router.get('/ping', function(rew, res){
    try {
        return res.status(200).json({
            status: true,
            data: 'pong',
            errorMessage: null
        })
    }catch(error){
        console.error('Failed during health check ' + error.message)
        return res.status(500).json({
            status: false,
            data: null,
        })
    }
})

// const ctrlEnroll = require('../blockchain/network/enroll');
// router.post('/network/enroll', ctrlEnroll.enroll)

// const ctrlNetwork = require('../blockchain/network/info');
// router.get('/network/chain-info', ctrlNetwork.getChainInfo)

module.exports = router;
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


const ctrlNetwork = require('../blockchain/biologics/queryall');
// router.get('/biologics/query/:CARNAME', ctrlNetwork.queryOneCar)
router.get('/biologics/query', ctrlNetwork.queryAllCars)
// router.post('/biologics', ctrlNetwork.saveCar)

// const ctrlEnroll = require('../blockchain/network/enroll');
// router.post('/network/enroll', ctrlEnroll.enroll)

/* const ctrlNetwork = require('../blockchain/fabcar/queryall');
router.get('/fabcar/query-all', ctrlNetwork.queryAllCars)
router.get('/fabcar/query-all/:CARNAME', ctrlNetwork.queryOneCar)
router.post('/fabcar', ctrlNetwork.saveCar) */

module.exports = router;
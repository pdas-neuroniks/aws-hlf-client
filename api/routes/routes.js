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


const ctrlBiologicsQuery = require('../blockchain/biologics/queryall');
router.get('/biologics/query/:ORDERID', ctrlBiologicsQuery.queryOneOrder)
router.get('/biologics/query', ctrlBiologicsQuery.queryAllOrders)
const ctrlBiologicsInvoke = require('../blockchain/biologics/add');
router.post('/biologics', ctrlBiologicsInvoke.addOrder)

// const ctrlEnroll = require('../blockchain/network/enroll');
// router.post('/network/enroll', ctrlEnroll.enroll)

/* const ctrlNetwork = require('../blockchain/fabcar/queryall');
router.get('/fabcar/query-all', ctrlNetwork.queryAllCars)
router.get('/fabcar/query-all/:CARNAME', ctrlNetwork.queryOneCar)
router.post('/fabcar', ctrlNetwork.saveCar) */

module.exports = router;
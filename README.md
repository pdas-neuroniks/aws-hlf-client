git clone https://github.com/pdas-neuroniks/aws-hlf-client.git

A6minPw8A6minPw

https://github.com/hyperledger/fabric-samples/blob/release-2.2/chaincode/fabcar/go/fabcar.go

curl http://localhost:3000/api/bc/ping

curl http://localhost:3000/api/bc/fabcar/query-all
curl http://localhost:3000/api/bc/fabcar/query-all/A1
curl -X POST -H "Content-Type: application/json" -d '{"carNumber":"", "make":"", "model":"", "colour":"", "owner":""}' http://localhost:3000/api/bc/fabcar






curl http://localhost:3000/api/bc/network/chain-info

curl -X POST -H "Content-Type: application/json" -d '{"user": "user01"}' http://localhost:3000/api/bc/network/enroll | jq .

curl -X POST -H "Content-Type: application/json" -d '{"carNumber":"XYZ", "make":"TABLA", "model":"A3", "colour":"BLUE", "owner":"DAS"}' http://localhost:3000/api/bc/fabcar


-----------

curl http://localhost:3000/api/bc/biologics/query

curl http://localhost:3000/api/bc/biologics/query/480f300b-38be-42d9-8e88-edc1f3364e37 | jq .

curl -X POST -H "Content-Type: application/json" -d '{"therapyType": "orderData.therapyType","manufacturerId": "orderData.manufacturerId","hospitalId": "orderData.hospitalId","logisticsId": "orderData.logisticsId","slotId": "orderData.slotId","currentStatus": "orderData.status","statusHistory": [{"status": "orderData.status","updatedBy": "orderData.createdBy","timestamp": "orderData.statusTimestamp"}],"createdAt": "orderData.createdAt","ccnCode": "orderData.ccnCode","cmsCertNumber": "orderData.cmsCertNumber"}' http://localhost:3000/api/bc/biologics/

curl -X PUT -H "Content-Type: application/json" -d '{"status":"therapy_requested","updatedBy":"updatedByAdmin","timestamp":"timestamp","currentStatus":"therapy_requested"}' http://localhost:3000/api/bc/biologics/480f300b-38be-42d9-8e88-edc1f3364e37


curl http://localhost:3000/api/bc/biologics/history/480f300b-38be-42d9-8e88-edc1f3364e37 | jq .






{"therapyType": "orderData.therapyType","manufacturerId": "orderData.manufacturerId","hospitalId": "orderData.hospitalId","logisticsId": "orderData.logisticsId","slotId": "orderData.slotId","currentStatus": "orderData.status","statusHistory": [{"status": "orderData.status","updatedBy": "orderData.createdBy","timestamp": "orderData.statusTimestamp"}],"createdAt": "orderData.createdAt","ccnCode": "orderData.ccnCode","cmsCertNumber": "orderData.cmsCertNumber"}
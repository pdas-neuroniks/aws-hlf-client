git clone https://github.com/pdas-neuroniks/aws-hlf-client.git


| Method | Endpoint | Description | Curl Command Example |
|---|---|---|---|
| `GET` | `/biologics/query` | Retrieves a list of all orders. | ```bash<br>curl "http://localhost:3000/api/bc/biologics/query"<br>``` |
| `GET` | `/biologics/query/{order_id}` | Retrieves details for a specific order by ID. | ```bash<br>curl "http://localhost:3000/api/bc/biologics/query/480f300b-38be-42d9-8e88-edc1f3364e37"<br>``` |
| `POST` | `/biologics` | Creates a new order. | ```bash<br>curl -X POST -H "Content-Type: application/json" -d '{"therapyType": "orderData.therapyType","manufacturerId": "orderData.manufacturerId","hospitalId": "orderData.hospitalId","logisticsId": "orderData.logisticsId","slotId": "orderData.slotId","currentStatus": "orderData.status","statusHistory": [{"status": "orderData.status","updatedBy": "orderData.createdBy","timestamp": "orderData.statusTimestamp"}],"createdAt": "orderData.createdAt","ccnCode": "orderData.ccnCode","cmsCertNumber": "orderData.cmsCertNumber"}' "http://localhost:3000/api/bc/biologics/"<br>``` |
| `PUT` | `/biologics/{order_id}` | Updates an existing user by ID. | ```bash<br>curl -X PUT -H "Content-Type: application/json" -d '{"status":"therapy_requested","updatedBy":"updatedByAdmin","timestamp":"timestamp","currentStatus":"therapy_requested"}' "http://localhost:3000/api/bc/biologics/480f300b-38be-42d9-8e88-edc1f3364e37"<br>``` |
| `DELETE` | `/biologics/history/{order_id}` | Get history of an order by ID. | ```bash<br>curl "http://localhost:3000/api/bc/biologics/history/480f300b-38be-42d9-8e88-edc1f3364e37"<br>``` |


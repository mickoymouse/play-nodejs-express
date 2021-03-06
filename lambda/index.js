var aws = require('aws-sdk')
var ddb = new aws.DynamoDB({ apiVersion: '2012-10-08' })

exports.handler = async (event, context) => {
    console.log(event)

    let date = new Date()

    const tableName = process.env.TABLE_NAME
    const region = process.env.REGION

    console.log("table=" + tableName + " -- region=" + region)

    aws.config.update({ region: region })

    // If the required parameters are present, proceed
    if (event.request.userAttributes.sub) {

        // -- Write data to DDB
        let ddbParams = {
            Item: {
                'account_id': { S: event.request.userAttributes.sub },
                'username': { S: event.userName },
                'name': { S: event.request.userAttributes.name },
                'email': { S: event.request.userAttributes.email },
                'createdAt': { S: date.toISOString() },
                'custom_var': { S: event.request.userAttributes['custom:custom_var'] },
            },
            TableName: tableName
        }

        // Call DynamoDB
        try {
            await ddb.putItem(ddbParams).promise()
            console.log("Success")
        } catch (err) {
            console.log("Error", err)
        }

        console.log("Success: Everything executed correctly")
        context.done(null, event)

    } else {
        // Nothing to do, the user's email ID is unknown
        console.log("Error: Nothing was written to DDB or SQS")
        context.done(null, event)
    }
}
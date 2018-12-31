import cdk = require("@aws-cdk/cdk");
import lambda = require("@aws-cdk/aws-lambda");
import dynamodb = require("@aws-cdk/aws-dynamodb");

export interface HitCounterProps {
    downstream: lambda.FunctionRef
}

export class HitCounter extends cdk.Construct {

    /** allows accessing the counter function */
    public readonly handler: lambda.Function;

    public readonly table: dynamodb.Table;

    constructor(parent: cdk.Construct, id: string, props: HitCounterProps) {
        super(parent, id);

        this.table = new dynamodb.Table(this, 'Hits');
        this.table.addPartitionKey({ name: 'path', type: dynamodb.AttributeType.String });


        this.handler = new lambda.Function(this, 'HitCounterHandler', {
            runtime: lambda.Runtime.NodeJS810,
            code: lambda.Code.asset('lambda'),
            handler: 'hitcounter.handler',
            environment: {
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: this.table.tableName
            }
        });

        this.table.grantReadWriteData(this.handler.role);

        props.downstream.grantInvoke(this.handler.role);
    }
}


import lambda = require("@aws-cdk/aws-lambda");
import apigw = require("@aws-cdk/aws-apigateway");
import { HitCounter} from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';

import cdk = require('@aws-cdk/cdk');

export class CdkWorkshopStack extends cdk.Stack {
  constructor(parent: cdk.App, name: string, props?: cdk.StackProps) {
    super(parent, name, props);

    const hello = new lambda.Function(this, 'Hellohandler', {
      code: lambda.Code.asset('lambda'),
      runtime: lambda.Runtime.NodeJS810,
      handler: "hello.handler"
    });

    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello
    });

    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler
    });

    new TableViewer(this, 'ViewHitCounter', {
      title: 'Hello hits',
      table: helloWithCounter.table
    })
  }
}

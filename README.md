# Dinner Bot

A simple bot for recording dinner preferences. 

This bot is built on AWS Lex and uses 100% serverless infrastructure to keep costs to a minimal (essentially free). 

## Set up

You need to use a couple services to use this bot as described below. 

I recommend setting up all services in the `us-east-1` region to ensure capatability. 

### AWS S3

Set up an *S3 bucket* to store the dinner preferences. 

This can be named anything you like. 
I am using a general purpose bucket which contains objects from other projects. 

### IAM

Set up a *policy* with the document located at `aws/iam/document.json`.
Remember to replace `<bucket_name>` with the name of the bucket you created in the previous step. 

Create a *service role* with a `trust relationship` to AWS Lambda. Then attach the above policy. 

### AWS Lambda

Create an AWS Lambda function with the `Node.js 4.3` runtime and the role created in the previous step. 

Copy and paste or upload the function located at `aws/lambda/dinner.js`. 

### AWS Lex

Create an AWS Lex bot with the intents located at `aws/lex/`. 

Each file in this location contains hand crafted information for how to create the bot. 
These files cannot be directly copied into the AWS console or CLI for automatic updates. 

## TODO

Information on the application and how to install it on your mobile device. 

## Credits

[Michael Standen](https://michael.standen.link)

This software is provided under the [MIT License](https://tldrlegal.com/license/mit-license) so it's free to use so long as you give me credit.
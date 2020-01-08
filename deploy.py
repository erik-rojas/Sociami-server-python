# Copyright 2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file
# except in compliance with the License. A copy of the License is located at
#
#     http://aws.amazon.com/apache2.0/
#
# or in the "license" file accompanying this file. This file is distributed on an "AS IS"
# BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations under the License.
"""
A BitBucket Builds template for deploying an application revision to AWS CodeDeploy
narshiva@amazon.com
v1.0.0
"""
from __future__ import print_function
import os
import sys
import zipfile
import shutil
import distutils.dir_util
from time import strftime, sleep
import boto3
from botocore.exceptions import ClientError

APPLICATION_NAME        = 'Sociami'
DEPLOYMENT_CONFIG       = 'CodeDeployDefault.OneAtATime'
S3_BUCKET               = 'sociamibucket'
AWS_ACCESS_KEY_ID = 'AKIAJQTXVEWBQJYDATVQ'
AWS_SECRET_ACCESS_KEY = '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'
VERSION_LABEL = strftime("%Y%m%d%H%M%S")
BUCKET_KEY = APPLICATION_NAME + '/' + VERSION_LABEL + \
    '-bitbucket_builds.zip'


def upload_to_s3(artifact):
    """
    Uploads an artifact to Amazon S3
    """
    try:
        client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
    except ClientError as err:
        print("Failed to create boto3 client.\n" + str(err))
        return False
    try:
        client.put_object(
            Body=open(artifact, 'rb'),
            Bucket=S3_BUCKET,
            Key=BUCKET_KEY
        )
    except ClientError as err:
        print("Failed to upload artifact to S3.\n" + str(err))
        return False
    except IOError as err:
        print("Failed to access artifact.zip in this directory.\n" + str(err))
        return False
    return True

def deploy_new_revision(env):
    """
    Deploy a new application revision to AWS CodeDeploy Deployment Group
    """
    try:
        client = boto3.client(
            'codedeploy',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
    except ClientError as err:
        print("Failed to create boto3 client.\n" + str(err))
        return False

    try:
        response = client.create_deployment(
            applicationName=APPLICATION_NAME,
            deploymentGroupName=env,
            revision={
                'revisionType': 'S3',
                's3Location': {
                    'bucket': S3_BUCKET,
                    'key': BUCKET_KEY,
                    'bundleType': 'zip'
                }
            },
            deploymentConfigName=DEPLOYMENT_CONFIG,
            description='New deployment from local dev machine',
            ignoreApplicationStopFailures=True
        )
    except ClientError as err:
        print("Failed to deploy application revision.\n" + str(err))
        return False     
           
    """
    Wait for deployment to complete
    """
    while 1:
        try:
            deploymentResponse = client.get_deployment(
                deploymentId=str(response['deploymentId'])
            )
            deploymentStatus=deploymentResponse['deploymentInfo']['status']
            if deploymentStatus == 'Succeeded':
                print ("Deployment Succeeded")
                return True
            elif (deploymentStatus == 'Failed') or (deploymentStatus == 'Stopped') :
                print ("Deployment Failed. Please check AWS CodeDeploy for more detailed.")
                return False
            elif (deploymentStatus == 'InProgress') or (deploymentStatus == 'Queued') or (deploymentStatus == 'Created'):
                continue
        except ClientError as err:
            print("Failed to deploy application revision.\n" + str(err))
            return False      
    return True

def validate_command():
    """
    get the deployment environment name input from command line.
    """
    if (len(sys.argv) <2):
        print("Please specify environemnt to deploy.\n" +\
        "Example:\n" +\
        "\tpython deploy.py staging")
        sys.exit(1)
    if not sys.argv[1] in ['staging', 'production']:
        print("The environment is not correct, please specify the correct environment to deploy. \n[staging, production]")
        sys.exit(1)

def main():
    validate_command()
    environemnt = sys.argv[1]
    os.system('git archive -o artifact.zip HEAD');
    print("Start uploading...");
    if not upload_to_s3('artifact.zip'):
        sys.exit(1)
    print("Upload sucessfully.\n");
    print("Start deploying...");
    if not deploy_new_revision(environemnt):
        sys.exit(1)

if __name__ == "__main__":
    main()

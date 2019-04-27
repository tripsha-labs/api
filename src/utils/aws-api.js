/**
 * @name - aws-api
 * @description - Get aws api utility
 */
import AWS from 'aws-sdk';
export const apigwManagementApi = endpoint => {
  return new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: endpoint,
  });
};

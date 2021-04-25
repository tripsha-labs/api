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

export const getCurrentUser = async event => {
  try {
    const cognitoClient = new AWS.CognitoIdentityServiceProvider();
    const IDP_REGEX = /.*\/.*,(.*)\/(.*):CognitoSignIn:(.*)/;
    const authProvider =
      event.requestContext.identity.cognitoAuthenticationProvider;
    const [, , userPoolId, userSub] = authProvider.match(IDP_REGEX);

    const listUsersResponse = await cognitoClient
      .listUsers({
        UserPoolId: userPoolId,
        Filter: `sub = "${userSub}"`,
        Limit: 1,
      })
      .promise();
    if (
      listUsersResponse &&
      listUsersResponse.Users &&
      listUsersResponse.Users.length > 0 &&
      listUsersResponse.Users[0] &&
      listUsersResponse.Users[0].Attributes
    ) {
      const userInfo = {};
      listUsersResponse.Users[0].Attributes.map(attr => {
        userInfo[attr.Name] = attr.Value;
      });
      userInfo['awsUserId'] = event.requestContext.identity.cognitoIdentityId;
      return userInfo;
    } else return false;
  } catch (err) {
    console.log(err);
    return false;
  }
};

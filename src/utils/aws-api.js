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

export const createCognitoUser = async (event, params) => {
  const cognitoClient = new AWS.CognitoIdentityServiceProvider();
  const authProvider =
    event.requestContext.identity.cognitoAuthenticationProvider;
  const IDP_REGEX = /.*\/.*,(.*)\/(.*):CognitoSignIn:(.*)/;
  const [, , userPoolId, userSub] = authProvider.match(IDP_REGEX);
  const userAttributes = [
    {
      Name: 'email_verified',
      Value: 'True',
    },
    {
      Name: 'email',
      Value: params.email,
    },
  ];
  if (params.firstName) {
    userAttributes.push({
      Name: 'custom:firstName',
      Value: params.firstName,
    });
  }
  if (params.lastName) {
    userAttributes.push({
      Name: 'custom:lastName',
      Value: params.lastName,
    });
  }
  const createUserPayload = {
    UserPoolId: userPoolId,
    Username: params.email,
    // MessageAction: 'SUPPRESS',
    DesiredDeliveryMediums: ['EMAIL'],
    TemporaryPassword: params.password || 'Tripsha@123',
    UserAttributes: userAttributes,
  };
  if (!params.notifyUser) {
    createUserPayload['MessageAction'] = 'SUPPRESS';
  }
  let createUserRes = false;
  try {
    createUserRes = await cognitoClient
      .adminCreateUser(createUserPayload)
      .promise();
  } catch (err) {
    switch (err.name) {
      case 'UsernameExistsException':
        createUserRes = await cognitoClient
          .adminGetUser({
            UserPoolId: userPoolId,
            Username: params.email,
          })
          .promise();
        if (createUserRes.UserStatus == 'UNCONFIRMED') {
          await cognitoClient
            .adminConfirmSignUp({
              UserPoolId: userPoolId,
              Username: params.email,
            })
            .promise();
          await cognitoClient
            .adminSetUserPassword({
              UserPoolId: userPoolId,
              Username: params.email,
              Password: params.password || 'Tripsha@123',
              Permanent: true,
            })
            .promise();
          return createUserRes;
        }
        return false;
      default:
        return false;
    }
  }
  await cognitoClient
    .adminSetUserPassword({
      UserPoolId: userPoolId,
      Username: params.email,
      Password: params.password || 'Tripsha@123',
      Permanent: true,
    })
    .promise();
  if (createUserRes) {
    return createUserRes;
  } else return false;
};
export const setUserPassword = async (event, params) => {
  const cognitoClient = new AWS.CognitoIdentityServiceProvider();
  const authProvider =
    event.requestContext.identity.cognitoAuthenticationProvider;
  const IDP_REGEX = /.*\/.*,(.*)\/(.*):CognitoSignIn:(.*)/;
  const [, , userPoolId, userSub] = authProvider.match(IDP_REGEX);
  try {
    await cognitoClient
      .adminSetUserPassword({
        UserPoolId: userPoolId,
        Username: params.email,
        Password: params.password || 'Tripsha@123',
        Permanent: true,
      })
      .promise();
  } catch (err) {
    console.log(err);
    await createCognitoUser(event, params);
  }
};
export const setUserEmail = async (event, currentEmail, newEmail) => {
  const cognitoClient = new AWS.CognitoIdentityServiceProvider();
  const authProvider =
    event.requestContext.identity.cognitoAuthenticationProvider;
  const IDP_REGEX = /.*\/.*,(.*)\/(.*):CognitoSignIn:(.*)/;
  const [, , userPoolId, userSub] = authProvider.match(IDP_REGEX);

  await cognitoClient
    .adminUpdateUserAttributes({
      UserPoolId: userPoolId,
      Username: currentEmail,
      UserAttributes: [
        {
          Name: 'email',
          Value: newEmail,
        },
        {
          Name: 'email_verified',
          Value: 'True',
        },
      ],
    })
    .promise();
};
export const enableUser = async (event, params) => {
  const cognitoClient = new AWS.CognitoIdentityServiceProvider();
  const authProvider =
    event.requestContext.identity.cognitoAuthenticationProvider;
  const IDP_REGEX = /.*\/.*,(.*)\/(.*):CognitoSignIn:(.*)/;
  const [, , userPoolId, userSub] = authProvider.match(IDP_REGEX);
  await cognitoClient
    .adminEnableUser({
      UserPoolId: userPoolId,
      Username: params.email,
    })
    .promise();
};
export const disableUser = async (event, params) => {
  const cognitoClient = new AWS.CognitoIdentityServiceProvider();
  const authProvider =
    event.requestContext.identity.cognitoAuthenticationProvider;
  const IDP_REGEX = /.*\/.*,(.*)\/(.*):CognitoSignIn:(.*)/;
  const [, , userPoolId, userSub] = authProvider.match(IDP_REGEX);
  await cognitoClient
    .adminDisableUser({
      UserPoolId: userPoolId,
      Username: params.email,
    })
    .promise();
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

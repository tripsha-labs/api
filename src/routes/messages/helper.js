export const generatePolicy = (claims, effect, resource) => {
  // Required output:
  const authResponse = {};
  authResponse.principalId = 'me';
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17'; // default version
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke'; // default action
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  // Optional output with custom properties of the String, Number or Boolean type.
  authResponse.context = {
    username: claims.username,
    sub: claims.sub,
  };
  return authResponse;
};

export const generateAllow = (claims, resource) => {
  return generatePolicy(claims, 'Allow', resource);
};

export const generateDeny = (claims, resource) => {
  return generatePolicy(claims, 'Deny', resource);
};

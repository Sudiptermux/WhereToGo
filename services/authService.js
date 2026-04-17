// services/authService.js
import {
    AuthenticationDetails,
    CognitoUser,
    CognitoUserAttribute,
    CognitoUserPool,
} from "amazon-cognito-identity-js";
import CryptoJS from "crypto-js";
import COGNITO_CONFIG from "../config/cognito";

const userPool = new CognitoUserPool({
  UserPoolId: COGNITO_CONFIG.userPoolId,
  ClientId: COGNITO_CONFIG.clientId,
});

// Compute SECRET_HASH for Cognito client with secret
function getSecretHash(username) {
  if (!COGNITO_CONFIG.clientSecret) {
    return undefined; // No secret hash needed if client secret not configured
  }

  const message = username + COGNITO_CONFIG.clientId;
  const hmac = CryptoJS.HmacSHA256(message, COGNITO_CONFIG.clientSecret);
  return CryptoJS.enc.Base64.stringify(hmac);
}

export async function signUp({ name, email, password, phone }) {
  return new Promise((resolve, reject) => {
    const attributes = [
      new CognitoUserAttribute({ Name: "name", Value: name }),
      new CognitoUserAttribute({ Name: "email", Value: email }),
    ];

    if (phone) {
      attributes.push(
        new CognitoUserAttribute({ Name: "phone_number", Value: phone }),
      );
    }

    const clientMetadata = {
      secretHash: getSecretHash(email),
    };

    userPool.signUp(
      email,
      password,
      attributes,
      null,
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      },
      clientMetadata,
    );
  });
}

export async function confirmSignUp({ email, code }) {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    // Set the secret hash if client secret is configured
    if (COGNITO_CONFIG.clientSecret) {
      cognitoUser.setAuthenticationFlowType("USER_PASSWORD_AUTH");
    }

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

export async function resendConfirmationCode({ email }) {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    if (COGNITO_CONFIG.clientSecret) {
      cognitoUser.setAuthenticationFlowType("USER_PASSWORD_AUTH");
    }

    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}

export async function signIn({ email, password }) {
  return new Promise((resolve, reject) => {
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    // Add secret hash if client secret is configured
    if (COGNITO_CONFIG.clientSecret) {
      authDetails.clientSecretHash = getSecretHash(email);
    }

    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (data) => resolve(data),
      onFailure: (err) => reject(err),
    });
  });
}

export function signOut({ email }) {
  const userData = {
    Username: email,
    Pool: userPool,
  };
  const cognitoUser = new CognitoUser(userData);
  cognitoUser.signOut();
}

export async function forgotPassword({ email }) {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: email,
      Pool: userPool,
    };
    const cognitoUser = new CognitoUser(userData);

    if (COGNITO_CONFIG.clientSecret) {
      cognitoUser.setAuthenticationFlowType("USER_PASSWORD_AUTH");
    }

    cognitoUser.forgotPassword({
      onSuccess: function (result) {
        resolve(result);
      },
      onFailure: function (err) {
        reject(err);
      },
      inputVerificationCode: function (result) {
        resolve(result);
      },
    });
  });
}

export async function confirmPassword({ email, code, newPassword }) {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: email,
      Pool: userPool,
    };
    const cognitoUser = new CognitoUser(userData);

    if (COGNITO_CONFIG.clientSecret) {
      cognitoUser.setAuthenticationFlowType("USER_PASSWORD_AUTH");
    }

    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess() {
        resolve();
      },
      onFailure(err) {
        reject(err);
      },
    });
  });
}

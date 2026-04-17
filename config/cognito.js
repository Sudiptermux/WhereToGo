// config/cognito.js
// Fill these values with your actual AWS Cognito User Pool and App Client IDs.
// clientSecret - Get this from AWS Cognito App Client settings (if enabled)

const COGNITO_CONFIG = {
    userPoolId: "ap-southeast-2_ffTWRLg6w",
    clientId: "6ll22rk7jskgvcmfd4lducam4k",
    // No clientSecret needed for a standard public mobile app client
};

export default COGNITO_CONFIG;

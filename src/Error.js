const name = 'Quickblo JS SDK';

const ERRORS = {
    InvalidConfigurationError: {
        code: 601,
        message: `${name}: Credential or configuration for client is invalid`
    },
    AuthorizationRequired: {
        code: 602,
        message: `${name}: Authorization is required to use this functionality`
    }
};


export default ERRORS;

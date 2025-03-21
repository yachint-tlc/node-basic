const { celebrate } = require('celebrate')

const validationOptions = {
    abortEarly: true,
    allowUnknown: true,
    stripUnknown: { arrays: false, objects: true }
}

const validationRequest = (schema) => celebrate(schema, validationOptions);

module.exports = validationRequest;
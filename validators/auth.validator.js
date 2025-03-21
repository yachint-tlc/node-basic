const { Joi, Segments } = require('celebrate');

const authValidationSchema = {
    login: {
        [Segments.BODY]: Joi.object().keys({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        })
    },
    register: {
        [Segments.BODY]: Joi.object().keys({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
            full_name: Joi.string().required()
        })
    },
    refreshToken: {
        [Segments.BODY]: Joi.object().keys({
            refreshToken: Joi.string().required(),
        })
    },
    logout: {
          [Segments.BODY]: Joi.object().keys({
            refreshToken: Joi.string().required(),
        })      
    }
}

module.exports = authValidationSchema;
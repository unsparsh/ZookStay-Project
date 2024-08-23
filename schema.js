const Joi = require("joi");
const joi = require("joi");

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        Comment: Joi.string().required(),
    }).required()
})
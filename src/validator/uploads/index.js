const InvariantError = require('../../exceptions/InvariantError');
const {UploadImageHeadersSchema} = require('./schema');

const UploadsImageValidator = {
  validateImageHeaders: (headers) => {
    const validationResult = UploadImageHeadersSchema.validate(headers);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UploadsImageValidator;

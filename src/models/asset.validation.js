/**
 * @name - Asset validation
 * @description - Asset schema validator.
 */
import Validator from 'fastest-validator';

const assetSchema = {
  type: { type: 'string', optional: true },
  url: { type: 'string', required: true },
  thumbnailUrl: { type: 'string', optional: true },
  caption: { type: 'string', optional: true },
  $$strict: true,
};

export const assetSchemaValidation = new Validator().compile(assetSchema);

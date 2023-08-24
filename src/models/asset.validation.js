/**
 * @name - Asset validation
 * @description - Asset schema validator.
 */
import Validator from 'fastest-validator';

const updateAssetSchema = {
  organizationId: { type: 'string', optional: true },
  type: { type: 'string', optional: true },
  url: { type: 'string', optional: true },
  thumbnailUrl: { type: 'string', optional: true },
  caption: { type: 'string', optional: true },
  isArchived: { type: 'boolean', optional: true },
  $$strict: true,
};

const cerateAssetSchema = {
  ...updateAssetSchema,
  url: { type: 'string', required: true, optional: false },
  $$strict: true,
};

export const assetCreateSchemaValidation = new Validator().compile(
  cerateAssetSchema
);
export const assetUpdateSchemaValidation = new Validator().compile(
  updateAssetSchema
);

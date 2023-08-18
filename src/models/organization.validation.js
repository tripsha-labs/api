/**
 * @name - Organization validator
 * @description - The Organization schema validator.
 */
import Validator from 'fastest-validator';

const organizationShema = {
  name: { type: 'string', empty: false },
  avatarUrl: { type: 'string', optional: true },
  coverPhotoUrl: { type: 'string', optional: true },
  facebookUrl: { type: 'string', optional: true },
  twitterUrl: { type: 'string', optional: true },
  websiteUrl: { type: 'string', optional: true },
  discordUrl: { type: 'string', optional: true },
  instagramUrl: { type: 'string', optional: true },
};
export const createOrganizationsValidation = new Validator().compile({
  ...organizationShema,
  $$strict: 'remove',
});
export const updateOrganizationsValidation = new Validator().compile({
  ...organizationShema,
  name: { ...organizationShema?.name, optional: true },
  $$strict: 'remove',
});

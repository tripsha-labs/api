/**
 * @name - HostRequest validation
 * @description - HostRequest schema validator.
 */
import Validator from 'fastest-validator';

const hostRequestSchema = {
  kindOfTripHostingOverview: { type: 'string', required: true },
  hostingCapacity: { type: 'string', required: true },
  hostingForCountries: {
    type: 'array',
    required: true,
    items: { type: 'string' },
  },
  targettingTypesOfTravelers: { type: 'string', required: true },
  groupTripHostingExperience: { type: 'string', required: true },
  pastAccomplishmentReferences: { type: 'string', optional: true },
  $$strict: true,
};

export const hostRequestValidation = new Validator().compile(hostRequestSchema);

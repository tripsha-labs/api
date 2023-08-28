/**
 * @name - Properties validator
 * @description - The Properties schema validator.
 */
import Validator from 'fastest-validator';

const propertiesShema = {
  tripId: { type: 'string', empty: false },
  name: { type: 'string', optional: true },
  photos: { type: 'array', optional: true },
  dates: { type: 'array', optional: true },
  roomsBooked: { type: 'string', optional: true },
  address: { type: 'string', optional: true },
  website: { type: 'string', optional: true },
  amenities: {
    type: 'array',
    optional: true,
    items: {
      type: 'string',
      optional: true,
    },
  },
  contact: { type: 'string', optional: true },
  cleaningCrew: { type: 'string', optional: true },
  buildingType: { type: 'string', optional: true },
  eventUse: { type: 'string', optional: true },
  maxPeople: { type: 'number', optional: true },
};
export const createPropertiesValidation = new Validator().compile({
  ...propertiesShema,
  $$strict: 'remove',
});
export const updatePropertiesValidation = new Validator().compile({
  ...propertiesShema,
  $$strict: 'remove',
});

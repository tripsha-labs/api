/**
 * @name - Resource validator
 * @description - The Resource schema validator.
 */
import Validator from 'fastest-validator';

export const updateResourceCollectionValidation = new Validator().compile({
  title: { type: 'string', empty: false, optional: true },
  column: { type: 'string', empty: false, optional: true },
  $$strict: 'remove',
});
const resourceShema = {
  title: { type: 'string', empty: false },
  rooms: { type: 'object', optional: true },
  resourceType: { type: 'string', empty: false },
  collectionName: { type: 'string', empty: false },
  tripId: { type: 'string', empty: false },
  airline: { type: 'string', empty: false, optional: true },
  flightNumber: { type: 'string', empty: false, optional: true },
  departureAirport: { type: 'string', empty: false, optional: true },
  pickupPoint: { type: 'string', empty: false, optional: true },
  dropoffPoint: { type: 'string', empty: false, optional: true },
  arrivalAirport: { type: 'string', empty: false, optional: true },
  departureTime: { type: 'number', empty: false, optional: true },
  arrivalTime: { type: 'number', empty: false, optional: true },
  quantity: { type: 'number', empty: false, optional: true },
  capacity: { type: 'number', empty: false, optional: true },
};
export const createResourceValidation = new Validator().compile({
  ...resourceShema,
  $$strict: 'remove',
});
export const updateResourceValidation = new Validator().compile({
  ...resourceShema,
  $$strict: 'remove',
});

export const assignResourcesValidation = new Validator().compile({
  tripId: { type: 'string', empty: false },
  bookings: {
    type: 'array',
    empty: false,
    items: {
      type: 'object',
      props: {
        bookingId: { type: 'string', required: true },
        attendees: { type: 'number', required: true },
      },
    },
  },
  resources: { type: 'array', empty: false },
  rooms: { type: 'object', optional: true },
  $$strict: 'remove',
});

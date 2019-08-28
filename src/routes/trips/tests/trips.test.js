// import { TripController } from '../trip.ctrl';
// import { expect } from 'chai';
// jest.mock('../../../utils/db-connector');

// describe('List Trips', () => {
//   test('With valid input', async () => {
//     const queryFilter = {
//       minGroupSize: 2,
//       minGroupSize: 10,
//       minStartDate: 20190812,
//       maxEndDate: 20190812,
//       minTripLength: 5,
//       maxTripLength: 10,
//     };
//     const { error, result } = await TripController.listTrips(queryFilter);
//     expect(error).to.equal(null);
//     expect(result).to.have.property('data');
//   });
//   test('With invalid input', async () => {
//     const { error, result } = await TripController.listTrips({});
//     expect(error).to.equal(null);
//     expect(result).to.have.property('data');
//   });
// });

// describe('List myTrips', () => {
//   test('With valid input', async () => {
//     const id = 'id_of_the_item';
//     const { error, result } = await TripController.myTrips(id);
//     expect(error).to.equal(null);
//     expect(result).to.have.property('data');
//   });
//   test('With invalid input', async () => {
//     const id = '';
//     const { error, result } = await TripController.myTrips(id);
//     expect(error).to.equal(null);
//     expect(result).to.have.property('data');
//   });
// });

// describe('List savedTrips', () => {
//   test('With valid input', async () => {
//     const id = 'id_of_the_item';
//     const { error, result } = await TripController.savedTrips(id);
//     expect(error).to.equal(null);
//     expect(result).to.have.property('data');
//   });
//   test('With invalid input', async () => {
//     const id = '';
//     const { error, result } = await TripController.savedTrips(id);
//     expect(error).to.equal(null);
//     expect(result).to.have.property('data');
//   });
// });

// describe('Create Trip', () => {
//   test('With valid input', async () => {
//     const trip = {
//       title: 'Sanjay',
//       id: 'id_of_the_item',
//     };
//     const { error, result } = await TripController.createTrip(trip);
//     expect(error).to.equal(null);
//     expect(result).to.have.property('id');
//   });
// });

// describe('update Trip', () => {
//   test('With valid input', async () => {
//     const trip = {
//       title: 'Sanjay',
//     };
//     const { error, result } = await TripController.updateTrip(
//       'id_of_the_item',
//       trip
//     );
//     expect(error).to.equal(null);
//   });
// });

// describe('Get Trip', () => {
//   test('With valid input', async () => {
//     const { error, result } = await TripController.getTrip('id_of_the_item');
//     expect(error).to.equal(null);
//   });
// });

// describe('Delete Trip', () => {
//   test('With valid input', async () => {
//     const { error, result } = await TripController.deleteTrip('id_of_the_item');
//     expect(error).to.equal(null);
//   });
// });

// describe('injectFavoriteDetails', () => {
//   test('With valid input', async () => {
//     const res = await TripController.injectFavoriteDetails(
//       [{ id: 'id_of_the_item1' }],
//       'id_of_the_item'
//     );
//     expect(res).to.be.an('array');
//   });
//   test('With valid input', async () => {
//     const res = await TripController.injectFavoriteDetails([
//       { id: 'id_of_the_item1' },
//     ]);
//     expect(res).to.be.an('array');
//   });
// });

// describe('injectUserDetails', () => {
//   test('With valid input', async () => {
//     const res = await TripController.injectUserDetails([
//       { id: 'id_of_the_item1' },
//     ]);
//     expect(res).to.be.an('array');
//   });
// });

// describe('injectData', () => {
//   test('With valid input', async () => {
//     const res = await TripController.injectData([]);
//     expect(res).to.be.an('array');
//   });
// });

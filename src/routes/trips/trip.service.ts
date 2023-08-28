import { TripModel } from '../../models/trip.model';

export async function getAllPublicTrips() {
  try {
    const trips = await TripModel.list({ filter: { isPublic: true } });
    return trips;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

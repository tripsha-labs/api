import { Request, Response } from 'express';
import { getAllPublicTrips } from './trip.service';

export default class TripController {
  static async getAllPublicTrips(_req: Request, res: Response) {
    try {
      const trips = await getAllPublicTrips();
      return res.status(200).json({ data: trips });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

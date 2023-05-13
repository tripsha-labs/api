/**
 * @name - User handler
 * @description - This will handle user API requests
 */
import { UserController } from './user.ctrl';
import { successResponse, failureResponse } from '../../utils';
import { ERROR_KEYS } from '../../constants';
import { TripController } from '../trips/trip.ctrl';

/**
 * Get user by username
 */
export const getUserByUsername = async (req, res) => {
  if (!(req.query && req.query.username))
    throw { ...ERROR_KEYS.MISSING_FIELD, field: 'username' };

  const username = req.query.username;
  try {
    const result = await UserController.get(
      {
        username: username,
      },
      {
        stripeCustomerId: 0,
        stripeAccountId: 0,
        awsUserId: 0,
        additionalEmails: 0,
        isAdmin: 0,
        email: 0,
        paymentMethod: 0,
        isConcierge: 0,
        hostShare: 0,
        isHost: 0,
      }
    );
    const params = { memberId: result._id.toString(), isMember: true };
    let upcomingTrips = [];
    if (result?.showUpcomingTrips) {
      upcomingTrips = await TripController.myTrips(params, {});
    }
    let pastTrips = [];
    if (result?.showPastTrips) {
      params['isArchived'] = true;
      pastTrips = await TripController.myTrips(params, {});
    }

    return successResponse(res, { user: result, pastTrips, upcomingTrips });
  } catch (error) {
    return failureResponse(res, error);
  }
};

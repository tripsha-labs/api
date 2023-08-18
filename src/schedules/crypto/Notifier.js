import { UserModel } from '../../models';

import { sendNotifications } from '../../helpers/db-helper';

/**
 * Abstraction to handle sending notifications to travelers and hosts.
 */
export class Notifier {
  static async notifyTraveler(props) {
    const { trip, chargeOutcome, notificationType, booking } = props;

    const { travelerNotifications } = trip || {};
    console.log('Traveler notifications', travelerNotifications);

    const memberInfo = await UserModel.get({
      _id: booking.memberId,
    });
    const trip_url = `${
      process.env.CLIENT_BASE_URL
    }/trip/${trip._id.toString()}`;

    //WARN: trip title should be escaped to prevent someone from puttnig HTML/links in a
    //title for a trip as an XSS attack vector.
    const tripName = `<a href="${trip_url}">${trip['title']}</a>`;
    const rsvpTraveler = travelerNotifications?.find(
      a => a.id == chargeOutcome //'payment_charged'
    );
    if (rsvpTraveler && rsvpTraveler.hasOwnProperty('id')) {
      const type = [];
      if (rsvpTraveler?.inapp) type.push('app');
      if (rsvpTraveler?.email) type.push('email');
      try {
        console.log('Sending notification', memberInfo?.lastName);

        await sendNotifications(
          notificationType, //'payment_charged_success_traveler',
          memberInfo,
          [memberInfo?._id],
          trip._id,
          {
            emailParams: {
              TripName: tripName,
            },
            messageParams: {
              TripName: tripName,
            },
          },
          type
        );
      } catch (e) {
        console.log(e);
      }
    } else {
      console.warn('No traveler found in trip for outcome', chargeOutcome);
    }
  }

  static async notifyHost(props) {
    const { trip, paymentOutcome, notificationType, booking } = props;
    const { hostNotifications } = trip || {};
    const ownerInfo = await UserModel.get({
      _id: trip.ownerId,
    });
    const memberInfo = await UserModel.get({
      _id: booking.memberId,
    });
    const trip_url = `${
      process.env.CLIENT_BASE_URL
    }/trip/${trip._id.toString()}`;
    const tripName = `<a href="${trip_url}">${trip['title']}</a>`;
    const rsvpHost = hostNotifications?.find(
      a => a.id == paymentOutcome //'payment_charged'
    );

    if (rsvpHost && rsvpHost?.hasOwnProperty('id')) {
      const type = [];
      if (rsvpHost?.inapp) type.push('app');
      if (rsvpHost?.email) type.push('email');
      const travelerName = `${memberInfo?.firstName ||
        ''} ${memberInfo?.lastName || ''}`;
      try {
        await sendNotifications(
          notificationType,
          //'payment_charged_success_host',
          ownerInfo,
          [ownerInfo?._id],
          trip._id,
          {
            emailParams: {
              TripName: tripName,
              TravelerName: travelerName,
            },
            messageParams: {
              TripName: tripName,
              TravelerName: travelerName,
            },
          },
          type
        );
      } catch (e) {
        console.log(e);
      }
    }
  }
}

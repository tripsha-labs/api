import {
  ActivityLogModel,
  NotificationsModel,
  UserPermissionModel,
} from '../models';
import { sendEmail } from '../utils';

export const checkPermission = async (
  currentUser,
  trip,
  module = 'common',
  permission = 'view'
) => {
  const query = { email: currentUser?.email, tripId: trip._id };
  const res = await UserPermissionModel.findOne(query);
  const { tabPermissions, viewPermissions } = res || {};
  if (
    currentUser.isAdmin ||
    res?.coHost ||
    trip?.ownerId?.toString() === currentUser?._id?.toString()
  ) {
    return true;
  } else if (permission == 'view') {
    switch (module) {
      case 'attendees':
        return (
          tabPermissions.hasOwnProperty(module) ||
          Object.keys(viewPermissions).length > 0
        );
      default:
        return tabPermissions.hasOwnProperty(module);
    }
  } else if (permission == 'edit') {
    switch (module) {
      case 'trip':
        return false;
      default:
        return (
          tabPermissions.hasOwnProperty(module) &&
          tabPermissions[module] == 'edit'
        );
    }
  } else return false;
};

export const getTripsByPermissions = async currentUser => {
  const query = { email: currentUser?.email };
  const permissions = await UserPermissionModel.find(query);
  if (permissions.length > 0) return permissions?.map(p => p.tripId);
  return [];
};

export const sendNotifications = async (
  messageId,
  toUser = null,
  audienceIds = [],
  tripId = null,
  params = {},
  type = ['app', 'email']
) => {
  try {
    String.prototype.format = function(options) {
      let option,
        regex,
        formatted = this.valueOf();
      for (option in options) {
        regex = new RegExp('#{' + option + '}', 'g');
        formatted = formatted.replace(regex, options[option]);
      }
      return formatted;
    };
    const notification = await NotificationsModel.findOne({ id: messageId });
    if (notification) {
      const { messageParams, emailParams, subjectParams } = params || {};
      const { message, subject, emailMessage } = notification;
      if (type.includes('app')) {
        if (audienceIds?.length > 0 && toUser) {
          const messageString = messageParams
            ? message.format(messageParams)
            : message;
          await ActivityLogModel.create({
            message: messageString,
            userId: toUser._id,
            tripId: tripId,
            audienceIds: audienceIds,
            type: 'Trip',
            unread: true,
          });
        }
      }
      if (type.includes('email')) {
        if (toUser) {
          const emailString = emailParams
            ? emailMessage.format(emailParams)
            : emailMessage;
          const subjectString = subjectParams
            ? subject.format(subjectParams)
            : subject;
          let emails = [];
          if (
            toUser &&
            toUser.additionalEmails &&
            toUser.additionalEmails.length > 0
          ) {
            emails = toUser.additionalEmails.map(em => em.email);
          } else {
            emails = [toUser['email']];
          }
          sendEmail({
            emails: emails,
            name: toUser?.firstName || 'there',
            subject: subjectString,
            message: emailString,
          });
        }
      }
    }
    // console.log(
    //   'My name is #{name} and I am #{age}-years-old'.format(options2)
    // );
  } catch (error) {}
};

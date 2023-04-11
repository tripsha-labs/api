import { UserPermissionModel } from '../models';

export const checkPermission = async (
  currentUser,
  trip,
  module,
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

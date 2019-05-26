/**
 * @name - add member
 * @description - Trip add member handler (lambda function)
 */
import { TABLE_NAMES, ERROR_CODES, ERROR_KEYS } from '../../constants';
import { success, failure, executeQuery } from '../../utils';
import { memberValidation } from '../../models';
import {
  queryBuilder,
  keyPrefixAlterer,
  errorSanitizer,
  getTripMembers,
} from '../../helpers';
import * as moment from 'moment';

export const memberAction = async (event, context) => {
  const data = JSON.parse(event.body) || {};
  const errors = memberValidation(data);
  if (errors != true) {
    return failure(errors, ERROR_CODES.VALIDATION_ERROR);
  }
  const getMembershipParams = {
    TableName: TABLE_NAMES.MEMBERS,
    Key: {
      memberId: data['memberId'],
      tripId: data['tripId'],
    },
  };
  const info = {};
  try {
    const resMember = await executeQuery('get', getMembershipParams);
    console.log(resMember);
    if (!resMember.Item) throw 'MEMBER_NOT_FOUND';
    info['memberDetails'] = resMember.Item;
    info['memberExists'] = true;
  } catch (error) {
    info['memberExists'] = false;
    console.log(error);
  }
  const getTripParams = {
    TableName: TABLE_NAMES.MEMBERS,
    Key: {
      tripId: data['tripId'],
    },
  };
  try {
    const resTrip = await executeQuery('get', getTripParams);
    if (!resTrip.Item) throw 'MEMBER_NOT_FOUND';
    info['tripDetails'] = resTrip.Item;
  } catch (error) {
    info['action'] = false;
    console.log(error);
  }
  let membershipParams = {
    TableName: TABLE_NAMES.MEMBERS,
    Item: {
      memberId: data['memberId'],
      tripId: data['tripId'],
      isActive: false,
      isOwner: false,
      updatedAt: moment().unix(),
    },
  };
  info['tripUpdateRequired'] = false;
  switch (data['action']) {
    case 'addMember':
      if (
        info['tripDetails'] &&
        (info['tripDetails']['isArchived'] || info['tripDetails']['isFull'])
      ) {
        info['action'] = false;
        break;
      }
      info['tripUpdateRequired'] = true;
      if (info['memberExists']) {
        membershipParams = { ...getMembershipParams };
        const updateQuery = { isMember: true, isActive: true };
        membershipParams['UpdateExpression'] =
          'SET ' + queryBuilder(updateQuery);
        membershipParams['ExpressionAttributeValues'] = keyPrefixAlterer(
          updateQuery
        );
        info['action'] = 'update';
      } else {
        info['action'] = 'put';
        membershipParams['Item'] = {
          ...membershipParams['Item'],
          isMember: true,
          isFavorite: false,
          isActive: true,
        };
      }
      break;
    case 'makeFavorite':
      if (info['memberExists']) {
        info['action'] = 'update';
        membershipParams = { ...getMembershipParams };
        const updateQuery = { isFavorite: true };
        membershipParams['UpdateExpression'] =
          'SET ' + queryBuilder(updateQuery);
        membershipParams['ExpressionAttributeValues'] = keyPrefixAlterer(
          updateQuery
        );
      } else {
        info['action'] = 'put';
        membershipParams['Item'] = {
          ...membershipParams['Item'],
          isFavorite: true,
          isMember: false,
        };
      }
      break;
    case 'removeMember':
      if (info['memberExists']) {
        membershipParams = { ...getMembershipParams };
        if (
          info['memberDetails']['isFavorite'] ||
          (info['tripDetails'] && info['tripDetails']['isArchived'])
        ) {
          info['action'] = 'update';
          const updateQuery = { isActive: false };
          membershipParams['UpdateExpression'] =
            'SET ' + queryBuilder(updateQuery);
          membershipParams['ExpressionAttributeValues'] = keyPrefixAlterer(
            updateQuery
          );
        } else {
          info['action'] = 'delete';
          info['tripUpdateRequired'] = true;
        }
      }
      break;

    case 'makeUnFavorite':
      if (info['memberExists']) {
        membershipParams = { ...getMembershipParams };
        if (info['memberDetails']['isMember']) {
          info['action'] = 'update';
          const updateQuery = { isFavorite: false };
          membershipParams['UpdateExpression'] =
            'SET ' + queryBuilder(updateQuery);
          membershipParams['ExpressionAttributeValues'] = keyPrefixAlterer(
            updateQuery
          );
        } else {
          info['action'] = 'delete';
        }
      }
      break;

    default:
      info['action'] = false;
      break;
  }

  try {
    if (info['action'] == false) {
      return failure(ERROR_KEYS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    }
    console.log(info);
    console.log(membershipParams);
    await executeQuery(info['action'], membershipParams);
    if (info['tripUpdateRequired']) {
      const members = await getTripMembers(data['tripId']);
      const trip = {
        groupSize: members.Count,
        isFull: groupSize >= info['tripDetails']['maxGroupSize'],
        spotFilledRank: Math.round(
          (data['groupSize'] / data['maxGroupSize']) * 100
        ),
      };
      const updateTripParams = {
        TableName: TABLE_NAMES.TRIP,
        Key: {
          tripId: data['tripId'],
        },
        UpdateExpression: 'SET ' + queryBuilder(trip),
        ExpressionAttributeValues: keyPrefixAlterer(trip),
      };
      console.log(updateTripParams);
      await executeQuery('update', updateTripParams);
    }
    return success('success');
  } catch (error) {
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};

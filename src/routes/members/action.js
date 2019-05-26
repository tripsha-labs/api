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
  const info = { tripUpdateRequired: false };
  const getTripParams = {
    TableName: TABLE_NAMES.TRIP,
    Key: {
      id: data['tripId'],
    },
  };
  try {
    const resTrip = await executeQuery('get', getTripParams);
    if (!resTrip.Item) throw 'TRIP_NOT_FOUND';
    info['tripDetails'] = resTrip.Item;
  } catch (error) {
    console.log(error);
    console.log('Trip not found.');
    return failure(ERROR_KEYS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }
  const promises = [
    data['memberIds'].map(async memberId => {
      const getMembershipParams = {
        TableName: TABLE_NAMES.MEMBERS,
        Key: {
          memberId: memberId,
          tripId: data['tripId'],
        },
      };
      try {
        const resMember = await executeQuery('get', getMembershipParams);
        if (!resMember.Item) throw 'MEMBER_NOT_FOUND';
        info['memberDetails'] = resMember.Item;
        info['memberExists'] = true;
      } catch (error) {
        info['memberExists'] = false;
        console.log(error);
        console.log('Member not exists.');
      }

      let membershipParams = {
        TableName: TABLE_NAMES.MEMBERS,
        Item: {
          memberId: memberId,
          tripId: data['tripId'],
          isActive: false,
          isOwner: false,
          updatedAt: moment().unix(),
        },
      };
      info['action'] = false;
      switch (data['action']) {
        case 'addMember':
          if (
            info['tripDetails'] &&
            (info['tripDetails']['isArchived'] || info['tripDetails']['isFull'])
          ) {
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
          break;
      }
      if (info['action'] !== false) {
        return executeQuery(info['action'], membershipParams);
      }
    }),
  ];

  try {
    if (promises.length == 0) {
      return failure(ERROR_KEYS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    }
    await Promise.all(promises);
    const members = await getTripMembers(data['tripId']);
    const trip = {
      groupSize: members.Count,
      isFull: members.Count >= info['tripDetails']['maxGroupSize'],
      spotFilledRank: Math.round(
        (members.Count / info['tripDetails']['maxGroupSize']) * 100
      ),
    };
    const updateTripParams = {
      TableName: TABLE_NAMES.TRIP,
      Key: {
        id: data['tripId'],
      },
      UpdateExpression: 'SET ' + queryBuilder(trip),
      ExpressionAttributeValues: keyPrefixAlterer(trip),
    };
    console.log(updateTripParams);
    await executeQuery('update', updateTripParams);
    return success('success');
  } catch (error) {
    console.log(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};

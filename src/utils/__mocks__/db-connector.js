import { TABLE_NAMES } from '../../constants';

export const saveItem = async params => {
  if (!params.Item) return Promise.resolve([]);
  return await Promise.resolve({
    Item: { ...params.Item },
  });
};

export const updateItem = async params => {
  return await Promise.resolve({});
};

export const getItem = params => {
  if (params.Key.id !== 'id_of_the_item') return Promise.reject({});
  return Promise.resolve({
    Item: {
      id: params.Key.id,
      isFavorite: true,
    },
  });
};

export const deleteItem = params => {
  if (params.Key.id !== 'id_of_the_item') return Promise.reject({});
  return Promise.resolve({});
};

export const scanItem = params => {
  if (params.ExpressionAttributeValues[':userId'] !== 'sanjay')
    return Promise.resolve({ Items: [] });
  return Promise.resolve({
    Items: [
      {
        id: 'id_of_the_item',
        memberId: 'id_of_the_item',
      },
    ],
    Count: 1,
  });
};

export const queryItem = params => {
  return Promise.resolve({
    Items: [{ id: 'id_of_the_item', memberId: 'id_of_the_item' }],
    Count: 1,
  });
};

export const batchGetItem = params => {
  return Promise.resolve({
    resTrips: {
      Responses: {
        [TABLE_NAMES.TRIP]: {
          Items: [{ id: 'id_of_the_item', memberId: 'id_of_the_item' }],
          Count: 1,
        },
      },
    },
  });
};

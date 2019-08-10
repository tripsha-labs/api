export const saveItem = async params => {
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
    Items: [{ id: 'id_of_the_item' }],
    Count: 1,
  });
};

export const queryItem = params => {
  return Promise.resolve({
    Items: [{ id: 'id_of_the_item' }],
    Count: 1,
  });
};

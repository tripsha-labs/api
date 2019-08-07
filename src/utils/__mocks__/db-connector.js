export const saveItem = async params => {
  return await Promise.resolve({
    Item: { ...params.Item },
  });
};

export const updateItem = async params => {
  return await Promise.resolve({});
};

export const getItem = params => {
  const item = {
    id: 'id_of_the_item',
  };
  return Promise.resolve({ Item: item });
};

export const deleteItem = params => {
  return Promise.resolve({});
};

export const scanItem = params => {
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

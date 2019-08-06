export const saveItem = async params => {
  return await Promise.resolve({
    Item: { ...params.Item, id: 'id_of_the_item' },
  });
};

// export const updateItem = params => {
//   return Promise.resolve();
// };

// export const getItem = params => {
//   return Promise.resolve();
// };

// export const deleteItem = params => {
//   return Promise.resolve();
// };

// export const scanItem = params => {
//   return Promise.resolve();
// };

// export const queryItem = params => {
//   return Promise.resolve();
// };

export const ERROR_CODES = {
  FIELD_REQUIRED: fieldName => ({
    error_code: 'FIELD_REQUIRED',
    field: `${fieldName}`,
    message: `${path} is required.`,
  }),
};

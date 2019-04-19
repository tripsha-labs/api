export const ERROR_CODES = {
    FIELD_REQUIRED: (path) => ({ "error_code": 'FIELD_REQUIRED', "field":'${path}', "message": '${path} can not be empty.'})
}
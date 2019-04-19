import Schema from 'validate'
import {ERROR_CODES} from "../constants";

export const createUser = new Schema({
  username: {
    type: String,
    required: true,
    length: { min: 3, max: 32 },
    message: {
        type: 'username must be a string.',
        required: 'username is required.'
      }
  },
  email: {
    type: String,
    required: true,
    message: {
        type: 'email must be a string.',
        required: 'email is required.'
      }
  }
});
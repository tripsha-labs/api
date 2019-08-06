import { UserController } from './user.ctrl';
import { success, failure } from '../../utils';
import { errorSanitizer } from '../../helpers';

export const createUser = async (event, context) => {
  try {
    const data = JSON.parse(event.body);
    const user = await UserController.save(data);
    return success(user);
  } catch (error) {
    console.log(error);
    return failure(errorSanitizer(error), ERROR_CODES.VALIDATION_ERROR);
  }
};

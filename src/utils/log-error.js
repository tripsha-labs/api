export const logError = error => {
  if (!error) return;
  if (error.code && error.message) {
    console.log(error.code, error.message);
  } else if (error.code) {
    console.log(error.code);
  } else if (error.message) {
    console.log(error.message);
  } else {
    console.log(error);
  }
};

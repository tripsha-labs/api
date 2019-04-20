export const callbackToAsync = (func, data, params) => {
    return new Promise((resolve, reject) => {
        func(data, params,(err, res) => {
            if(err)
                return reject(err);
            return resolve(res);
        });
    });
}
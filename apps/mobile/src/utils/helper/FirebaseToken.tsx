
import messaging from '@react-native-firebase/messaging';

export const getDeviceToken = (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
      messaging()
        .getToken()
        .then(value => {
          if (value) {
            console.log("Fire",value)
            resolve(value);
          } else {
            reject('Token could not be generated');
          }
        })
        .catch(error => {
          reject('Token could not be generated');
          // console.log("Token error", error)
        });
  });
};

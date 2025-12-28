import React, {useEffect} from 'react';
import {Image, View} from 'react-native';
import {Images} from '../../themes';
import {useAppDispatch} from '@app/redux';
import Storage from '@utils/storage';
import {setUserStatus} from '@app/redux/slice/auth.slice';

const Splash = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    setTimeout(() => {
      let token = Storage.getItem('token');
      console.log('token===>', token);
      let personalized_category = Storage.getItem('personalized_category');
      const isAdmin = Storage.getItem('is_admin') === 'true';

      if (token && personalized_category === 'true') {
        dispatch(
          setUserStatus({
            isLoggedIn: true,
            personalized_category: true,
            isAdmin,
          }),
        );
      } else if (token && personalized_category === 'false') {
        dispatch(
          setUserStatus({
            isLoggedIn: true,
            personalized_category: false,
            isAdmin,
          }),
        );
      } else {
        dispatch(
          setUserStatus({
            isLoggedIn: false,
            personalized_category: false,
            isAdmin: false,
          }),
        );
      }
    }, 1500);
  }, []);

  return (
    <View style={{flex: 1}}>
      <Image
        source={Images.Splash}
        style={{
          height: '100%',
          width: '100%',
        }}
      />
    </View>
  );
};

export default Splash;
// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

// const Splash = () => {
//   return (
//     <View>
//       <Text>Splash</Text>
//     </View>
//   )
// }

// export default Splash

// const styles = StyleSheet.create({})

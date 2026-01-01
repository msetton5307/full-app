import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import {Colors, Fonts} from '../../../themes';
import {moderateScale} from '../../../utils/orientation';
import {showMessage} from '@app/utils/helper/Toast';

const Flights = () => {
  const handleNotify = () => {
    showMessage('We will notify you once flights are available.');
  };

  return (
    <GeneralTemplate
      enableBack={false}
      isSearch={false}
      fixedComponent={<Text style={styles.headerText}>Flights</Text>}>
      <View style={styles.container}>
        <Text style={styles.helperText}>
          We are preparing an amazing flight experience. Check back soon for
          the latest deals and routes.
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleNotify}
          style={styles.notifyButton}>
          <Text style={styles.notifyText}>Notify me when it's ready</Text>
        </TouchableOpacity>
      </View>
    </GeneralTemplate>
  );
};

export default Flights;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: moderateScale(10),
    gap: moderateScale(20),
  },
  headerText: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(17),
    marginTop: moderateScale(20),
  },
  helperText: {
    color: Colors.Gunmetal,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: moderateScale(13),
    lineHeight: moderateScale(20),
  },
  notifyButton: {
    backgroundColor: Colors.Aztec_Gold,
    paddingVertical: moderateScale(14),
    borderRadius: moderateScale(12),
    alignItems: 'center',
  },
  notifyText: {
    color: Colors.white,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(14),
  },
});

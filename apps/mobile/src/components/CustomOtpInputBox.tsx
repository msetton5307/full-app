import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewProps,
  ViewStyle,
  StyleProp,
} from 'react-native';
import {moderateScale} from '../utils/orientation';
import {Colors, Fonts} from '../themes';

interface CustomOtpInputBoxProps {
  length: number;
  onOTPChange: (val: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
  reset?: boolean;
}

const CustomOtpInputBox = (props: CustomOtpInputBoxProps) => {
  const {length = 6, onOTPChange, containerStyle = {}, reset = false} = props;

  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputs: any = useRef([]);

  const handleChange = (text: string, index: number) => {
    const newOtp: Array<string> = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    onOTPChange(newOtp.join(''));

    if (text && index < length - 1) {
      inputs.current[index + 1].focus(); // Focus the next input
    }

    if (!text && index > 0) {
      inputs.current[index - 1].focus(); // Move focus to the previous input if backspace
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index]) {
      if (index > 0) {
        inputs.current[index - 1].focus(); // Focus the previous input on backspace
      }
    }
  };

  const resetOTP = useCallback(() => {
    setOtp(new Array(length).fill('')); // Clear all inputs
    inputs.current[0]?.focus(); // Focus the first input box
  }, [length]);

  useEffect(() => {
    if (reset) {
      resetOTP();
    }
  }, [reset, resetOTP]);

  return (
    <View style={[styles.container, containerStyle]}>
      {Array(length)
        .fill(0)
        .map((_, index) => (
          <TextInput
            key={index}
            placeholder="-"
            placeholderTextColor={Colors.Old_Silver}
            value={otp[index]}
            onChangeText={text => handleChange(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            style={styles.input}
            keyboardType="number-pad"
            maxLength={1}
            ref={ref => (inputs.current[index] = ref)} // Set the ref to access input
          />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',

    gap: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(20),

    backgroundColor: 'transparent',
  },
  input: {
    color: Colors.Aztec_Gold,
    fontFamily: Fonts.PoppinsBold,

    borderWidth: 1,
    borderColor: Colors.Almond,
    fontSize: moderateScale(20),
    width: moderateScale(60),
    height: moderateScale(60),
    textAlign: 'center',
    borderRadius: 10,
    shadowOpacity: 1,
    shadowColor: '#4514A517',
    shadowOffset: {
      height: 5,
      width: 5,
    },
    elevation: 5,
    backgroundColor: 'white',
  },
});

export default CustomOtpInputBox;

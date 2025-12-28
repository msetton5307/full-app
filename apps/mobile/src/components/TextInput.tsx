import {
  View,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  Image,
  StyleProp,
  ViewStyle,
  StyleSheet,
  TextStyle,
  KeyboardTypeOptions,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import React, {useState} from 'react';
import {Colors, Fonts, Icons} from '../themes';
import {moderateScale} from '../utils/orientation';

type AutoCompleteType = RNTextInputProps['autoComplete'];
type TextContentTypeType = RNTextInputProps['textContentType'];

interface TextInputProps {
  title?: string;
  placeholder?: string;
  placeholderColor?: string;
  value: string;
  onChangeText?: (text: string) => void;
  mainContainerStyle?: StyleProp<ViewStyle> | undefined;
  innerContainerStyle?: StyleProp<ViewStyle> | undefined;
  labelTextStyle?: StyleProp<TextStyle> | undefined;
  textType?: string;
  secureTextEntry?: boolean | null;
  editable?: boolean;
  multiline?: boolean;
  KeyboardTypeOptions?: KeyboardTypeOptions;
  autoComplete?: AutoCompleteType;
  textContentType?: TextContentTypeType;
  importantForAutofill?: 'yes' | 'no' | 'noExcludeDescendants' | 'auto' | 'yesExcludeDescendants';
}

const TextInput = ({
  value,
  onChangeText = () => {},
  mainContainerStyle = {},
  innerContainerStyle = {},
  labelTextStyle = {},
  title = 'Enter input title',
  textType = 'password | default',
  editable = true,
  placeholder = '',
  KeyboardTypeOptions = 'default',
  placeholderColor = Colors.Old_Silver,
  multiline = false,
  textContentType = 'none',
  autoComplete,
  importantForAutofill
}: TextInputProps) => {
  const [passwordVisible, setPasswordVisible] = useState(true);

  return (
    <View
      style={[
        styles.mainContainer,
        mainContainerStyle,
        {
          height: multiline ? moderateScale(105) : moderateScale(65),
          paddingTop: multiline ? moderateScale(10) : moderateScale(0),
        },
      ]}>
      <Text style={[styles.labelText, labelTextStyle]}>{title}</Text>
      <View style={[styles.innerContainer, innerContainerStyle]}>
        <RNTextInput
          multiline={multiline}
          style={[
            styles.textInput,
            {height: multiline ? moderateScale(85) : moderateScale(45)},
          ]}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          onChangeText={onChangeText}
          value={value}
          keyboardType={KeyboardTypeOptions}
          secureTextEntry={textType === 'password' ? passwordVisible : false}
          editable={editable}
          textContentType={textContentType}
          autoComplete={autoComplete}
          importantForAutofill={importantForAutofill}
        />
        {textType === 'password' ? (
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}>
            <Image
              resizeMode="contain"
              source={passwordVisible ? Icons.Show : Icons.Hide}
              style={styles.passwordIcon}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    borderWidth: moderateScale(2),
    borderColor: Colors.Almond,
    borderRadius: moderateScale(10),
    width: '90%',
    alignSelf: 'center',
    marginTop: moderateScale(25),
    height: moderateScale(65),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    shadowOpacity: 0.5,
    shadowColor: '#4514A517',
    shadowOffset: {
      height: 5,
      width: 5,
    },
    elevation: 5,
  },
  innerContainer: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  labelText: {
    position: 'absolute',
    top: -10,
    left: 15,
    backgroundColor: 'white',
    paddingHorizontal: moderateScale(10),
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(15),
    color: Colors.Aztec_Gold,
    borderRadius: moderateScale(10),
    zIndex: 1,
  },
  textInput: {
    alignItems: 'center',
    paddingLeft: moderateScale(25),
    paddingRight: moderateScale(10),
    fontSize: moderateScale(14),
    flex: 1,
    height: '100%',
    fontFamily: Fonts.PoppinsMedium,
    textAlignVertical: 'top',
    color: Colors.black_olive,
  },
  passwordIcon: {
    height: moderateScale(20),
    width: moderateScale(20),
    marginRight: moderateScale(15),
  },
});
export default TextInput;

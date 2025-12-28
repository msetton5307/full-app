import {
  View,
  Modal,
  Pressable,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import React, {FC} from 'react';
import {BlurView} from '@react-native-community/blur';
import {moderateScale} from '../utils/orientation';
import {Colors} from '../themes';
import Loader from '../utils/helper/Loader';

interface BottomSheetProps {
  isVisible: boolean;
  onBackDropPress: () => void;
  children?: any;
  height?: any;
  animationType?: 'slide' | 'none' | 'fade';
  isloadervisible?: boolean;
  enableLoader?: boolean;
}

const BottomSheet: FC<BottomSheetProps> = ({
  isVisible = false,
  onBackDropPress = () => {},
  children,
  height = '50%',
  animationType = undefined,
  isloadervisible = false,
  enableLoader = false,
}) => {
  return (
    <Modal
      visible={isVisible}
      animationType={animationType}
      transparent
      onRequestClose={onBackDropPress}>
      <TouchableWithoutFeedback onPress={onBackDropPress}>
        <KeyboardAvoidingView
          behavior="height"
          style={{
            flex: 1,
          }}>
          <BlurView
            blurAmount={5}
            blurRadius={15}
            downsampleFactor={10}
            reducedTransparencyFallbackColor="transparent"
            overlayColor="transparent"
            blurType="light"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              height: '100%',
            }}
          />
          {enableLoader ? <Loader visible={isloadervisible} /> : null}

          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              justifyContent: 'flex-end',
            }}>
            <Pressable style={{flex: 1}} onPress={onBackDropPress} />
            <View
              style={{
                backgroundColor: Colors.white,
                height: height,
                width: '100%',
                borderTopLeftRadius: moderateScale(25),
                borderTopRightRadius: moderateScale(25),
                overflow: 'hidden',
              }}>
              {children}
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default BottomSheet;

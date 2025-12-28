import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Colors, Fonts} from '../../../themes';
import {moderateScale} from '../../../utils/orientation';
import TextInput from '../../../components/TextInput';
import {CustomButtonSolid} from '../../../components/CustomButton';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import Css from '../../../themes/Css';
import {useAppDispatch} from '@app/redux';
import {addBank, getbankDetails} from '@app/utils/service/UserService';
import {showMessage} from '@app/utils/helper/Toast';
import WebView from 'react-native-webview';
import Modal from 'react-native-modal';
import MyStatusBar from '@app/utils/helper/MyStatusBar';

const Payout = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bankname, setbankname] = useState('');
  const [holdername, setholdername] = useState('');
  const [accno, setaccno] = useState('');
  const [swiftcode, setswiftcode] = useState('');
  interface BankDetails {
    url: string;
    [key: string]: any;
  }

  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [accountModal, setAccountModal] = useState<boolean>(false);
  interface BankData {
    bank_name: string;
    account_number: string;
    bank_code: string;
    [key: string]: any;
  }

  const [bankData, setBankData] = useState<BankData | null>(null);

  useEffect(() => {
    bankDetailsFunc();
  }, []);

  async function handleAddBank() {
    try {
      setIsLoading(true);
      const result = await dispatch(addBank(null));
      showMessage(result?.message);
      if (result?.success) {
        setBankDetails(result?.data);
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      }
    } catch (error) {
      console.log('Error in handleSignIn:', error);
    }
  }

  async function bankDetailsFunc() {
    try {
      setIsLoading(true);
      const result = await dispatch(getbankDetails(null));
      setIsLoading(false);
      if (result?.success) {
        setBankData(result?.data);
      }
    } catch (error) {
      console.log('Error in handleSignIn:', error);
    }
  }

  function handleResponse(data: any) {
    console.log(data);
    let url = data.url.split('?');
    console.log('59===>>>', url);
    let url1 = url[0].split('/');
    console.log('61---->>>', url1);
    if (url1[3] === 'bank-add-success') {
      setIsLoading(true);
      setTimeout(() => {
        bankDetailsFunc();
        setIsLoading(false);
        setAccountModal(false);
        showMessage('Bank Account is Added successfully');
      }, 2000);
    } else if (url1[3] === 'bank-details-add-error') {
      setTimeout(() => {
        setAccountModal(false);
        showMessage('Bank Account not Added');
      }, 2000);
    } else {
      return;
    }
  }

  return (
    <>
      <GeneralTemplate enableBack isSearch={false} title="Payout Details">
        {/* <TextInput
        value={bankname}
        onChangeText={text => {
          setbankname(text);
        }}
        title="Bank Name:"
        placeholder={'Enter bank name'}
        mainContainerStyle={Css.w100}
      />
      <TextInput
        value={holdername}
        onChangeText={text => {
          setholdername(text);
        }}
        title="Account Holder Name:"
        placeholder={'Enter account holder name'}
        mainContainerStyle={Css.w100}
      />
      <TextInput
        value={accno}
        onChangeText={text => {
          setaccno(text);
        }}
        title="Account Number:"
        placeholder={'Enter account number'}
        mainContainerStyle={Css.w100}
      />
      <TextInput
        value={swiftcode}
        onChangeText={text => {
          setswiftcode(text);
        }}
        title="Swift Code:"
        placeholder={'Enter swift code'}
        mainContainerStyle={Css.w100}
      /> */}
        {bankData ? (
          <View>
            <View style={[style.rowContainer,{marginTop:moderateScale(20)}]}>
              <Text style={style.productDetailsProductNameText}>
                Bank Details:
              </Text>
            </View>

            <View style={[style.rowContainer,{marginTop:moderateScale(15)}]}>
              <Text style={style.detailsDescValue}>
                <Text style={style.detailsDescLabel}>Bank Name: </Text>
                {bankData?.bank_name}
              </Text>
            </View>
            <View style={style.rowContainer}>
              <Text style={style.detailsDescValue}>
                <Text style={style.detailsDescLabel}>
                  Bank Account Number:{' '}
                </Text>
                xxxx xxxx {bankData?.account_number}
              </Text>
            </View>
            <View style={style.rowContainer}>
              <Text style={style.detailsDescValue}>
                <Text style={style.detailsDescLabel}>Bank Code: </Text>
                {bankData?.bank_code}
              </Text>
            </View>
          </View>
        ) : (
          <CustomButtonSolid
            label={'Add Bank Account'}
            onPress={() => {
              handleAddBank();
              setAccountModal(true);
            }}
            containerStyle={Css.w100}
          />
        )}
      </GeneralTemplate>

      <Modal
        isVisible={accountModal}
        onBackdropPress={() => setAccountModal(false)}
        animationIn="fadeIn"
        animationOut="fadeOut"
        style={style.modalStyle}>
        <View style={style.container}>
          <MyStatusBar
            backgroundColor={Colors.white}
            barStyle={'dark-content'}
          />
          {!bankDetails?.accountLink?.url ||
            (isLoading && (
              <View style={style.background}>
                <ActivityIndicator size="large" color={Colors.Aztec_Gold} />
                <Text style={style.text}> Please Wait ...</Text>
              </View>
            ))}
          {bankDetails?.accountLink?.url && !isLoading && (
            <WebView
              source={{uri: bankDetails?.accountLink?.url || ''}}
              onNavigationStateChange={data => handleResponse(data)}
              onLoad={syntheticEvent => {
                const {nativeEvent} = syntheticEvent;
                console.log('syntheticEvent', syntheticEvent);
                setIsLoading(false);
              }}
              onMessage={event => {
                console.log('event', event);
              }}
              style={{flex: 1, display: isLoading ? 'none' : 'flex'}}
            />
          )}
        </View>
      </Modal>
    </>
  );
};

export default Payout;
const style = StyleSheet.create({
  container: {flex: 1, width: '100%'},
  modalStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    flex: 1,
  },
  text: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(15),
    color: Colors.Aztec_Gold,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  rowContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: moderateScale(10),
  },
  productDetailsProductNameText: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(17),
    alignSelf: 'center',
    textDecorationLine:'underline'
  },
  detailsDescLabel: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(13),
  },
  detailsDescValue: {
    color: Colors.black_olive,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: moderateScale(13),
  },
});

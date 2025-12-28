import React, {useState} from 'react';
import {StyleSheet, Text} from 'react-native';
import {Colors, Fonts} from '../../../themes';
import {moderateScale} from '../../../utils/orientation';
import TextInput from '../../../components/TextInput';
import {CustomButtonSolid} from '../../../components/CustomButton';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import Css from '../../../themes/Css';
import {showMessage} from '@app/utils/helper/Toast';

const ContactUs = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const validateForm = () => {
    if (title.trim() === '') {
      showMessage('Title is required');
      return false;
    }

    if (message.trim() === '') {
      showMessage('Message is required');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      showMessage('Success, Your message has been sent!');
      setTitle('');
      setMessage('');
    }
  };

  return (
    <GeneralTemplate isSearch={false} enableBack title='Contact Us'>
      <TextInput
        value={title}
        onChangeText={setTitle}
        title="Title:"
        placeholder={'Enter title'}
        mainContainerStyle={Css.w100}
      />

      <TextInput
        multiline
        value={message}
        onChangeText={setMessage}
        title="Message:"
        placeholder={'Enter your message'}
        mainContainerStyle={Css.w100}
      />
      
      <CustomButtonSolid
        label="Send"
        onPress={() => handleSubmit()}
        containerStyle={Css.w100}
      />
    </GeneralTemplate>
  );
};

export default ContactUs;

import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Colors, Fonts, Icons} from '../../../themes';
import {moderateScale} from '../../../utils/orientation';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import Css from '../../../themes/Css';
import ProductCard from '../../../components/Template/ProductCard';
import TextInput from '../../../components/TextInput';
import UploadImage from '../../../components/Template/UploadImage';
import {CustomButtonSolid} from '../../../components/CustomButton';
import {showMessage} from '@app/utils/helper/Toast';
import {useAppDispatch, useAppSelector} from '@app/redux';
import {
  addNewDeal,
  deleteDeal,
  getPostedDeal,
  updateDeal,
} from '@app/utils/service/UserService';
import CustomSelectionDropdown from '@app/components/CustomSelectionDropdown';
import {getCategoryListing} from '@app/utils/service/AuthService';
import {useRoute} from '@react-navigation/native';
import {IMAGES_BUCKET_URL} from '@app/utils/constants';
import ImageBox from '@app/components/ImageBox';
import {goBack} from '@app/utils/helper/RootNaivgation';

const brandList = [
  {_id: 'amazon.png', title: 'Amazon'},
  {_id: 'flipkart.png', title: 'Flipkart'},
];
interface Categories {
  _id: string;
  title: string;
  image: string;
  parentId: string | null;
  status: 'Active' | 'Inactive' | 'Pending'; // Add more statuses if needed
}
interface PostDealType {
  title: string;
  description: string;
  categoryId: string;
  brand_logo: string;
  price: string;
  discount: string;
  link: string;
  image: {imageUri: string; imagePath: any}[];
}

const MAX_IMAGES = 5;

const EditPost = () => {
  const route = useRoute();
  const {deal, brandList}: any = route?.params;
  const dispatch = useAppDispatch();
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [selectedBrandName, setSelectedBrandName] = useState<string>('');
  const [removedImg, setRemovedImg] = useState<string[]>([]);
  const [apiLoader, setApiLoader] = useState(false);

  const [formData, setFormData] = useState<PostDealType>({
    title: deal.deal_title,
    description: deal.description,
    categoryId: '',
    brand_logo: '',
    link: deal.product_link,
    price: deal.deal_price,
    discount: deal.discount,
    image: [],
  });
  const [dealimages, setDealimages] = useState<any[]>([...deal.images]);
  const dealBrandName = brandList.find(
    (i: any) => i._id === deal.brand_logo,
  )?.title;

  const handleInputChange = (field: keyof PostDealType, value: any) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const [openDropdown, setOpenDropdown] = useState(false);

  const handleAddImage = () => {
    if (dealimages.length + formData.image.length >= MAX_IMAGES) {
      showMessage(`You can add a maximum of ${MAX_IMAGES} images.`);
      return;
    }
    setFormData(prev => ({
      ...prev,
      image: [...prev.image, {imagePath: {}, imageUri: ''}],
    }));
  };

  const handleImageChange = (
    index: number,
    value: {uri: string; path: any},
  ) => {
    setFormData(prev => ({
      ...prev,
      image: prev.image.map((img, idx) =>
        idx === index
          ? {...img, imageUri: value.uri, imagePath: value.path}
          : img,
      ),
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      image: prev.image.filter((_, idx) => idx !== index),
    }));
  };
  const handleDealImageRemove = (id: string) => {
    setDealimages(dealimages.filter((i: any) => i._id !== id));
    setRemovedImg(prev => [...prev, id]);
  };

  const validateForm = (): boolean => {
    let isValid = true;

    if (!formData.title.trim()) {
      isValid = false;
      showMessage('Title is required.');
    } else if (!formData.description.trim()) {
      isValid = false;
      showMessage('Description is required.');
    } else if (
      !formData.price.trim() ||
      isNaN(Number(formData.price)) ||
      Number(formData.price) < 0
    ) {
      isValid = false;
      showMessage('Price is required and must be a valid positive number.');
    } else if (
      !formData.discount.trim() ||
      isNaN(Number(formData.discount)) ||
      Number(formData.discount) > 100 ||
      Number(formData.discount) < 0
    ) {
      isValid = false;
      showMessage(
        'Discount percent is required and must be a valid positive number not exceeding 100.',
      );
    } else if (
      !formData.link.trim() ||
      !/^https?:\/\/[^\s]+$/.test(formData.link)
    ) {
      isValid = false;
      showMessage('Link is required and must be a valid URL.');
    } else if (
      !dealimages.length &&
      (!formData.image.length || formData.image.every(img => !img.imageUri))
    ) {
      isValid = false;
      showMessage('At least one image is required.');
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      // Form is valid, proceed to submit
      try {
        setApiLoader(true);
        const payload = new FormData();
        payload.append('deal_title', formData.title);
        payload.append('description', formData.description);
        if (formData.categoryId) {
          payload.append('categoryId', formData.categoryId);
        }
        if (formData.brand_logo) {
          payload.append('brand_logo', formData.brand_logo);
        }
        payload.append('deal_price', formData.price);
        payload.append('discount', formData.discount);
        payload.append('product_link', formData.link);
        if (formData.image.length) {
          formData.image.forEach((img: any) => {
            payload.append('image', img.imagePath);
          });
        }
        payload.append('delete_image_ids', removedImg);
        payload.append('id', deal?._id);
        const result = await dispatch(updateDeal(payload));
        if (result.success) {
          setApiLoader(false);
          showMessage(result?.message);
          setTimeout(() => {
            goBack();
          }, 1000);
        } else {
          setApiLoader(false);
          showMessage(result?.message);
        }
      } catch (error) {
        setApiLoader(false);
        console.log(`Error handling`, error);
      }
    }
  };

  const handleDelete = async () => {
    try {
      setApiLoader(true);
      const result = await dispatch(deleteDeal(deal?._id));
      if (result?.success) {
        setApiLoader(false);
        showMessage(result?.message);
        setTimeout(() => {
          goBack();
        }, 1000);
      } else {
        setApiLoader(false);
        showMessage(result?.message);
      }
    } catch (error) {
      setApiLoader(false);
      console.log(`Error handling`, error);
    }
  };

  return (
    <GeneralTemplate
      enableBack
      isSearch={false}
      isProfileVisible={false}
      title="Edit Deal">
      <Text style={styles.textStyle}>Deal Form</Text>
      <View style={[Css.w100, Css.fdr]}>
        <Image style={Css.icon20} source={Icons.icon_info} />
        <Text style={styles.infoText}>
          When deals is approved you will be paid{' '}
          <Text
            style={{
              color: Colors.Aztec_Gold,
              fontFamily: Fonts.PoppinsSemiBold,
            }}>
            $5
          </Text>{' '}
          for each approved deals.
        </Text>
      </View>
      <TextInput
        value={formData.title}
        onChangeText={v => handleInputChange('title', v)}
        title="Deal Title:"
        placeholder={'Enter deal title'}
        mainContainerStyle={Css.w100}
      />
      <TextInput
        value={formData.description}
        onChangeText={v => handleInputChange('description', v)}
        title="Description:"
        placeholder={'Enter deal description'}
        mainContainerStyle={Css.w100}
        multiline
      />
      {/* <CustomSelectionDropdown
        forEdit
        mainContainerStyle={Css.w100}
        title="Select Category:"
        onPressSelect={(id, title) => {
          handleInputChange('categoryId', id);
          setSelectedCategoryName(title);
        }}
        dropdownList={categoryList}
        dropdownTitle={'Select Category'}
        selectedValue={selectedCategoryName || deal.categories.title}
      /> */}

      {dealimages.length && (
        <ImageBox
          images={dealimages}
          onPressRemove={id => handleDealImageRemove(id)}
        />
      )}

      {formData.image?.map((item, index) => (
        <UploadImage
          forEdit
          image={item.imageUri}
          key={index}
          index={index}
          onChangeValue={(v: any) => handleImageChange(index, v)}
          mainContainerStyle={Css.w100}
          onPressRemove={() => handleRemoveImage(index)}
        />
      ))}
      <TouchableOpacity onPress={handleAddImage} style={styles.addContainer}>
        <Image source={Icons.icon_add} style={Css.icon20} />
        <Text style={styles.add}>Add more Image</Text>
      </TouchableOpacity>

      <TextInput
        value={formData.price}
        onChangeText={v => handleInputChange('price', v)}
        title="Deal Price:"
        KeyboardTypeOptions={'number-pad'}
        placeholder={'Enter deal price'}
        mainContainerStyle={Css.w100}
      />
      <TextInput
        value={formData.discount}
        onChangeText={v => handleInputChange('discount', v)}
        title="Discount Percent:"
        KeyboardTypeOptions={'number-pad'}
        placeholder={'Enter discount percent'}
        mainContainerStyle={Css.w100}
      />
      <TextInput
        value={formData.link}
        onChangeText={v => handleInputChange('link', v)}
        title="Product link:"
        placeholder={'Enter product link'}
        mainContainerStyle={Css.w100}
      />
      <CustomSelectionDropdown
        forEdit
        mainContainerStyle={Css.w100}
        title="Select Brand:"
        onPressSelect={(id, title) => {
          handleInputChange('brand_logo', id);
          setSelectedBrandName(title);
        }}
        dropdownList={brandList}
        dropdownTitle={'Select Brand'}
        selectedValue={selectedBrandName || dealBrandName}
      />
      <CustomButtonSolid
        label="Update Deal"
        onPress={() => handleSubmit()}
        containerStyle={Css.w100}
      />

      <CustomButtonSolid
        label="Delete Deal"
        onPress={() => {
          Alert.alert(
            'Confirm Deletion',
            'Are you sure you want to delete this deal?',
            [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Delete', onPress: handleDelete, style: 'destructive'},
            ],
          );
        }}
        containerStyle={[Css.w100, {backgroundColor: Colors.Amaranth_Red}]}
      />
    </GeneralTemplate>
  );
};

export default EditPost;

const styles = StyleSheet.create({
  catName: {
    color: Colors.black_olive,
    fontSize: moderateScale(14),
    fontFamily: Fonts.PoppinsSemiBold,
    marginTop: moderateScale(20),
  },
  addText: {
    fontSize: moderateScale(20),
    fontFamily: Fonts.PoppinsSemiBold,
    color: Colors.Aztec_Gold,
  },
  addView: {
    height: moderateScale(30),
    width: moderateScale(30),
    borderRadius: moderateScale(50),
    borderWidth: moderateScale(1),
    borderColor: Colors.Aztec_Gold,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  textStyle: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(17),
    marginTop: moderateScale(20),
  },
  flatcontainer: {
    width: '100%',
    alignSelf: 'center',
  },
  mainContainer: {
    width: '30%',
    borderWidth: 1,
    marginTop: moderateScale(20),
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
    borderColor: Colors.Desert_Sand,

    alignItems: 'center',
  },
  logoStyle: {
    height: moderateScale(57),
    width: moderateScale(64),
    marginTop: moderateScale(15),
    alignSelf: 'center',
  },
  infoText: {
    flex: 1,
    paddingLeft: moderateScale(5),
    fontSize: moderateScale(12),
    color: Colors.pale_sky,
    fontFamily: Fonts.PoppinsRegular,
  },
  addContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: moderateScale(10),
  },
  add: {
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(15),
    color: Colors.Aztec_Gold,
    marginLeft: moderateScale(5),
  },
});

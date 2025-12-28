import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import _ from 'lodash';
import {Colors, Fonts, Icons} from '../../../themes';
import {moderateScale, verticalScale} from '../../../utils/orientation';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import Css from '../../../themes/Css';
import ProductCard from '../../../components/Template/ProductCard';
import {useIsFocused} from '@react-navigation/native';
import {useAppDispatch} from '@app/redux';
import {
  addNewDeal,
  getAllDealListing,
  getPostedDeal,
  getUserDetails,
} from '@app/utils/service/UserService';
import TextInput from '@app/components/TextInput';
import CustomSelectionDropdown from '@app/components/CustomSelectionDropdown';
import UploadImage from '@app/components/Template/UploadImage';
import {showMessage} from '@app/utils/helper/Toast';
import {navigate} from '@app/utils/helper/RootNaivgation';
import Loader from '@app/utils/helper/Loader';
import {getCategoryListing} from '@app/utils/service/AuthService';

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

const PostDeal = () => {
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();

  const brandList = [
    {_id: 'amazon.png', title: 'Amazon'},
    {_id: 'flipkart.png', title: 'Flipkart'},
  ];

  const [dealsList, setDealsList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);

  let initialFrom = {
    title: '',
    description: '',
    categoryId: '',
    brand_logo: '',
    link: '',
    price: '',
    discount: '',
    image: [{imagePath: {}, imageUri: ''}],
  };
  const [formData, setFormData] = useState<PostDealType>(initialFrom);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [selectedBrandName, setSelectedBrandName] = useState<string>('');

  const handleInputChange = (field: keyof PostDealType, value: any) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const sortDealsByNewest = useCallback((deals: any[]) => {
    return [...deals].sort((a, b) => {
      const createdA = new Date(
        a?.createdAt || a?.created_at || a?.updatedAt || a?.updated_at || 0,
      ).getTime();
      const createdB = new Date(
        b?.createdAt || b?.created_at || b?.updatedAt || b?.updated_at || 0,
      ).getTime();
      return createdB - createdA;
    });
  }, []);

  const getCategory = useCallback(async () => {
    try {
      const result = await dispatch(
        getCategoryListing({length: 0, page: 0, search: ''}),
      );

      if (result?.data) {
        setCategoryList(result?.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [setCategoryList]);

  useEffect(() => {
    if (isFocused) {
      getCategory();
      getAllDeals(1);
    }
  }, [isFocused]);

  const keyExtractor = useCallback(
    (item: any, index: number) => index.toString(),
    [],
  );

  const getAllDeals = async (_page: number, searchQuery = search) => {
    if (_page === 1) {
      setPage(1);
      setHasMoreData(true);
    }

    setIsLoading(true);
    try {
      const result = await dispatch(
        getPostedDeal({
          length: 6,
          page: _page,
          search: searchQuery,
        }),
      );

      if (result.success) {
        if (_.isEmpty(result.data)) {
          setHasMoreData(false);
          if (_page === 1) {
            setDealsList([]);
          }
        } else if (_page === 1) {
          setDealsList(sortDealsByNewest(result.data));
        } else {
          setDealsList(prev =>
            sortDealsByNewest([...prev, ...sortDealsByNewest(result.data)]),
          );
        }
      }
    } catch (error) {
      console.log('Error in handleSignIn:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    _.debounce(query => {
      getAllDeals(1, query);
    }, 500),
    [],
  );

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

  const handleAddImage = () => {
    if (formData.image.length >= MAX_IMAGES) {
      showMessage(`You can add a maximum of ${MAX_IMAGES} images.`);
      return;
    }
    setFormData(prev => ({
      ...prev,
      image: [...prev.image, {imagePath: {}, imageUri: ''}],
    }));
  };

  const validateForm = (): boolean => {
    let isValid = true;

    if (!formData.title.trim()) {
      isValid = false;
      showMessage('Title is required.');
    } else if (!formData.description.trim()) {
      isValid = false;
      showMessage('Description is required.');
    }
    //  else if (!formData.categoryId.trim()) {
    //   isValid = false;
    //   showMessage('Category is required.');
    // }
    else if (
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
    } else if (!formData.brand_logo.trim()) {
      isValid = false;
      showMessage('Brand Name is required.');
    } else if (
      !formData.image.length ||
      formData.image.every(img => !img.imageUri)
    ) {
      isValid = false;
      showMessage('At least one image is required.');
    }

    return isValid;
  };

  const handleSubmit = async () => {
    console.log('adhaisuhdipuaswhdipuhyasipudhAipush');
    if (validateForm()) {
      // Form is valid, proceed to submit
      try {
        setLoading(true);
        const payload = new FormData();
        payload.append('deal_title', formData.title);
        payload.append('description', formData.description);
        // payload.append('categoryId', formData.categoryId);
        payload.append('brand_logo', formData.brand_logo);
        payload.append('deal_price', formData.price);
        payload.append('discount', formData.discount);
        payload.append('product_link', formData.link);
        formData.image.forEach((img: any) => {
          payload.append('image', img.imagePath);
        });
        console.log('payloadhahahahahah', payload);
        const result = await dispatch(addNewDeal(payload));

        if (result.success) {
          showMessage(result?.message);
          setFormData(initialFrom);
          setSelectedBrandName('');
          setSelectedCategoryName('');
          getAllDeals(1);
        } else {
          showMessage(result?.message);
        }
      } catch (error) {
        console.log(`Error handling`, error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <GeneralTemplate
        searchValue={search}
        isRefreshing={loading}
        setSearchValue={(value: string) => {
          setSearch(value);
          debouncedSearch(value);
        }}
        isLoading={isLoading}
        scrollEnd={() => {
          if (!isLoading && hasMoreData) {
            let _page = page + 1;
            setPage(_page);
            getAllDeals(_page);
          }
        }}>
        <Text style={styles.textStyle}>Deal Form</Text>
        <View style={[Css.w100, Css.fdr, Css.mt3]}>
          <Image style={Css.icon20} source={Icons.icon_info} />
          <Text style={styles.infoText}>
            When deals is approved you will be paid{' '}
            <Text style={styles.title}>$5</Text> for each approved deals.
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
        mainContainerStyle={Css.w100}
        title="Select Category:"
        onPressSelect={(id, title) => {
          handleInputChange('categoryId', id);
          setSelectedCategoryName(title);
        }}
        dropdownList={categoryList}
        dropdownTitle={'Select Category'}
        selectedValue={selectedCategoryName}
      /> */}

        {formData.image?.map((item, index) => (
          <UploadImage
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
          mainContainerStyle={Css.w100}
          title="Select Brand:"
          onPressSelect={(id, title) => {
            handleInputChange('brand_logo', id);
            setSelectedBrandName(title);
          }}
          dropdownList={brandList}
          dropdownTitle={'Select Brand'}
          selectedValue={selectedBrandName}
        />

        {/* MY DEALS */}
        <Text style={styles.textStyle}>Deal History</Text>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={dealsList}
          keyExtractor={keyExtractor}
          renderItem={({item, index}) => (
            <ProductCard
              enableModal={true}
              item={item}
              key={index}
              isStatus={item?.status}
              editable
              onEditProduct={() => {
                navigate('EditPost', {deal: item, brandList});
              }}
            />
          )}
          numColumns={2}
          ListEmptyComponent={
            <Text style={styles.empty}>{`No data found.`}</Text>
          }
          contentContainerStyle={styles.flatcontainer}
          columnWrapperStyle={Css.jcsb}
          scrollEnabled={false}
        />
      </GeneralTemplate>
      {loading && (
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderBackdrop} />
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.Aztec_Gold} />
          </View>
        </View>
      )}
    </>
  );
};

export default PostDeal;
const styles = StyleSheet.create({
  flatcontainer: {
    width: '100%',
    alignSelf: 'center',
  },
  empty: {
    fontSize: moderateScale(16),
    color: 'grey',
    alignSelf: 'center',
    marginTop: verticalScale(100),
  },
  textStyle: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(17),
    marginTop: moderateScale(20),
  },
  infoText: {
    flex: 1,
    paddingLeft: moderateScale(5),
    fontSize: moderateScale(12),
    color: Colors.pale_sky,
    fontFamily: Fonts.PoppinsRegular,
  },
  title: {
    color: Colors.Aztec_Gold,
    fontFamily: Fonts.PoppinsSemiBold,
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
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loaderBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    position: 'absolute',
    zIndex: 98,
  },

  loaderContainer: {
    backgroundColor: 'white',
    padding: moderateScale(20),
    borderRadius: moderateScale(10),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 99,
  },

  loaderText: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: Colors.Aztec_Gold,
  },
});

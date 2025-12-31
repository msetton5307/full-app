import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import {Colors, Fonts, Icons} from '../../../themes';
import Css from '../../../themes/Css';
import {moderateScale} from '../../../utils/orientation';
import {showMessage} from '@app/utils/helper/Toast';
import {useFocusEffect} from '@react-navigation/native';
import {useAppDispatch} from '@app/redux';
import {
  createPriceTracker,
  deletePriceTracker,
  listPriceTrackers,
} from '@app/utils/service/PriceTrackerService';
import {PRICE_TRACKER, PRICE_TRACKER_PAYLOAD} from '@app/types';
import ImageBox from '../../../components/ImageBox';

const PriceTrackers = () => {
  const dispatch = useAppDispatch();
  const [keyword, setKeyword] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [trackers, setTrackers] = useState<PRICE_TRACKER[]>([]);

  const disableCreate = useMemo(
    () => keyword.trim().length === 0 && category.trim().length === 0,
    [keyword, category],
  );

  const fetchTrackers = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await dispatch(listPriceTrackers());
      if (result?.success) {
        setTrackers(result?.data || []);
      } else {
        showMessage(result?.message || 'Unable to load price trackers');
      }
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchTrackers();
  }, [fetchTrackers]);

  useFocusEffect(
    useCallback(() => {
      fetchTrackers();
    }, [fetchTrackers]),
  );

  const handleCreate = async () => {
    const payload: PRICE_TRACKER_PAYLOAD = {
      keyword: keyword.trim(),
      category: category.trim() || undefined,
    };

    const result = await dispatch(createPriceTracker(payload));
    if (result?.success) {
      setKeyword('');
      setCategory('');
      fetchTrackers();
      showMessage('Tracker saved successfully');
    } else {
      showMessage(result?.message || 'Unable to save tracker');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await dispatch(deletePriceTracker(id));
    if (result?.success) {
      fetchTrackers();
      showMessage('Tracker removed');
    } else {
      showMessage(result?.message || 'Unable to remove tracker');
    }
  };

  const renderTracker = ({item}: {item: PRICE_TRACKER}) => {
    return (
      <View style={styles.cardContainer}>
        <View style={[Css.f1, Css.g6]}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.keyword}
          </Text>
          {item.category ? (
            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {item.category}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          activeOpacity={0.8}
          onPress={() => handleDelete(item._id)}>
          <ImageBox
            resizeMode="contain"
            source={Icons.remove}
            imageStyle={styles.removeIcon}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <GeneralTemplate
      enableBack={false}
      isSearch={false}
      fixedComponent={<Text style={styles.headerText}>Price Trackers</Text>}>
      <View style={styles.container}>
        <Text style={styles.helperText}>
          Add keywords or categories to get notified when matching products are
          posted.
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            value={keyword}
            placeholder="Keyword (e.g. laptop, shoes)"
            placeholderTextColor={Colors.gray_1}
            onChangeText={setKeyword}
            style={styles.input}
          />
          <TextInput
            value={category}
            placeholder="Category (optional)"
            placeholderTextColor={Colors.gray_1}
            onChangeText={setCategory}
            style={styles.input}
          />
          <TouchableOpacity
            disabled={disableCreate || isLoading}
            onPress={handleCreate}
            activeOpacity={0.8}
            style={[styles.addButton, disableCreate ? styles.addButtonDisabled : {}]}>
            <Text style={styles.addButtonText}>Add Tracker</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={trackers}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={renderTracker}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>
              {isLoading
                ? 'Loading your trackers...'
                : 'No trackers yet. Add a keyword to get alerts.'}
            </Text>
          )}
        />
      </View>
    </GeneralTemplate>
  );
};

export default PriceTrackers;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: moderateScale(10),
    gap: moderateScale(14),
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
    fontSize: moderateScale(12),
  },
  inputRow: {
    gap: moderateScale(10),
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: Colors.gray_2,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(10),
    color: Colors.black,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: moderateScale(13),
  },
  addButton: {
    backgroundColor: Colors.Aztec_Gold,
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(12),
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: Colors.gray_2,
  },
  addButtonText: {
    color: Colors.white,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(13),
  },
  listContent: {
    gap: moderateScale(10),
    paddingBottom: moderateScale(40),
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(12),
    borderWidth: 1,
    borderColor: Colors.gray_2,
    gap: moderateScale(10),
  },
  cardTitle: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(14),
  },
  cardSubtitle: {
    color: Colors.Old_Silver,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: moderateScale(12),
  },
  removeButton: {
    height: moderateScale(32),
    width: moderateScale(32),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.Soft_Peach,
  },
  removeIcon: {
    height: moderateScale(14),
    width: moderateScale(14),
    tintColor: Colors.Amaranth_Red,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.Old_Silver,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: moderateScale(12),
    marginTop: moderateScale(20),
  },
});

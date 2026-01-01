import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import GeneralTemplate from '../../../components/Template/GeneralTemplate';
import TextInput from '../../../components/TextInput';
import {CustomButtonOutline, CustomButtonSolid} from '../../../components/CustomButton';
import {Colors, Fonts} from '../../../themes';
import {moderateScale, verticalScale} from '../../../utils/orientation';
import {useAppDispatch} from '@app/redux';
import {getMergedJsonDeals} from '@app/utils/service/UserService';

interface CollectionType {
  id: string;
  name: string;
  deals: any[];
}

const Collections = () => {
  const dispatch = useAppDispatch();

  const [collectionName, setCollectionName] = useState('');
  const [collections, setCollections] = useState<CollectionType[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [selectedDeals, setSelectedDeals] = useState<Record<string, any>>({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);

  const getDealId = useCallback((deal: any) => {
    return (
      deal?._id ||
      deal?.deal_id ||
      deal?.id ||
      deal?.dealId ||
      deal?.dealID ||
      deal?.Url ||
      deal?.Name ||
      `${Math.random()}`
    );
  }, []);

  const getDealTitle = useCallback((deal: any) => {
    return deal?.deal_title || deal?.Name || deal?.title || 'Deal';
  }, []);

  const loadDeals = useCallback(
    async (_page: number) => {
      if (_page === 1) {
        setHasMoreData(true);
      }

      if (isLoading && _page > 1) {
        return;
      }

      setIsLoading(true);
      try {
        const result = await dispatch(
          getMergedJsonDeals({
            page: _page,
            pageSize: 50,
          }),
        );

        if (result.success) {
          if (_page === 1) {
            setDeals(result.data ?? []);
          } else if (Array.isArray(result.data) && result.data.length > 0) {
            setDeals(prev => [...prev, ...result.data]);
          }

          if (!result.data || result.data.length < 50) {
            setHasMoreData(false);
          }
        } else if (_page === 1) {
          setDeals([]);
          setHasMoreData(false);
        }
      } catch (error) {
        console.log('Error while loading deals for collections:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, isLoading],
  );

  useEffect(() => {
    loadDeals(1);
  }, [loadDeals]);

  const toggleSelection = useCallback(
    (deal: any) => {
      const dealId = String(getDealId(deal));
      setSelectedDeals(prev => {
        const updated = {...prev};
        if (updated[dealId]) {
          delete updated[dealId];
        } else {
          updated[dealId] = deal;
        }
        return updated;
      });
    },
    [getDealId],
  );

  const selectedDealsList = useMemo(
    () => Object.values(selectedDeals),
    [selectedDeals],
  );

  const filteredDeals = useMemo(() => {
    if (!search.trim()) {
      return deals;
    }

    const query = search.trim().toLowerCase();
    return deals.filter(deal =>
      getDealTitle(deal).toLowerCase().includes(query),
    );
  }, [deals, getDealTitle, search]);

  const resetSelection = useCallback(() => {
    setSelectedDeals({});
  }, []);

  const handleCreateCollection = useCallback(() => {
    if (!collectionName.trim() || selectedDealsList.length === 0) {
      return;
    }

    const newCollection: CollectionType = {
      id: `${Date.now()}`,
      name: collectionName.trim(),
      deals: selectedDealsList,
    };

    setCollections(prev => [newCollection, ...prev]);
    setCollectionName('');
    resetSelection();
  }, [collectionName, resetSelection, selectedDealsList]);

  const handleAddToCollection = useCallback(
    (collectionId: string) => {
      if (selectedDealsList.length === 0) {
        return;
      }

      setCollections(prevCollections =>
        prevCollections.map(collection => {
          if (collection.id !== collectionId) {
            return collection;
          }

          const existingIds = new Set(
            collection.deals.map(deal => String(getDealId(deal))),
          );
          const updatedDeals = [
            ...collection.deals,
            ...selectedDealsList.filter(
              deal => !existingIds.has(String(getDealId(deal))),
            ),
          ];

          return {
            ...collection,
            deals: updatedDeals,
          };
        }),
      );

      resetSelection();
    },
    [getDealId, resetSelection, selectedDealsList],
  );

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMoreData) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadDeals(nextPage);
    }
  }, [hasMoreData, isLoading, loadDeals, page]);

  const renderDealItem = useCallback(
    ({item}: {item: any}) => {
      const dealId = String(getDealId(item));
      const isSelected = !!selectedDeals[dealId];
      const dealPrice = item?.deal_price || item?.Price2 || item?.price || '';

      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => toggleSelection(item)}
          style={[style.dealRow, isSelected && style.dealRowSelected]}>
          <View style={{flex: 1}}>
            <Text style={style.dealTitle}>{getDealTitle(item)}</Text>
            {dealPrice ? <Text style={style.dealPrice}>{dealPrice}</Text> : null}
          </View>
          <View style={[style.checkbox, isSelected && style.checkboxSelected]}>
            {isSelected ? <Text style={style.checkboxMark}>✓</Text> : null}
          </View>
        </TouchableOpacity>
      );
    },
    [getDealId, getDealTitle, selectedDeals, toggleSelection],
  );

  const renderCollectionCard = useCallback(
    ({item}: {item: CollectionType}) => {
      return (
        <View style={style.collectionCard}>
          <View style={style.collectionHeader}>
            <Text style={style.collectionTitle}>{item.name}</Text>
            <Text style={style.collectionCount}>
              {item.deals.length} deal{item.deals.length === 1 ? '' : 's'}
            </Text>
          </View>
          <View style={style.collectionChips}>
            {item.deals.map(deal => (
              <View style={style.chip} key={`${item.id}_${String(getDealId(deal))}`}>
                <Text numberOfLines={1} style={style.chipText}>
                  {getDealTitle(deal)}
                </Text>
              </View>
            ))}
          </View>
          <CustomButtonOutline
            label="Add selected deals"
            onPress={() => handleAddToCollection(item.id)}
            disabled={selectedDealsList.length === 0}
            containerStyle={style.addButton}
          />
        </View>
      );
    },
    [getDealId, getDealTitle, handleAddToCollection, selectedDealsList.length],
  );

  return (
    <GeneralTemplate
      searchValue={search}
      setSearchValue={(value: string) => setSearch(value)}
      isLoading={isLoading}
      scrollEnd={handleLoadMore}
      title="Collections">
      <View style={style.pageHeader}>
        <Text style={style.heading}>Collections</Text>
        <Text style={style.subHeading}>
          Group your favourite deals into themes like vacations, holidays, or
          events so you can find them faster later.
        </Text>
      </View>

      <TextInput
        title="Collection name"
        placeholder="e.g. Vacation"
        value={collectionName}
        onChangeText={text => setCollectionName(text)}
        mainContainerStyle={{marginTop: moderateScale(10)}}
      />

      <View style={style.selectionSummary}>
        <Text style={style.selectionTitle}>
          Selected deals ({selectedDealsList.length})
        </Text>
        <View style={style.collectionChips}>
          {selectedDealsList.length === 0 ? (
            <Text style={style.emptyText}>Pick deals to fill this collection.</Text>
          ) : (
            selectedDealsList.map(deal => (
              <View style={style.chip} key={`selected_${getDealId(deal)}`}>
                <Text numberOfLines={1} style={style.chipText}>
                  {getDealTitle(deal)}
                </Text>
              </View>
            ))
          )}
        </View>
        <CustomButtonSolid
          label="Create collection"
          onPress={handleCreateCollection}
          disabled={!collectionName.trim() || selectedDealsList.length === 0}
        />
      </View>

      <Text style={style.sectionTitle}>Pick deals for this collection</Text>
      <FlatList
        data={filteredDeals}
        keyExtractor={(item, index) => `${getDealId(item)}_${index}`}
        renderItem={renderDealItem}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={style.separator} />}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={style.emptyText}>No deals found for this search.</Text>
          ) : null
        }
      />

      <Text style={[style.sectionTitle, {marginTop: moderateScale(30)}]}>Your collections</Text>
      {collections.length === 0 ? (
        <Text style={style.emptyText}>
          Create a collection to keep related deals together.
        </Text>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={item => item.id}
          renderItem={renderCollectionCard}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={style.separator} />}
        />
      )}
    </GeneralTemplate>
  );
};

export default Collections;

const style = StyleSheet.create({
  pageHeader: {
    marginTop: moderateScale(10),
    gap: moderateScale(8),
  },
  heading: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(18),
  },
  subHeading: {
    color: Colors.black_olive,
    fontFamily: Fonts.PoppinsRegular,
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },
  sectionTitle: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(16),
    marginTop: moderateScale(20),
    marginBottom: moderateScale(8),
  },
  selectionSummary: {
    marginTop: moderateScale(10),
    paddingVertical: moderateScale(10),
    gap: moderateScale(10),
  },
  selectionTitle: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(15),
  },
  dealRow: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    padding: moderateScale(14),
    borderWidth: moderateScale(1),
    borderColor: Colors.Almond,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dealRowSelected: {
    borderColor: Colors.Aztec_Gold,
    backgroundColor: Colors.Cornsilk,
  },
  dealTitle: {
    color: Colors.black_olive,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(14),
  },
  dealPrice: {
    color: Colors.Aztec_Gold,
    fontFamily: Fonts.PoppinsSemiBold,
    marginTop: moderateScale(6),
  },
  checkbox: {
    height: moderateScale(22),
    width: moderateScale(22),
    borderRadius: moderateScale(6),
    borderWidth: moderateScale(1),
    borderColor: Colors.Almond,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.Aztec_Gold,
    borderColor: Colors.Aztec_Gold,
  },
  checkboxMark: {
    color: Colors.white,
    fontFamily: Fonts.PoppinsBold,
  },
  separator: {
    height: verticalScale(10),
  },
  emptyText: {
    color: Colors.gray_1,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(13),
  },
  collectionCard: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    padding: moderateScale(14),
    borderWidth: moderateScale(1),
    borderColor: Colors.Almond,
    gap: moderateScale(10),
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collectionTitle: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsSemiBold,
    fontSize: moderateScale(15),
  },
  collectionCount: {
    color: Colors.black_olive,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(13),
  },
  collectionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(8),
  },
  chip: {
    backgroundColor: Colors.Cornsilk,
    borderRadius: moderateScale(20),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
  },
  chipText: {
    color: Colors.black,
    fontFamily: Fonts.PoppinsMedium,
    fontSize: moderateScale(12),
    maxWidth: moderateScale(220),
  },
  addButton: {
    width: '100%',
  },
});

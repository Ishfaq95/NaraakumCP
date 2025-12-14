import React, { memo, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { bookingService } from '../../../services/api/bookingService';
import { MediaBaseURL } from '../../../shared/utils/constants';
import { SvgUri } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { addCardItem, setSelectedUniqueId, setCategory as setCategoryRedux, setServices } from '../../../shared/redux/reducers/bookingReducer';
import { generateUniqueId } from '../../../shared/services/service';
import CustomBottomSheet from '../../../components/common/CustomBottomSheet';
import LocationService from '../components/LocationService';

type OfferedServiceCategory = {
  Id: string;
  TitlePlang?: string;
  TitleSlang?: string;
  ImagePath?: string;
  FullImagePath?: string | null;
  Price?: number | string;
};

type Specialty = {
  Id: string;
  TitlePlang?: string;
  TitleSlang?: string;
  ImagePath?: string;
};

const Step1 = ({ handleNext, Patient }: { handleNext: () => void, Patient: any }) => {
  const [isLocationBottomSheetVisible, setIsLocationBottomSheetVisible] = useState(false);
  const [offeredServicesCategories, setOfferedServicesCategories] = useState<
    OfferedServiceCategory[]
  >([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string | null>(
    null,
  );
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [serviceQuantities, setServiceQuantities] = useState<
    Record<string, number>
  >({});
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [offeredServices, setOfferedServices] = useState<any>(null);
  const [offeredServicesData, setOfferedServicesData] = useState<any>(null);
  const existingCardItems = useSelector((state: any) => state.root.booking.cardItems);
  const services = useSelector((state: any) => state.root.booking.services);
  // const SelectedCardItem = existingCardItems.length > 0 ? existingCardItems.filter((item: any) => item.ItemUniqueId === category.Id) : [];
  const dispatch = useDispatch();

  useEffect(() => {
    getOfferedServicesCategories();
  }, []);

  useEffect(() => {
    if (category) {
      if (category.Id == '42' || category.Id == '32') {
        fetchServicesAndSpecialtiesData();
      } else {
        fetchOfferedServicesData();
      }
    }
  }, [category]);

  const fetchServicesAndSpecialtiesData = async () => {
    try {
      setLoading(true);
      const offered = await bookingService.getOfferedServicesListByCategory({
        abc: category?.Id,
        Search: '',
      });
      const specs = await bookingService.getAllSpecialties();
      setOfferedServices(offered);
      // Merge CatLevelId==3 object at the start of specialties
      let merged = Array.isArray(specs?.list) ? [...specs.list] : [];
      const general = offered?.OfferedServices?.find(
        (item: any) => item.CatLevelId === 3,
      );
      if (general) {
        merged = [general, ...merged];
      }
      dispatch(setServices(offered.OfferedServices));
      setSpecialties(merged);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchOfferedServicesData = async () => {
    try {
      setLoading(true);
      const offered = await bookingService.getOfferedServicesListByCategory({
        abc: category?.Id,
        Search: '',
      });
      setOfferedServicesData(offered?.OfferedServices);
      // dispatch(setServices(offered?.OfferedServices));
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (offeredServicesCategories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(offeredServicesCategories[0].Id);
      setCategory(offeredServicesCategories[0]);
    }
  }, [offeredServicesCategories, selectedCategoryId]);

  const getOfferedServicesCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await bookingService.getOfferedServicesCategories();
      setOfferedServicesCategories(response?.OfferedCategories || []);
    } catch (error) {
    } finally {
      setLoadingCategories(false);
    }
  };

  const selectedCategory = useMemo(
    () =>
      offeredServicesCategories.find(
        category => category.Id === selectedCategoryId,
      ),
    [offeredServicesCategories, selectedCategoryId],
  );

  const cartItemCount =
    category && (category.Id == '42' || category.Id == '32')
      ? selectedSpecialtyId
        ? 1
        : 0
      : Object.values(serviceQuantities).reduce((sum, qty) => sum + qty, 0);

  const formatImageUrl = (path?: string | null) => {
    return `${MediaBaseURL}${path}`;
  };

  const renderCategoryCard = ({ item }: { item: OfferedServiceCategory }) => {
    const isActive = item.Id === selectedCategoryId;

    return (
      <TouchableOpacity
        style={[styles.categoryCard, isActive && styles.categoryCardActive]}
        onPress={() => {
          setSelectedCategoryId(item.Id);
          setCategory(item);
        }}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.categoryImageWrapper,
            isActive && styles.categoryImageWrapperActive,
          ]}
        >
          {item.ImagePath ? (
            <Image
              source={{ uri: item.ImagePath }}
              style={styles.categoryImage}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="person-circle-outline" size={28} color="#00A79D" />
          )}
        </View>
        <View style={styles.categoryTextWrapper}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.categoryLabel}>Category</Text>
            <View
              style={[styles.categoryBadge, isActive && styles.categoryBadgeActive]}
            >
              <Text
                style={[
                  styles.categoryBadgeText,
                  isActive && styles.categoryBadgeTextActive,
                ]}
              >
                {item.Price ?? 0}
              </Text>
            </View>
          </View>
          <Text
            numberOfLines={2}
            style={[
              styles.categoryTitle,
              isActive && styles.categoryTitleActive,
            ]}
          >
            {item.TitlePlang}
          </Text>
        </View>

      </TouchableOpacity>
    );
  };

  const onPressSpecialty = (specialty: any) => {
    const isItemExists = existingCardItems.find((item: any) => item.CatCategoryId === category.Id);
    if (isItemExists) {
      const updatedCardArray = [...existingCardItems];

      // Find the index of the item that matches the selectedUniqueId
      const selectedIndex = updatedCardArray.findIndex(item => item.CatCategoryId === category.Id);
      const selectedItem = updatedCardArray[selectedIndex];

      if (specialty.CatLevelId == 3) {
        updatedCardArray[selectedIndex] = {
          ...specialty,
          "ItemUniqueId": selectedItem.ItemUniqueId,
          "CatCategoryId": selectedItem.CatCategoryId,
          "CatServiceId": specialty.Id,
          "CatCategoryTypeId": selectedItem.CatCategoryTypeId,
          "Quantity": 1,
          // "OrderID": selectedItem.OrderID,
          // "OrderDetailId": selectedItem.OrderDetailId,
        }
        // dispatch(setServices(null));

        dispatch(addCardItem(updatedCardArray));
      } else {
        updatedCardArray[selectedIndex] = {
          ...specialty,
          "ItemUniqueId": selectedItem.ItemUniqueId,
          "CatCategoryId": selectedItem.CatCategoryId,
          "CatSpecialtyId": specialty.Id,
          "CatCategoryTypeId": selectedItem.CatCategoryTypeId,
          "Quantity": 1,
          // "OrderID": selectedItem.OrderID,
          // "OrderDetailId": selectedItem.OrderDetailId,
        }
        const servicesArray = services.filter((item: any) => item.CatLevelId != 3);
        dispatch(setServices(servicesArray));
        dispatch(addCardItem(updatedCardArray));
      }
    } else {
      if (specialty.CatLevelId == 3) {
        const cardItem = {
          ...specialty,
          "ItemUniqueId": generateUniqueId(),
          "CatCategoryId": category.Id,
          "CatServiceId": specialty.Id,
          "CatCategoryTypeId": category.CatCategoryTypeId,
          "Quantity": 1,
        }
        const tempCardItems = [...existingCardItems, cardItem];
        // dispatch(setServices(null));
        dispatch(addCardItem(tempCardItems));
      } else {
        const cardItem = {
          ...specialty,
          "ItemUniqueId": generateUniqueId(),
          "CatCategoryId": category.Id,
          "CatSpecialtyId": specialty.Id,
          "CatCategoryTypeId": category.CatCategoryTypeId,
          "Quantity": 1,
        }
        const tempCardItems = [...existingCardItems, cardItem];
        const servicesArray = services.filter((item: any) => item.CatLevelId != 3);
        dispatch(setServices(servicesArray));
        dispatch(addCardItem(tempCardItems));
      }
    }
  };

  const onPressService = (service: any) => {
    const cardItem = {
      "ItemUniqueId": generateUniqueId(),
      "CatCategoryId": category.Id,
      "CatServiceId": service.Id,
      "CatCategoryTypeId": category.CatCategoryTypeId,
      "ServiceTitleSlang": service.TitleSlang,
      "Quantity": 1,
    }
    const tempCardItems = [...existingCardItems, cardItem];
    dispatch(addCardItem(tempCardItems));
  }

  const getSanitizedImageUrl = (path: any) => {
    if (!path) return '';
    // Remove any double slashes after the protocol
    return `${MediaBaseURL}${path}`.replace(/([^:]\/)/g, '$1');
  };

  const renderSpecialtyItem = ({ item }: { item: Specialty }) => {
    const selectedCardItem = existingCardItems.length > 0 ? existingCardItems.find((item: any) => item.CatCategoryId === category.Id) : null;
    const isSelected = selectedCardItem?.CatSpecialtyId === item.Id || selectedCardItem?.CatServiceId === item.Id;

    const uri = getSanitizedImageUrl(item.ImagePath);
    const isSvg = uri.endsWith('.svg');

    return (
      <TouchableOpacity
        style={[styles.specialtyCard, isSelected && styles.specialtyCardActive]}
        onPress={() => onPressSpecialty(item)}
        activeOpacity={0.85}
      >
        <View style={styles.specialtyLeftContent}>
          <View
            style={[
              styles.specialtyIconWrapper,
              isSelected && styles.specialtyIconWrapperActive,
            ]}
          >
            {item.ImagePath ? (
              isSvg ? (
                <SvgUri width="80%" height="80%" uri={uri} />
              ) : (
                <Image
                  source={{ uri }}
                  style={styles.image}
                  resizeMode="contain"
                />
              )
            ) : null}
          </View>
          <Text
            style={[
              styles.specialtyTitle,
              isSelected && styles.specialtyTitleActive,
            ]}
          >
            {item.TitlePlang}
          </Text>
        </View>
        {isSelected && (
          <View style={styles.specialtyCheckmark}>
            <Ionicons name="checkmark" size={16} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const handleIncreaseQuantity = (item: any) => {
    const isItemExists = existingCardItems.length > 0 ? existingCardItems.find((existingItem: any) => existingItem.CatServiceId == item.Id) : null;
    if (!isItemExists) return; // Item doesn't exist, can't increase

    const selectedIndex = existingCardItems.findIndex((existingItem: any) => existingItem.CatServiceId == item.Id);
    if (selectedIndex === -1) return; // Item not found, can't update

    const updatedCardArray = existingCardItems.map((cardItem: any, index: number) => {
      if (index === selectedIndex) {
        // Create a new object with updated quantity
        return {
          ...cardItem,
          Quantity: (parseInt(cardItem.Quantity) || 0) + 1
        };
      }
      return cardItem;
    });

    dispatch(addCardItem(updatedCardArray));
  };

  const handleDecreaseQuantity = (item: any) => {
    const isItemExists = existingCardItems.length > 0 ? existingCardItems.find((existingItem: any) => existingItem.CatServiceId == item.Id) : null;
    if (!isItemExists || (parseInt(isItemExists.Quantity) || 0) <= 1) return; // Can't decrease below 1

    const selectedIndex = existingCardItems.findIndex((existingItem: any) => existingItem.CatServiceId == item.Id);
    if (selectedIndex === -1) return; // Item not found, can't update

    const updatedCardArray = existingCardItems.map((cardItem: any, index: number) => {
      if (index === selectedIndex) {
        // Create a new object with updated quantity
        return {
          ...cardItem,
          Quantity: (parseInt(cardItem.Quantity) || 1) - 1
        };
      }
      return cardItem;
    });

    dispatch(addCardItem(updatedCardArray));
  };

  const handleDelete = (item: any) => {
    const updatedCardArray = existingCardItems.filter((cardItem: any) => cardItem.CatServiceId != item.Id);
    dispatch(addCardItem(updatedCardArray));
  };


  const renderOfferedServiceItem = ({ item }: { item: any }) => {
    const isItemExists = existingCardItems.length > 0 ? existingCardItems.find((existingItem: any) => existingItem.CatServiceId == item.Id) : false;
    const isSelected = isItemExists ? true : false;
    const quantity = isItemExists ? isItemExists.Quantity : 1;

    return (
      <View
        style={[styles.serviceCard, isSelected && styles.serviceCardActive]}
      >
        {/* Title */}
        <Text style={styles.serviceTitle} numberOfLines={2}>
          {item.TitlePlang || item.TitleSlang || 'Service'}
        </Text>

        {isSelected ? (
          /* Selected State: Quantity Controls and Delete */
          <View style={styles.serviceSelectedContent}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleIncreaseQuantity(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  styles.quantityButtonMinus,
                  quantity === 1 && styles.quantityButtonDisabled,
                ]}
                onPress={() => handleDecreaseQuantity(item)}
                disabled={quantity === 1}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        ) : (
          /* Unselected State: Select Button */
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => onPressService(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.selectButtonText}>Select</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const onNextPress = () => {
    const selectedItem = existingCardItems[existingCardItems.length - 1];
    if (selectedItem.CatCategoryId != '42') {
      setIsLocationBottomSheetVisible(true);

    } else {

      onPressContinue();
      
    }
  };

  const onPressContinue = () => {
    setIsLocationBottomSheetVisible(false);
    const selectedItem = existingCardItems[existingCardItems.length - 1];
    const selectedCategory = offeredServicesCategories.find((category: any) => category.Id == selectedItem.CatCategoryId);
      dispatch(setCategoryRedux(selectedCategory));
      if (selectedItem.CatCategoryId == '42' || selectedItem.CatCategoryId == '32') {
        if (selectedItem.CatServiceId) {
          dispatch(setServices(null))
        }
      } else {
        dispatch(setServices(null))
      }

      const selectedUniqueId = existingCardItems[existingCardItems.length - 1].ItemUniqueId
      dispatch(setSelectedUniqueId(selectedUniqueId))
      handleNext();
  }

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.categoryHeaderRow}>
        <Text style={styles.categoryHeaderTitle}>Category</Text>
        <View style={styles.categoryHeaderLine} />
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <FlatList
          horizontal
          data={offeredServicesCategories}
          keyExtractor={item => item.Id}
          renderItem={renderCategoryCard}
          showsHorizontalScrollIndicator={true}
          indicatorStyle="black"
          contentContainerStyle={styles.categoriesList}
          ListEmptyComponent={() =>
            !loadingCategories ? (
              <Text style={styles.emptyLabel}>No categories available</Text>
            ) : null
          }
        />
      </View>

      <View style={styles.specialtyHeader}>
        <Text style={styles.specialtyHeaderTitle}>
          {selectedCategory?.TitlePlang || 'Specialties'}
        </Text>
        <View style={styles.specialtyHeaderLine} />
      </View>
    </View>
  );

  const renderBottomBar = () => (
    <View style={styles.bottomBar}>
      <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85}>
        <Text
          style={styles.secondaryButtonText}
        >{`Cart (${existingCardItems.length})`}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onNextPress} disabled={existingCardItems.length === 0} style={styles.primaryButton} activeOpacity={0.85}>
        <Text style={[styles.primaryButtonText, existingCardItems.length === 0 && styles.primaryButtonTextDisabled]}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const isLoading = loadingCategories || loadingSpecialties;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {renderListHeader()}
        {isLoading ? (
          <View style={styles.loaderWrapper}>
            <ActivityIndicator size="large" color="#00A79D" />
          </View>
        ) : (
          <>
            {category && (category.Id == '42' || category.Id == '32') ? (
              <FlatList
                data={specialties}
                keyExtractor={item => item.Id}
                renderItem={renderSpecialtyItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={() => (
                  <Text style={styles.emptyLabel}>
                    No specialties available for this category
                  </Text>
                )}
              />
            ) : (
              <FlatList
                data={offeredServicesData}
                keyExtractor={item => item.Id}
                renderItem={renderOfferedServiceItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            )}
          </>
        )}
      </View>
      {renderBottomBar()}


      <CustomBottomSheet
        visible={isLocationBottomSheetVisible}
        onClose={() => setIsLocationBottomSheetVisible(false)}
        maxHeight="90%"
        backdropClickable={true}
        showHandle={false}
      >
       <LocationService onPressLocation={() => onPressContinue()} />
      </CustomBottomSheet>
    </SafeAreaView>
  );
};

export default memo(Step1);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E6F4F3',
  },
  container: {
    flex: 1,
    backgroundColor: '#E6F4F3',
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  listHeader: {
    marginBottom: 12,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  categoryHeaderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D7A80',
  },
  categoryHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#BFDAD6',
    marginLeft: 8,
  },
  categoriesList: {
    paddingBottom: 8,
  },
  categoryCard: {
    backgroundColor: '#F4FBFA',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#D2E7E4',
    width: 220,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryCardActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#00A79D',
    shadowColor: '#00A79D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryImageWrapper: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#E0F1EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryImageWrapperActive: {
    backgroundColor: '#D1F1EF',
  },
  categoryImage: {
    width: 38,
    height: 38,
  },
  categoryTextWrapper: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#6D7A80',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D7A80',
  },
  categoryTitleActive: {
    color: '#00A79D',
  },
  categoryBadge: {
    width: 30,
    height: 30,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#A1CACA',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4FBFA',
  },
  categoryBadgeActive: {
    backgroundColor: '#00A79D',
    borderColor: '#00A79D',
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6D7A80',
  },
  categoryBadgeTextActive: {
    color: '#fff',
  },
  specialtyHeader: {
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  specialtyHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0E3C47',
    marginBottom: 6,
  },
  specialtyHeaderLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#E0EAEA',
    position: 'relative',
  },
  specialtyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ECF2F1',
    marginBottom: 12,
  },
  specialtyCardActive: {
    borderColor: '#00A79D',
    shadowColor: '#00A79D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  specialtyLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  specialtyIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F0F7F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  specialtyIconWrapperActive: {
    backgroundColor: '#E0F5F2',
  },
  specialtyIcon: {
    width: 28,
    height: 28,
  },
  specialtyTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#384B56',
  },
  specialtyTitleActive: {
    color: '#00A79D',
    fontWeight: '600',
  },
  specialtyCheckmark: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#00A79D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyLabel: {
    textAlign: 'center',
    color: '#90A5A4',
    marginTop: 24,
    fontSize: 14,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButton: {
    flex: 1,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CFE4E2',
    backgroundColor: '#EAF6F4',
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#00A79D',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#00A79D',
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: 50,
    height: 50,
  },
  // Service Card Styles
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceCardActive: {
    shadowColor: '#00A79D',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0E3C47',
    marginBottom: 12,
    lineHeight: 22,
  },
  serviceSelectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00A79D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonMinus: {
    // backgroundColor: '#D1D5DB',
  },
  quantityButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0E3C47',
    minWidth: 24,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 4,
  },
  selectButton: {
    borderWidth: 1.5,
    borderColor: '#00A79D',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 4,
  },
  selectButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00A79D',
  },
  primaryButtonTextDisabled: {
    color: '#fff',
    opacity: 0.5,
  },
});

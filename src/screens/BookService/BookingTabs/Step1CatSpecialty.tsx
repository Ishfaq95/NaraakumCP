import React, { useEffect, useMemo, useState } from 'react';
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
import { useDispatch } from 'react-redux';
import { setServices } from '../../../shared/redux/reducers/bookingReducer';

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

const Step1 = () => {
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
      console.error('Error fetching booking data:', error);
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
      console.error('Error fetching booking data:', error);
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
      console.log('error', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  console.log('Offered Services Categories', offeredServicesCategories);

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
          <Text style={styles.categoryLabel}>Category</Text>
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
      </TouchableOpacity>
    );
  };

  const getSanitizedImageUrl = (path: any) => {
    if (!path) return '';
    // Remove any double slashes after the protocol
    return `${MediaBaseURL}${path}`.replace(/([^:]\/)/g, '$1');
  };

  const renderSpecialtyItem = ({ item }: { item: Specialty }) => {
    const isSelected = item.Id === selectedSpecialtyId;

    const uri = getSanitizedImageUrl(item.ImagePath);
    const isSvg = uri.endsWith('.svg');

    return (
      <TouchableOpacity
        style={[styles.specialtyCard, isSelected && styles.specialtyCardActive]}
        onPress={() => setSelectedSpecialtyId(item.Id)}
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

  const renderOfferedServiceItem = ({ item }: { item: any }) => {
    const isSelected = selectedServiceIds.includes(item.Id);
    const quantity = serviceQuantities[item.Id] || 1;

    const handleSelect = () => {
      if (!isSelected) {
        setSelectedServiceIds(prev => [...prev, item.Id]);
        setServiceQuantities(prev => ({ ...prev, [item.Id]: 1 }));
      }
    };

    const handleIncreaseQuantity = () => {
      setServiceQuantities(prev => ({
        ...prev,
        [item.Id]: (prev[item.Id] || 1) + 1,
      }));
    };

    const handleDecreaseQuantity = () => {
      if (quantity > 1) {
        setServiceQuantities(prev => ({
          ...prev,
          [item.Id]: prev[item.Id] - 1,
        }));
      }
    };

    const handleDelete = () => {
      setSelectedServiceIds(prev => prev.filter(id => id !== item.Id));
      setServiceQuantities(prev => {
        const updated = { ...prev };
        delete updated[item.Id];
        return updated;
      });
    };

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
                onPress={handleIncreaseQuantity}
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
                onPress={handleDecreaseQuantity}
                disabled={quantity === 1}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        ) : (
          /* Unselected State: Select Button */
          <TouchableOpacity
            style={styles.selectButton}
            onPress={handleSelect}
            activeOpacity={0.8}
          >
            <Text style={styles.selectButtonText}>Select</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.categoryHeaderRow}>
        <Text style={styles.categoryHeaderTitle}>Category</Text>
        <View style={styles.categoryHeaderLine} />
      </View>
      <FlatList
        horizontal
        data={offeredServicesCategories}
        keyExtractor={item => item.Id}
        renderItem={renderCategoryCard}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
        ListEmptyComponent={() =>
          !loadingCategories ? (
            <Text style={styles.emptyLabel}>No categories available</Text>
          ) : null
        }
      />

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
        >{`Cart (${cartItemCount})`}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85}>
        <Text style={styles.primaryButtonText}>Next</Text>
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
    </SafeAreaView>
  );
};

export default Step1;

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
    paddingBottom: 140,
  },
  listHeader: {
    marginBottom: 12,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
    width: 180,
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
    fontSize: 15,
    fontWeight: '600',
    color: '#6D7A80',
  },
  categoryTitleActive: {
    color: '#00A79D',
  },
  categoryBadge: {
    width: 34,
    height: 34,
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
    backgroundColor: '#D1D5DB',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
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
});

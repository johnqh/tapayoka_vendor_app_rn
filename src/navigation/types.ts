import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type LocationsStackParamList = {
  LocationsList: undefined;
  LocationServices: { locationId: string; locationName: string };
  ServiceDetail: {
    serviceId: string;
    serviceName: string;
    parentType: 'location' | 'category';
    parentId: string;
  };
};

export type CategoriesStackParamList = {
  CategoriesList: undefined;
  CategoryServices: { categoryId: string; categoryName: string };
  ServiceDetail: {
    serviceId: string;
    serviceName: string;
    parentType: 'location' | 'category';
    parentId: string;
  };
};

export type LocationsStackScreenProps<T extends keyof LocationsStackParamList> =
  NativeStackScreenProps<LocationsStackParamList, T>;

export type CategoriesStackScreenProps<T extends keyof CategoriesStackParamList> =
  NativeStackScreenProps<CategoriesStackParamList, T>;

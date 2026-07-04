import React, { useCallback, useContext, useLayoutEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert, Button as RNButton } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductFormScreen from '../screens/ProductFormScreen';
import RegisterSaleScreen from '../screens/RegisterSaleScreen';
import SalesHistoryScreen from '../screens/SalesHistoryScreen';
import UserListScreen from '../screens/UserListScreen';
import UserFormScreen from '../screens/UserFormScreen';

import AuthContext from '../context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AdminTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Products" component={ProductListScreen} />
    <Tab.Screen name="Sales" component={SalesHistoryScreen} />
    <Tab.Screen name="Users" component={UserListScreen} />
  </Tab.Navigator>
);

const WorkerTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Products" component={ProductListScreen} />
  </Tab.Navigator>
);

const MainApp = ({ navigation }: { navigation: any }) => {
  const auth = useContext(AuthContext);

  const handleLogout = useCallback(async () => {
    Alert.alert('Cerrar sesión', '¿Deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await auth.logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  }, [auth, navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <RNButton title="Cerrar sesión" onPress={handleLogout} />,
    });
  }, [navigation, handleLogout]);

  return auth.user?.role === 'admin' ? <AdminTabs /> : <WorkerTabs />;
};

const AppNavigator = () => {
  const auth = useContext(AuthContext);

  if (auth.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {auth.user ? (
        <>
          <Stack.Screen name="Main" component={MainApp} />
          <Stack.Screen name="ProductForm" component={ProductFormScreen} />
          <Stack.Screen name="RegisterSale" component={RegisterSaleScreen} />
          <Stack.Screen name="UserForm" component={UserFormScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;

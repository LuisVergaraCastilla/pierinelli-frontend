import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Product } from '../types';
import Input from '../components/Input';
import Button from '../components/Button';
import { registerSale } from '../api/sales';
import { notifyLowStock } from '../utils/notifications';

type RegisterSaleScreenProps = {
  navigation: any;
  route: { params: { product: Product } };
};

const RegisterSaleScreen = ({ route, navigation }: RegisterSaleScreenProps) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegisterSale = async () => {
    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      Alert.alert('Error', 'Por favor, ingrese una cantidad válida.');
      return;
    }

    if (numQuantity > product.stock) {
      Alert.alert('Error', `La cantidad no puede ser mayor al stock disponible (${product.stock}).`);
      return;
    }

    setLoading(true);
    try {
      const response = await registerSale(product.id, numQuantity);
      Alert.alert('Éxito', 'Venta registrada con éxito.');
      if (response.low_stock) {
        notifyLowStock(product.name);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar la venta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.stock}>Stock disponible: {product.stock}</Text>
      <Input
        placeholder="Cantidad"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />
      <Button
        title={loading ? 'Registrando...' : 'Registrar Venta'}
        onPress={handleRegisterSale}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  stock: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: 'gray',
  },
});

export default RegisterSaleScreen;

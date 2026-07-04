import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Input from '../components/Input';
import Button from '../components/Button';
import { Product } from '../types';
import { requestCameraAccess } from '../utils/permissions';
import { createProduct, updateProduct } from '../api/products';

type ProductFormScreenProps = {
  navigation: any;
  route: { params?: { product?: Partial<Product> } };
};

const ProductFormScreen = ({ navigation, route }: ProductFormScreenProps) => {
  const [product, setProduct] = useState<Partial<Product>>(route.params?.product || {});
  const [image, setImage] = useState<string | null>(route.params?.product?.image || null);
  const [loading, setLoading] = useState(false);

  const isEditing = !!route.params?.product;

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Editar Producto' : 'Crear Producto' });
  }, [isEditing, navigation]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraAccess();
    if (!hasPermission) {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isEditing) {
        await updateProduct(product.id!, product, image);
      } else {
        await createProduct(product, image);
      }
      Alert.alert('Éxito', `Producto ${isEditing ? 'actualizado' : 'creado'} con éxito.`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el producto.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Product, value: string) => {
    const numericFields = ['height', 'width', 'price', 'stock'];
    const parsedValue = numericFields.includes(field) ? parseFloat(value) : value;
    setProduct(prev => ({ ...prev, [field]: parsedValue }));
  };

  return (
    <ScrollView style={styles.container}>
      <Input placeholder="Nombre" value={product.name} onChangeText={text => handleInputChange('name', text)} />
      <Input placeholder="Descripción" value={product.description} onChangeText={text => handleInputChange('description', text)} />
      <Input placeholder="Alto" value={product.height?.toString()} onChangeText={text => handleInputChange('height', text)} keyboardType="numeric" />
      <Input placeholder="Ancho" value={product.width?.toString()} onChangeText={text => handleInputChange('width', text)} keyboardType="numeric" />
      <Input placeholder="Precio" value={product.price?.toString()} onChangeText={text => handleInputChange('price', text)} keyboardType="numeric" />
      <Input placeholder="Stock" value={product.stock?.toString()} onChangeText={text => handleInputChange('stock', text)} keyboardType="numeric" />
      
      <View style={styles.imageButtons}>
        <Button title="Seleccionar Imagen" onPress={handlePickImage} />
        <Button title="Tomar Foto" onPress={handleTakePhoto} />
      </View>
      {image && <Image source={{ uri: image }} style={styles.image} />}

      <Button title={loading ? 'Guardando...' : 'Guardar'} onPress={handleSubmit} disabled={loading} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginVertical: 10,
    alignSelf: 'center',
  },
});

export default ProductFormScreen;


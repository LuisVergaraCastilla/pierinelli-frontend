import React, { useEffect, useState, useContext } from 'react';
import { View, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { getProducts, deleteProduct } from '../api/products';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import AuthContext from '../context/AuthContext';
import Button from '../components/Button';

type ProductListScreenProps = {
  navigation: any;
};

const ProductListScreen = ({ navigation }: ProductListScreenProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useContext(AuthContext);

  const loadProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadProducts);
    return unsubscribe;
  }, [navigation, loadProducts]);

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" />;
  }

  const renderItem = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onEdit={() => navigation.navigate('ProductForm', { product: item })}
      onDelete={() => handleDelete(item.id)}
      onSell={() => navigation.navigate('RegisterSale', { product: item })}
      isAdmin={auth.user?.role === 'admin'}
    />
  );

  const handleDelete = (id: number) => {
    Alert.alert(
      "Eliminar producto",
      "¿Estás seguro de que quieres eliminar este producto?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: async () => {
            try {
              await deleteProduct(id);
              Alert.alert('Éxito', 'Producto eliminado con éxito.');
              loadProducts();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el producto.');
            }
          }, style: 'destructive' 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {auth.user?.role === 'admin' && (
        <Button title="Agregar Producto" onPress={() => navigation.navigate('ProductForm')} />
      )}
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={loadProducts}
        refreshing={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loader: {
    marginTop: 20,
  },
});

export default ProductListScreen;

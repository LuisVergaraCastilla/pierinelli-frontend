import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { getSales } from '../api/sales';
import { Sale } from '../types';

const SalesHistoryScreen = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSales = async () => {
      try {
        setLoading(true);
        const data = await getSales();
        setSales(data);
      } catch (error) {
        Alert.alert('Error', 'No se pudo cargar el historial de ventas.');
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, []);

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" />;
  }

  const renderItem = ({ item }: { item: Sale }) => (
    <View style={styles.saleCard}>
      <Text>Producto: {item.product.name}</Text>
      <Text>Cantidad: {item.quantity}</Text>
      <Text>Precio Total: S/ {Number(item.total_price).toFixed(2)}</Text>
      <Text>Vendedor: {item.worker.first_name} {item.worker.last_name}</Text>
      <Text>Fecha: {new Date(item.sold_at).toLocaleString()}</Text>
    </View>
  );

  return (
    <FlatList
      data={sales}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      style={styles.container}
    />
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
  saleCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default SalesHistoryScreen;

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Product } from '../types';
import Button from './Button';

interface ProductCardProps {
  product: Product;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSell: () => void;
}

const ProductCard = ({ product, isAdmin, onEdit, onDelete, onSell }: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  const imageUri = product.image && !imageError ? product.image : null;

  return (
    <View style={styles.card}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          onError={(e) => {
            console.log('[product-card] image load error', product.id, product.image, e.nativeEvent?.error);
            setImageError(true);
          }}
        />
      ) : (
        <View style={[styles.image, styles.imageFallback]}>
          <Text style={styles.imageFallbackText}>Sin imagen</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>
        <Text>Precio: S/ {Number(product.price).toFixed(2)}</Text>
        <Text>Stock: {product.stock}</Text>
      </View>
      <View style={styles.actions}>
        {isAdmin ? (
          <>
            <Button title="Editar" onPress={onEdit} />
            <Button title="Eliminar" onPress={onDelete} />
          </>
        ) : (
          <Button title="Vender" onPress={onSell} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  imageFallback: {
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageFallbackText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  actions: {
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
});

export default ProductCard;

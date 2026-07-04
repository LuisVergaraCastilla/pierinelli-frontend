import { Alert } from 'react-native';

export async function notifyLowStock(productName: string): Promise<void> {
  Alert.alert('Stock bajo', `Quedan pocas unidades de ${productName}`);
}

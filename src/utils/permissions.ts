import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export async function requestCameraAccess(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status === 'granted') {
    return true;
  }

  if (status === 'denied') {
    Alert.alert(
      'Permiso denegado',
      'Se necesita acceso a la cámara para tomar fotos de los productos.',
      [{ text: 'OK' }]
    );
  }

  if (status === 'undetermined') {
     Alert.alert(
      'Permiso denegado',
      'Se necesita acceso a la cámara para tomar fotos de los productos.',
      [{ text: 'OK' }]
    );
  }

  const { status: newStatus } = await ImagePicker.requestCameraPermissionsAsync();
  if (newStatus === 'granted') {
    return true;
  }
  
  if (newStatus === 'denied') {
    Alert.alert(
      'Permiso denegado permanentemente',
      'Ha denegado permanentemente el acceso a la cámara. Por favor, habilítelo en la configuración de su dispositivo.',
      [
        { text: 'No, gracias', style: 'cancel' },
        { text: 'Abrir configuración', onPress: () => Linking.openSettings() }
      ]
    );
  }

  return false;
}

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Input from '../components/Input';
import Button from '../components/Button';
import { User, UserRole } from '../types';
import { createUser, updateUser } from '../api/users';

type UserFormScreenProps = {
  navigation: any;
  route: { params?: { user?: User } };
};

const UserFormScreen = ({ navigation, route }: UserFormScreenProps) => {
  const [user, setUser] = useState<Partial<User>>(route.params?.user || {});
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditing = !!route.params?.user;

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Editar Usuario' : 'Crear Usuario' });
  }, [isEditing, navigation]);

  const handleSubmit = async () => {
    if (!user.first_name || !user.last_name || !user.email || !user.role) {
      Alert.alert('Error', 'Por favor, complete todos los campos.');
      return;
    }
    if (!isEditing && !password) {
      Alert.alert('Error', 'Por favor, ingrese una contraseña.');
      return;
    }

    setLoading(true);
    try {
      const userData = isEditing
        ? (() => {
            const payload: Partial<User> & { password?: string } = { ...user };
            if (password) {
              payload.password = password;
            }
            return payload;
          })()
        : {
            ...user,
            ...(password ? { password } : {}),
          };

      if (isEditing) {
        await updateUser(user.id!, userData);
      } else {
        await createUser(userData);
      }
      Alert.alert('Éxito', `Usuario ${isEditing ? 'actualizado' : 'creado'} con éxito.`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof User, value: string | UserRole) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };

  const PickerAny = Picker as unknown as React.ComponentType<any>;

  return (
    <ScrollView style={styles.container}>
      <Input placeholder="Nombres" value={user.first_name} onChangeText={text => handleInputChange('first_name', text)} />
      <Input placeholder="Apellidos" value={user.last_name} onChangeText={text => handleInputChange('last_name', text)} />
      <Input placeholder="Correo electrónico" value={user.email} onChangeText={text => handleInputChange('email', text)} keyboardType="email-address" autoCapitalize="none" />
      <Input placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
      {isEditing && <Text style={styles.passwordHint}>Deje en blanco para no cambiar la contraseña.</Text>}
      
      <Text>Rol:</Text>
      <PickerAny
        selectedValue={user.role}
        onValueChange={(itemValue: string) => handleInputChange('role', itemValue as UserRole)}
      >
        <Picker.Item label="Trabajador" value="worker" />
        <Picker.Item label="Administrador" value="admin" />
      </PickerAny>

      <Button title={loading ? 'Guardando...' : 'Guardar'} onPress={handleSubmit} disabled={loading} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  passwordHint: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 10,
  }
});

export default UserFormScreen;

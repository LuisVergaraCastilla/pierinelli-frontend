import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { getUsers, deleteUser } from '../api/users';
import { User } from '../types';
import Button from '../components/Button';

type UserListScreenProps = {
  navigation: any;
};

const UserListScreen = ({ navigation }: UserListScreenProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadUsers);
    return unsubscribe;
  }, [navigation, loadUsers]);

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" />;
  }

  const handleDelete = (id: number) => {
    Alert.alert(
      "Eliminar usuario",
      "¿Estás seguro de que quieres eliminar este usuario?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: async () => {
            try {
              await deleteUser(id);
              Alert.alert('Éxito', 'Usuario eliminado con éxito.');
              loadUsers();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el usuario.');
            }
          }, style: 'destructive' 
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <Text style={styles.userName}>{item.first_name} {item.last_name}</Text>
      <Text>{item.email}</Text>
      <Text>Rol: {item.role}</Text>
      <View style={styles.actions}>
        <Button title="Editar" onPress={() => navigation.navigate('UserForm', { user: item })} />
        <Button title="Eliminar" onPress={() => handleDelete(item.id)} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button title="Agregar Usuario" onPress={() => navigation.navigate('UserForm')} />
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={loadUsers}
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
  userCard: {
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
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});

export default UserListScreen;

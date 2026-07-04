# Prompt para desarrollo de frontend — App Pierinelli (React Native + TypeScript)

## Contexto del proyecto

Necesito que desarrolles el **frontend móvil** de una aplicación para la empresa **Pierinelli**, dedicada a la venta de planchas. La app debe consumir un backend ya construido en **Django REST Framework**, cuyos endpoints se detallan más abajo.

**Prioridad: SIMPLICIDAD.** Este proyecto es con fines de estudio/evaluación académica, así que el código debe ser lo más **claro, ordenado y fácil de leer** posible. Evita patrones avanzados, librerías innecesarias o abstracciones complejas. Usa **TypeScript de forma básica** (tipos simples, interfaces claras), sin sobre-complicar con genéricos avanzados, utility types complejos ni configuraciones estrictas innecesarias. Prefiero código simple y repetitivo, a código "elegante" pero difícil de seguir para alguien que está aprendiendo.

**Stack requerido:**
- **React Native** con **Expo** (usar la plantilla oficial de TypeScript: `npx create-expo-app --template`)
- **TypeScript** (configuración por defecto de Expo, sin modo `strict` extremo)
- Navegación: **React Navigation** (stack + tabs, lo mínimo necesario)
- Manejo de estado: **Context API** de React (NO usar Redux, Zustand ni librerías externas de estado — es innecesario para este alcance)
- **Hooks de React**: usar explícitamente `useState` (estado local de formularios, listas, loading, errores) y `useEffect` (carga de datos al montar una pantalla, restaurar sesión, etc.) en todas las pantallas donde corresponda. No es necesario usar hooks avanzados (`useReducer`, `useMemo`, `useCallback`) salvo que sea realmente necesario — priorizar `useState` y `useEffect` por ser los más didácticos.
- Peticiones HTTP: `fetch` o `axios` (elegir uno solo y usarlo de forma consistente)
- **Almacenamiento local: `AsyncStorage`** (`@react-native-async-storage/async-storage`) para guardar, recuperar y usar datos relevantes de forma persistente entre sesiones (ver sección 4.1)

⚠️ **Idioma del código:** todo el código (nombres de componentes, variables, funciones, archivos, carpetas, tipos/interfaces) debe estar en **inglés**, siguiendo buenas prácticas. Los textos visibles en pantalla para el usuario final (labels, botones, mensajes) deben estar en **español**, ya que la app es para uso en Perú. Los comentarios en el código pueden estar en español.

---

## 1. Estructura de carpetas sugerida (simple, en inglés, con TypeScript)

```
src/
  api/
    client.ts            // configuración base de fetch/axios + interceptor de token
    auth.ts               // login
    products.ts           // CRUD de productos
    sales.ts               // registrar venta / listar ventas
    users.ts               // CRUD de usuarios
  context/
    AuthContext.tsx        // usuario logueado, token, rol
  screens/
    LoginScreen.tsx
    ProductListScreen.tsx
    ProductFormScreen.tsx      // crear/editar producto (admin)
    RegisterSaleScreen.tsx     // trabajador vende un producto
    SalesHistoryScreen.tsx     // admin ve historial de ventas
    UserListScreen.tsx         // admin gestiona usuarios
    UserFormScreen.tsx         // crear/editar usuario (admin)
  components/
    ProductCard.tsx
    Button.tsx
    Input.tsx
  navigation/
    AppNavigator.tsx       // stack principal + navegación condicional por rol
  types/
    index.ts               // interfaces básicas: User, Product, Sale
  utils/
    permissions.ts         // lógica de solicitud de permisos de cámara
    notifications.ts       // lógica de notificaciones locales
    storage.ts              // guardar/recuperar/limpiar datos en AsyncStorage
App.tsx
```

**Nota sobre el uso de TypeScript:** usar `.tsx` únicamente en archivos que contienen JSX (componentes y pantallas). Los archivos que solo tienen lógica (API, utilidades, tipos) van en `.ts`. Definir tipos simples y reutilizables en `src/types/index.ts`, por ejemplo:

```typescript
export type UserRole = "admin" | "worker";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  height: number;
  width: number;
  area: number;
  price: number;
  stock: number;
  image: string | null;
}

export interface Sale {
  id: number;
  product: Product;
  worker: User;
  quantity: number;
  unit_price: number;
  total_price: number;
  sold_at: string;
}
```

Estos tipos deben reutilizarse en toda la app (props de componentes, respuestas de la API, estado del contexto), evitando duplicar definiciones.

---

## 2. Backend disponible (referencia de endpoints, ya construidos)

Base URL configurable en `src/api/client.ts` (ej. `http://localhost:8000/api`).

```
POST   /auth/login/         → { email, password } → { access, refresh, user: { first_name, role } }

GET    /products/           → lista de productos (admin y worker)
POST   /products/           → crear producto (admin, multipart/form-data con imagen)
GET    /products/{id}/      → detalle
PUT    /products/{id}/      → editar (admin)
DELETE /products/{id}/      → eliminar (admin)

POST   /sales/              → { product, quantity } → registra venta (worker), retorna { ...sale, low_stock }
GET    /sales/              → historial de ventas (admin)

GET    /users/              → lista de usuarios (admin)
POST   /users/              → crear usuario (admin)
PUT    /users/{id}/         → editar (admin)
DELETE /users/{id}/         → eliminar (admin)
```

Todos los endpoints (excepto login) requieren el header `Authorization: Bearer {access_token}`.

---

## 3. Pantallas y flujo de la app

### LoginScreen
- Formulario simple: email + password.
- Al hacer login exitoso, guardar el token y el rol del usuario, y redirigir según rol:
  - `admin` → pantalla de productos con acceso a gestión completa.
  - `worker` → pantalla de productos con opción de vender.
- Mostrar mensaje de error claro si las credenciales son inválidas.

### ProductListScreen (ambos roles)
- Lista de productos con: nombre, precio, stock, imagen.
- Si el rol es `admin`: botones para editar/eliminar cada producto, y botón "Agregar producto".
- Si el rol es `worker`: botón "Vender" en cada producto (lleva a `RegisterSaleScreen`).

### ProductFormScreen (solo admin)
- Formulario para crear/editar producto: nombre, descripción, alto, ancho, precio, stock.
- Botón para **tomar foto con la cámara** o elegir de galería (usar `expo-image-picker`).
- Antes de abrir la cámara, solicitar el permiso correspondiente (ver sección 5).
- Al guardar, enviar los datos junto con la imagen al backend (`multipart/form-data`).

### RegisterSaleScreen (solo worker)
- Muestra el producto seleccionado y permite ingresar la cantidad a vender.
- Validar en el frontend que la cantidad no supere el stock disponible antes de enviar (validación adicional a la del backend).
- Al confirmar la venta, mostrar mensaje de éxito y, si la respuesta indica `low_stock: true`, disparar una **notificación local** (ver sección 6).

### SalesHistoryScreen (solo admin)
- Lista de ventas con: producto, cantidad, precio total, fecha/hora y trabajador que la realizó.

### UserListScreen / UserFormScreen (solo admin)
- CRUD simple de usuarios: nombre, apellido, correo, rol, contraseña.

---

## 4. Uso de Hooks y AsyncStorage

### 4.1 Hooks (`useState` y `useEffect`)

Usar estos hooks de forma explícita y didáctica en cada pantalla, por ejemplo:

- **`useState`** para:
  - Valores de formularios (email, password, nombre, precio, etc.).
  - Listas obtenidas de la API (`products`, `sales`, `users`).
  - Estados de UI: `loading`, `error`, `refreshing`.
- **`useEffect`** para:
  - Cargar datos de la API al montar una pantalla (ej. `ProductListScreen` pide la lista de productos al abrirse).
  - Restaurar la sesión del usuario al iniciar la app (leer el token guardado en `AsyncStorage` desde `AuthContext`).
  - Revalidar/recargar datos cuando cambia una dependencia relevante (ej. volver a pedir la lista de productos después de registrar una venta).

Ejemplo simple de referencia para `ProductListScreen.tsx`:

```typescript
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState<boolean>(true);

useEffect(() => {
  async function loadProducts() {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
      Alert.alert("Error", "No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  }
  loadProducts();
}, []);
```

### 4.2 AsyncStorage — datos a guardar, recuperar y usar

Usar `AsyncStorage` (a través de funciones simples en `src/utils/storage.ts`) para persistir los siguientes datos entre sesiones de la app:

- **`access_token`** y **`refresh_token`**: obtenidos al hacer login, usados en cada request a la API (header `Authorization`).
- **`user`**: datos básicos del usuario logueado (`first_name`, `role`), para no tener que volver a pedirlos al backend cada vez que se abre la app.
- **Sesión persistente:** al abrir la app (`App.tsx` / `AuthContext.tsx`), usar `useEffect` para leer estos datos guardados y, si existen, restaurar la sesión automáticamente sin pedir login de nuevo. Si no existen o el token es inválido, redirigir a `LoginScreen`.
- **Logout:** al cerrar sesión, limpiar todos los datos guardados en `AsyncStorage` con `removeItem` o `clear`.

Ejemplo simple de referencia para `src/utils/storage.ts`:

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";

export async function saveSession(accessToken: string, user: User): Promise<void> {
  await AsyncStorage.setItem("access_token", accessToken);
  await AsyncStorage.setItem("user", JSON.stringify(user));
}

export async function getSession(): Promise<{ token: string; user: User } | null> {
  const token = await AsyncStorage.getItem("access_token");
  const userJson = await AsyncStorage.getItem("user");
  if (!token || !userJson) return null;
  return { token, user: JSON.parse(userJson) as User };
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.multiRemove(["access_token", "refresh_token", "user"]);
}
```

Estas funciones deben ser usadas principalmente desde `AuthContext.tsx`, para mantener centralizada toda la lógica de sesión.

---

## 5. Manejo de permisos (cámara)

Implementar en `src/utils/permissions.ts` una función simple, tipada, que:

1. Solicite el permiso de cámara con `expo-image-picker` o `expo-camera` (`requestCameraPermissionsAsync`).
2. Maneje los 3 escenarios posibles:
   - **Concedido** → abrir la cámara normalmente.
   - **Denegado** → mostrar una alerta (`Alert.alert`) explicando que se necesita el permiso para agregar fotos de productos, con opción de reintentar.
   - **Denegado permanentemente** → mostrar alerta con botón que abra la configuración del dispositivo (`Linking.openSettings()`).

Ejemplo de firma simple para esta función:

```typescript
export async function requestCameraAccess(): Promise<boolean> {
  // retorna true si se puede usar la cámara, false si no
}
```

Este flujo debe estar centralizado en una sola función reutilizable, para que el código sea fácil de entender y de ubicar.

---

## 6. Notificaciones locales

Usar `expo-notifications` para implementar **una única notificación local**, simple y con relación directa al negocio:

- **Cuándo se dispara:** justo después de registrar una venta exitosa, si el backend responde `low_stock: true`.
- **Contenido:** título "Stock bajo" y cuerpo indicando el nombre del producto (ej. "Quedan pocas unidades de [nombre del producto]").
- Centralizar esta lógica en `src/utils/notifications.ts`, con una función simple y tipada:

```typescript
export async function notifyLowStock(productName: string): Promise<void> {
  // dispara la notificación local
}
```

- No es necesario configurar push notifications remotas (Firebase, etc.), solo notificaciones **locales** programadas desde el propio dispositivo.

---

## 7. Validaciones y manejo de errores (buenas prácticas básicas)

- **Validaciones de formularios:**
  - Campos obligatorios no vacíos antes de enviar (login, crear producto, crear usuario, registrar venta).
  - Cantidad a vender debe ser mayor a 0 y no superar el stock mostrado en pantalla.
- **Manejo de errores en llamadas a la API:**
  - Envolver cada llamada en `try/catch`.
  - Tipar las respuestas de error de forma simple (ej. `interface ApiError { message: string }`).
  - Mostrar mensajes de error claros al usuario mediante `Alert.alert` o un componente simple de mensaje (no dejar errores silenciosos ni pantallas en blanco).
  - Manejar estados de carga (`loading: boolean`) en las pantallas que consultan datos, mostrando un `ActivityIndicator` simple mientras se espera la respuesta.
- **Registro elemental de eventos:**
  - Usar `console.log` / `console.error` en puntos clave (login exitoso, error de login, venta registrada, error de conexión con la API) para que sea fácil rastrear el flujo durante pruebas y demostraciones.

---

## 8. Consideraciones adicionales

- Mantener el diseño visual **simple**: componentes básicos de React Native (`View`, `Text`, `TextInput`, `TouchableOpacity`, `FlatList`), sin librerías de UI complejas. Un poco de `StyleSheet` básico es suficiente, no se requiere un diseño sofisticado.
- No usar `strict: true` en `tsconfig.json` si eso complica demasiado el desarrollo; la configuración por defecto que trae Expo con TypeScript es suficiente.
- No implementar recuperación de contraseña ni registro público (los usuarios los crea el admin).
- Incluir un archivo `.env` o `config.ts` simple donde se defina la URL base del backend, para que sea fácil de cambiar entre ambiente local y de pruebas.
- Incluir un `README.md` breve (puede estar en español) con instrucciones para instalar dependencias (`npm install`) y levantar el proyecto (`npx expo start`).

---

## Resumen de la Historia de Usuario a implementar (frontend)

Como **administrador**, quiero iniciar sesión, gestionar usuarios y productos (incluyendo tomar fotos con la cámara), y ver el historial de ventas, para controlar el inventario y el desempeño del negocio desde el celular.

Como **trabajador**, quiero iniciar sesión, ver el catálogo de productos y registrar ventas, para atender clientes desde la app, recibiendo una notificación si el producto vendido queda con stock bajo.

El código debe estar en inglés y usar TypeScript de forma básica (tipos simples en `src/types`), la interfaz visible al usuario en español, y la app debe manejar correctamente los permisos de cámara, mostrar notificaciones locales relevantes, y controlar errores de forma clara en cada pantalla — priorizando siempre la simplicidad y legibilidad del código por sobre patrones avanzados o tipado excesivamente estricto.

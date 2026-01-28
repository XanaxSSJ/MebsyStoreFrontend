
---

# 🎨 Frontend E-commerce – Guía FINAL

**React + Bun + TailwindCSS (JS, producción real)**

---

## 0️⃣ Principios base (esto guía todo)

- SPA (consume API Spring Boot)
    
- Backend = fuente de verdad
    
- Frontend = UI + UX + orquestación
    
- **NO lógica de negocio crítica**
    
- **NO JWT en localStorage**
    
- Seguridad desde el diseño
    

---

## 1️⃣ Stack FINAL confirmado

### Core

- **React 18**
    
- **Bun**
    
- **Vite**
    
- **JavaScript (ES2022+)**
    
- **TailwindCSS**
    

### Routing & State

- **React Router v6**
    
- **Zustand** (estado global mínimo)
    
- **TanStack Query** (server state)
    

### Networking & Utils

- **Axios**
    
- **Zod** (validaciones de formularios)
    
- **Mercado Pago JS SDK**
    

---

## 2️⃣ Arquitectura frontend (la correcta)

### 🧠 Modelo mental

```
UI → Hooks → API → Backend
```

- UI no conoce axios
    
- UI no conoce endpoints
    
- UI no maneja auth directamente
    

---

## 3️⃣ Estructura de carpetas FINAL

```
src/
├── app/
├── features/
├── components/
├── services/
├── store/
├── hooks/
├── lib/
├── styles/
├── assets/
└── main.jsx
```

---

## 4️⃣ APP – configuración global

```
app/
├── router.jsx
├── providers.jsx
├── queryClient.js
├── authGuard.jsx
└── env.js
```

### Responsabilidades

- Routing
    
- Providers globales
    
- Protección de rutas
    
- Variables de entorno
    

---

## 5️⃣ FEATURES (núcleo del frontend)

📌 **Feature-based real**  
Cada módulo es independiente.

```
features/
├── auth/
│   ├── api.js
│   ├── hooks.js
│   ├── store.js
│   └── pages/
│       ├── LoginPage.jsx
│       └── RegisterPage.jsx
│
├── products/
│   ├── api.js
│   ├── hooks.js
│   ├── components/
│   └── pages/
│
├── cart/
│   ├── store.js
│   ├── components/
│   └── hooks.js
│
├── checkout/
│   ├── api.js
│   ├── hooks.js
│   ├── mercadopago.js
│   └── pages/
│
└── orders/
    ├── api.js
    ├── hooks.js
    └── pages/
```

✔️ Escalable  
✔️ Mantenible  
✔️ No se rompe al crecer

---

## 6️⃣ COMPONENTES REUTILIZABLES

```
components/
├── ui/
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Modal.jsx
│   └── Loader.jsx
│
├── layout/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── ProtectedLayout.jsx
│
└── feedback/
    ├── Toast.jsx
    └── ErrorBoundary.jsx
```

📌 **UI no tiene lógica de negocio**

---

## 7️⃣ SERVICES – comunicación con backend

```
services/
├── api.js
├── auth.interceptor.js
└── error.interceptor.js
```

### api.js

```js
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});
```

✔️ Cookies HttpOnly  
✔️ JWT invisible para JS  
✔️ Centralizado

---

## 8️⃣ STATE MANAGEMENT (bien hecho)

### 🔹 Zustand (estado real del cliente)

```
store/
├── auth.store.js
└── cart.store.js
```

- Usuario autenticado (flag)
    
- Datos UI
    
- Carrito (temporal)
    

❌ No órdenes  
❌ No pagos  
❌ No stock

---

### 🔹 TanStack Query (estado del servidor)

- Productos
    
- Órdenes
    
- Perfil
    
- Dashboard admin
    

✔️ Cache  
✔️ Reintentos  
✔️ Revalidación automática

---

## 9️⃣ SEGURIDAD EN FRONTEND (REAL)

### Lo que SÍ haces

- Cookies HttpOnly
    
- `credentials: "include"`
    
- Rutas protegidas
    
- Validación con Zod
    
- Escape de inputs
    
- CSP desde servidor
    

### Lo que NO haces

❌ Guardar JWT  
❌ Calcular totales  
❌ Validar stock  
❌ Confiar en roles del frontend

---

## 🔐 Auth Guard

```jsx
if (!isAuthenticated) {
  return <Navigate to="/login" />;
}
```

---

## 💳 10️⃣ Mercado Pago – Flujo correcto

```
features/checkout/mercadopago.js
```

### Flujo REAL

1. Frontend → POST `/orders`
    
2. Backend crea orden
    
3. Backend crea preferencia MP
    
4. Backend devuelve `init_point`
    
5. Frontend redirige
    

❌ No SDK con credenciales  
❌ No pagos directos  
❌ No montos desde frontend

---

## 🛒 11️⃣ Carrito de compras

- Vive SOLO en frontend
    
- Zustand
    
- Se borra al:
    
    - Logout
        
    - Orden creada
        

👉 **El carrito NO es negocio**

---

## 📦 12️⃣ Órdenes (frontend)

### Usuario

- Ver mis órdenes
    
- Ver estado
    
- Ver detalle
    

### Admin

- Ver pedidos PAGADOS
    
- Cambiar estado
    
- Dashboard de ventas
    

---

## 🎨 13️⃣ Tailwind – reglas sanas

- Nada inline
    
- `@layer components`
    
- Design tokens
    
- Clases reutilizables
    

---

## 🌍 14️⃣ Environments

```
.env.development
.env.production
```

```env
VITE_API_URL=https://api.mebsystore.com
```

---

## 🧪 15️⃣ Testing (mínimo viable)

- Login
    
- Checkout
    
- Órdenes
    

Herramientas:

- Vitest
    
- Testing Library
    

---

## 🚀 16️⃣ Build & Deploy

- Bun build
    
- Code splitting
    
- Lazy loading
    
- CDN (Vercel / Netlify)
    
- HTTPS obligatorio
    

---

## 🧾 CHECKLIST FINAL FRONTEND

✅ JavaScript moderno  
✅ Arquitectura feature-based  
✅ Cookies HttpOnly  
✅ Sin JWT en JS  
✅ Checkout aislado  
✅ Backend como verdad  
✅ Listo para producción

---

## 🏁 Conclusión

Lo que tienes ahora es:


---

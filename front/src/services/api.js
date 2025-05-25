import axios from 'axios';
import API_ENDPOINTS from '../config/api';

// Crear instancia de axios con configuración base
const api = axios.create({
    baseURL: API_ENDPOINTS.BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true,
    timeout: 30000 // Incrementado de 15000 a 30000 ms (30 segundos)
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    console.error('Error en la configuración de la petición:', error);
    return Promise.reject(error);
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
    (response) => {
        console.log(`Respuesta exitosa de ${response.config.url}:`, response.status);
        return response;
    },
    (error) => {
        if (error.response) {
            const { status, data } = error.response;
            const url = error.config.url;
            
            console.error(`Error ${status} en petición a ${url}: ${data?.message || 'Error del servidor'}`);
            console.error('Datos completos del error:', data);
            
            // Errores de autenticación
            if (status === 401) {
                console.error('Sesión expirada o no autenticado.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Solo redirigir si no estamos ya en la página de login
                if (!window.location.pathname.includes('/login')) {
                    console.log('Redirigiendo a login por error 401...');
                    window.location.href = '/login';
                }
            } 
            // Errores de autorización
            else if (status === 403) {
                console.error('Error 403: Acceso prohibido.');
                
                // Verificamos si el usuario está autenticado
                const token = localStorage.getItem('token');
                if (!token) {
                    localStorage.removeItem('user');
                    
                    // Solo redirigir si no estamos ya en la página de login
                    if (!window.location.pathname.includes('/login')) {
                        console.log('Redirigiendo a login por error 403...');
                        window.location.href = '/login';
                    }
                }
            }
            // Error de recurso no encontrado
            else if (status === 404) {
                console.error(`Recurso no encontrado: ${data?.message || 'El recurso solicitado no existe'}`);
            }
            // Errores de validación o problemas en el servidor
            else if (status === 400 || status === 500) {
                console.error(`Error ${status}: ${data?.message || 'Error en la solicitud o en el servidor'}`);
                console.error('Detalles:', data);
            }
        } else if (error.request) {
            // Error de red - No se recibió respuesta del servidor
            console.error('No se recibió respuesta del servidor:', error.request);
            console.error('Mensaje de error:', error.message);
            console.error('URL de la solicitud:', error.config?.url);
            console.error('Método HTTP:', error.config?.method);
            
            // Verificar si el error es por timeout
            if (error.code === 'ECONNABORTED') {
                console.error('La conexión con el servidor ha expirado. Verifica que el backend esté funcionando.');
            } else {
                console.error('No se pudo conectar con el servidor. Verifica que el backend esté funcionando en http://localhost:8080');
                
                // Si es un error de red y tenemos una URL de fallback, intentamos reconectar
                // Solo lo hacemos si el error es de tipo ERR_NETWORK y si estamos intentando usar el puerto 8080
                // const fallbackUrl = error.config.url.replace('localhost:8080', 'localhost:8081'); // Comentado o eliminado la lógica de reintento a 8081
                // error.config.url = fallbackUrl;
                
                // Mostrar mensaje al usuario
                // console.log(`Reintentando petición a: ${fallbackUrl}`);
                
                // Reintentar la petición con la URL de fallback
                // return axios(error.config);
            }
        } else {
            console.error('Error al preparar la solicitud:', error.message);
            console.error('Configuración de la solicitud:', error.config);
        }
        
        return Promise.reject(error);
    }
);

// Exportar API por defecto para que pueda ser importado por otros servicios
export default api;

// Función para verificar autenticación
export const checkAuth = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user;
};

// Función para obtener el usuario actual
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

// Servicios de autenticación
export const authService = {
    login: async (credentials) => {
        try {
            console.log('Enviando solicitud de login:', credentials);
            const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
            
            // Guardamos el token y la información del usuario
            if (response?.data?.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: response.data.id,
                    nombre: response.data.nombre,
                    correo: response.data.correo,
                    rol: response.data.rol
                }));
            }
            
            return response;
        } catch (error) {
            console.error('Error de autenticación:', error);
            
            // Añadimos un mensaje de error personalizado
            error.userMessage = 'Error durante el login. Por favor, intente nuevamente.';
            
            throw error;
        }
    },
    register: async (userData) => {
        try {
            console.log('Enviando solicitud de registro:', userData);
            const response = await api.post(API_ENDPOINTS.REGISTER, userData);
            
            // Guardamos el token y la información del usuario
            if (response?.data?.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: response.data.id,
                    nombre: response.data.nombre,
                    correo: response.data.correo,
                    rol: response.data.rol
                }));
            }
            
            return response;
        } catch (error) {
            console.error('Error de registro:', error);
            
            // Añadimos un mensaje de error personalizado
            error.userMessage = 'Error durante el registro. Por favor, intente nuevamente.';
            
            throw error;
        }
    }
};

// Función para cerrar sesión
export const logout = async () => {
    try {
        // Si tu backend tiene un endpoint de logout, podrías llamarlo aquí
        // await api.post(API_ENDPOINTS.LOGOUT);
        
        // Limpiar datos de sesión localmente
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return true;
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        throw error;
    }
};

// Servicios de usuario
export const usuarioService = {
    login: (credentials) => authService.login(credentials),
    register: (userData) => authService.register(userData),
    getProfile: () => api.get(API_ENDPOINTS.USER_PROFILE),
    updateProfile: (userData) => api.put(API_ENDPOINTS.USER_PROFILE, userData),
    getAll: () => api.get(API_ENDPOINTS.USER_BASE),
    delete: (id) => api.delete(`${API_ENDPOINTS.USER_BASE}/${id}`)
};

// Servicios de perfumes
export const perfumeService = {
    getAll: () => api.get(API_ENDPOINTS.PERFUMES),
    getById: (id) => api.get(`${API_ENDPOINTS.PERFUMES}/${id}`),
    getByCategoria: (categoriaId) => api.get(`${API_ENDPOINTS.PERFUMES}/categoria/${categoriaId}`),
    buscarPorNombre: (nombre) => api.get(`${API_ENDPOINTS.PERFUMES}/buscar`, { params: { nombre } }),
    create: (perfumeData) => api.post(API_ENDPOINTS.PERFUMES, perfumeData),
    update: (id, perfumeData) => {
        console.log("Enviando actualización de perfume:", perfumeData);
        // Solo enviar IDs de categorías y notas olfativas para evitar errores de entidades transitivas
        const simplifiedData = {
            ...perfumeData,
            // Asegurarse de que solo enviamos los IDs
            categorias: perfumeData.categorias?.map(cat => ({ id: typeof cat === 'object' ? cat.id : cat })),
            notasOlfativas: perfumeData.notasOlfativas?.map(nota => ({ id: typeof nota === 'object' ? nota.id : nota }))
        };
        return api.put(`${API_ENDPOINTS.PERFUMES}/${id}/safe-update`, simplifiedData);
    },
    delete: (id) => api.delete(`${API_ENDPOINTS.PERFUMES}/${id}`)
};

// Servicios de carrito
export const carritoService = {
    getCarrito: async (params) => {
        try {
            console.log('Solicitando carrito con parámetros:', params);
            const response = await api.get(API_ENDPOINTS.CARRITO, { params });
            
            // Asegurar respuesta correcta
            if (!response.data) {
                console.warn('La respuesta del carrito no contiene datos, devolviendo un objeto vacío');
                return { data: { detalles: [] } };
            }
            
            // Asegurar que detalles siempre sea un array
            if (!response.data.detalles) {
                console.warn('La respuesta del carrito no contiene detalles, inicializando como array vacío');
                response.data.detalles = [];
            }
            
            console.log('Carrito obtenido correctamente:', response.data);
            return response;
        } catch (error) {
            console.error('Error al obtener carrito:', error);
            // En caso de error, devolvemos un objeto con array de detalles vacío
            return { data: { detalles: [] } };
        }
    },
    
    addItem: async (itemData) => {
        try {
            console.log('Añadiendo item al carrito:', itemData);
            const response = await api.post(`${API_ENDPOINTS.CARRITO}/items`, itemData);
            return response;
        } catch (error) {
            console.error('Error al añadir item al carrito:', error);
            throw error;
        }
    },
    
    updateCantidad: async (itemId, cantidad) => {
        try {
            const response = await api.put(`${API_ENDPOINTS.CARRITO}/items/${itemId}`, { cantidad });
            return response;
        } catch (error) {
            console.error(`Error al actualizar cantidad del item ${itemId}:`, error);
            throw error;
        }
    },
    
    removeItem: async (detalleId, config) => {
        try {
            console.log(`Eliminando item ${detalleId} del carrito con config:`, config);
            const response = await api.delete(`${API_ENDPOINTS.CARRITO}/items/${detalleId}`, config);
            return response;
        } catch (error) {
            console.error(`Error al eliminar item ${detalleId} del carrito:`, error);
            throw error;
        }
    },
    
    checkout: async (checkoutData) => {
        try {
            console.log('Procesando checkout con datos:', checkoutData);
            const response = await api.post(`${API_ENDPOINTS.CARRITO}/checkout`, checkoutData);
            return response;
        } catch (error) {
            console.error('Error al procesar checkout:', error);
            throw error;
        }
    }
};

// Servicios de categorías
export const categoriaService = {
    getAll: async () => {
        try {
            console.log('Solicitando todas las categorías');
            const response = await api.get(API_ENDPOINTS.CATEGORIAS);
            
            // Asegurar que siempre devolvemos un array
            if (!response.data) {
                console.warn('La respuesta de categorías no contiene datos, devolviendo un array vacío');
                return { data: [] };
            }
            
            if (!Array.isArray(response.data)) {
                console.warn('La respuesta de categorías no es un array, transformando a array:', response.data);
                // Si no es un array pero existe, lo envolvemos en un array
                return { data: [response.data] };
            }
            
            console.log('Categorías obtenidas:', response.data.length);
            return response;
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            // En caso de error, devolvemos un array vacío para no romper el UI
            return { data: [] };
        }
    },
    getById: async (id) => {
        try {
            const response = await api.get(`${API_ENDPOINTS.CATEGORIAS}/${id}`);
            return response;
        } catch (error) {
            console.error(`Error al obtener categoría con ID ${id}:`, error);
            throw error;
        }
    },
    create: async (data) => {
        try {
            const response = await api.post(API_ENDPOINTS.CATEGORIAS, data);
            return response;
        } catch (error) {
            console.error('Error al crear categoría:', error);
            throw error;
        }
    },
    update: async (id, data) => {
        try {
            const response = await api.put(`${API_ENDPOINTS.CATEGORIAS}/${id}`, data);
            return response;
        } catch (error) {
            console.error(`Error al actualizar categoría con ID ${id}:`, error);
            throw error;
        }
    },
    delete: async (id) => {
        try {
            const response = await api.delete(`${API_ENDPOINTS.CATEGORIAS}/${id}`);
            return response;
        } catch (error) {
            console.error(`Error al eliminar categoría con ID ${id}:`, error);
            throw error;
        }
    }
};

// Servicios de notas olfativas con manejo especial de errores
export const notaOlfativaService = {
    getAll: async () => {
        try {
            const response = await api.get(API_ENDPOINTS.NOTAS_OLFATIVAS);
            // Asegurar que siempre devolvemos un array
            if (!response.data) {
                console.warn('La respuesta de notas olfativas no contiene datos, devolviendo un array vacío');
                return { data: [] };
            }
            
            if (!Array.isArray(response.data)) {
                console.warn('La respuesta de notas olfativas no es un array, transformando a array:', response.data);
                // Si no es un array pero existe, lo envolvemos en un array
                return { data: [response.data] };
            }
            
            return response;
        } catch (error) {
            console.error('Error al obtener notas olfativas:', error);
            // En caso de error, devolvemos un array vacío para no romper el UI
            return { data: [] };
        }
    },
    getById: async (id) => {
        try {
            const response = await api.get(`${API_ENDPOINTS.NOTAS_OLFATIVAS}/${id}`);
            return response;
        } catch (error) {
            console.error(`Error al obtener nota olfativa con ID ${id}:`, error);
            throw error;
        }
    },
    create: async (data) => {
        try {
            const response = await api.post(API_ENDPOINTS.NOTAS_OLFATIVAS, data);
            return response;
        } catch (error) {
            console.error('Error al crear nota olfativa:', error);
            throw error;
        }
    },
    update: async (id, data) => {
        try {
            const response = await api.put(`${API_ENDPOINTS.NOTAS_OLFATIVAS}/${id}`, data);
            return response;
        } catch (error) {
            console.error(`Error al actualizar nota olfativa con ID ${id}:`, error);
            throw error;
        }
    },
    remove: async (id) => {
        try {
            const response = await api.delete(`${API_ENDPOINTS.NOTAS_OLFATIVAS}/${id}`);
            return response;
        } catch (error) {
            console.error(`Error al eliminar nota olfativa con ID ${id}:`, error);
            throw error;
        }
    }
};

// Servicios de facturas
export const facturaService = {
    getAll: async () => {
        try {
            const response = await api.get(API_ENDPOINTS.FACTURAS);
            return response;
        } catch (error) {
            console.error('Error al obtener facturas:', error);
            throw error;
        }
    },
    getById: async (id) => {
        try {
            console.log(`Obteniendo factura con ID: ${id}`);
            const response = await api.get(`${API_ENDPOINTS.FACTURAS}/${id}`);
            return response;
        } catch (error) {
            console.error(`Error al obtener factura con ID ${id}:`, error);
            // Añadir detalles del error para mejor diagnóstico
            if (error.response) {
                console.error('Detalles del error:', error.response.status, error.response.data);
            }
            throw error;
        }
    },
    getByUsuario: async (usuarioId) => {
        try {
            const response = await api.get(`${API_ENDPOINTS.FACTURAS}/usuario/${usuarioId}`);
            return response;
        } catch (error) {
            console.error(`Error al obtener facturas del usuario ${usuarioId}:`, error);
            throw error;
        }
    },
    crearFactura: async (datosFactura) => {
        try {
            console.log('Creando factura con datos:', datosFactura);
            const response = await api.post(`${API_ENDPOINTS.FACTURAS}/procesar-compra`, datosFactura);
            return response;
        } catch (error) {
            console.error('Error al crear factura:', error);
            throw error;
        }
    }
};

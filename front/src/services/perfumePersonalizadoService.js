// Import any necessary dependencies
import api from './api';
import API_ENDPOINTS from '../config/api';

// Servicios de perfumes personalizados con manejo de errores mejorado
const perfumePersonalizadoService = {
    getAll: async () => {
        try {
            const response = await api.get(API_ENDPOINTS.PERFUMES_PERSONALIZADOS);
            // Asegurar que siempre devolvemos un array
            if (!response.data) {
                return { data: [] };
            }
            
            if (!Array.isArray(response.data)) {
                return { data: [response.data] };
            }
            
            return response;
        } catch (error) {
            console.error('Error al obtener perfumes personalizados:', error);
            return { data: [] };
        }
    },
    
    getByUsuario: async (usuarioId) => {
        try {
            console.log(`Intentando obtener perfumes personalizados del usuario ${usuarioId}...`);
            const response = await api.get(`${API_ENDPOINTS.PERFUMES_PERSONALIZADOS}/usuario/${usuarioId}`);
            
            // Asegurar que siempre devolvemos un array
            if (!response.data) {
                console.log('No se encontraron perfumes personalizados para este usuario');
                return { data: [] };
            }
            
            if (!Array.isArray(response.data)) {
                console.log('La respuesta no es un array, transformando:', response.data);
                return { data: [response.data] };
            }
            
            console.log(`Se encontraron ${response.data.length} perfumes personalizados`);
            return response;
        } catch (error) {
            console.error(`Error al obtener perfumes personalizados del usuario ${usuarioId}:`, error);
            
            // Proporcionar información más detallada sobre el error
            if (error.response) {
                console.error('Detalles del error HTTP:', error.response.status, error.response.data);
            } else if (error.request) {
                console.error('Error de conexión con el servidor. Verifica que el backend esté funcionando.');
            } else {
                console.error('Error al configurar la solicitud:', error.message);
            }
            
            return { data: [] };
        }
    },
    
    getById: async (id) => {
        try {
            const response = await api.get(`${API_ENDPOINTS.PERFUMES_PERSONALIZADOS}/${id}`);
            return response;
        } catch (error) {
            console.error(`Error al obtener perfume personalizado con ID ${id}:`, error);
            throw error;
        }
    },
    
    create: async (data) => {
        try {
            console.log('Enviando datos para crear perfume personalizado');
            
            // Verificar si es FormData (para subida de imágenes)
            const isFormData = data instanceof FormData;
            
            if (isFormData) {
                // Log de los valores en el FormData para depuración
                console.log('Contenido del FormData:');
                for (let [key, value] of data.entries()) {
                    console.log(`${key}: ${value instanceof File ? `Archivo (${value.name}, ${value.size} bytes)` : value}`);
                }
                
                // Verificar que nombre, usuarioId y notasIds estén presentes
                let hasNombre = false;
                let hasUsuarioId = false;
                let hasNotasIds = false;
                
                for (let [key, value] of data.entries()) {
                    if (key === 'nombre' && value) hasNombre = true;
                    if (key === 'usuarioId' && value) hasUsuarioId = true;
                    if (key === 'notasIds' && value) hasNotasIds = true;
                }
                
                if (!hasNombre) {
                    throw new Error('El nombre es obligatorio y no está presente en el FormData');
                }
                
                if (!hasUsuarioId) {
                    throw new Error('El ID del usuario es obligatorio y no está presente en el FormData');
                }
                
                if (!hasNotasIds) {
                    throw new Error('Debe seleccionar al menos una nota olfativa');
                }
                
                // Convertir FormData a objeto JSON para evitar problemas con multipart/form-data
                const jsonData = {};
                for (let [key, value] of data.entries()) {
                    // Manejar notasIds como array
                    if (key === 'notasIds') {
                        if (!jsonData[key]) {
                            jsonData[key] = [];
                        }
                        jsonData[key].push(parseInt(value));
                    } 
                    // Manejar usuario como objeto con id
                    else if (key === 'usuarioId') {
                        jsonData.usuario = { id: parseInt(value) };
                    } 
                    // Otros campos como strings
                    else {
                        jsonData[key] = value;
                    }
                }
                
                console.log('Convertido a JSON para enviar:', jsonData);
                
                // Usar el endpoint JSON
                const response = await api.post(API_ENDPOINTS.PERFUMES_PERSONALIZADOS, jsonData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Respuesta recibida:', response);
                return response;
            } else {
                // Si es JSON, enviarlo directamente
                const response = await api.post(API_ENDPOINTS.PERFUMES_PERSONALIZADOS, data, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log('Respuesta recibida:', response);
                return response;
            }
        } catch (error) {
            console.error('Error al crear perfume personalizado:', error);
            if (error.response) {
                console.error('Detalles del error:', error.response.data);
                console.error('Estado HTTP:', error.response.status);
                console.error('Headers:', error.response.headers);
            } else if (error.request) {
                console.error('No se recibió respuesta del servidor:', error.request);
            } else {
                console.error('Error en la configuración de la petición:', error.message);
            }
            throw error;
        }
    },
    
    update: async (id, data) => {
        try {
            console.log('Enviando datos para actualizar perfume personalizado');
            console.log('Datos a enviar:', JSON.stringify(data, null, 2));
            
            // Verificar que los datos contengan la información necesaria
            if (!data.nombre) {
                console.warn('Advertencia: No se especificó nombre en la solicitud de actualización');
            }
            
            if (!data.notasIds || !data.notasIds.length) {
                console.warn('Advertencia: No se especificaron notasIds en la solicitud de actualización');
            }

            // Asegurar que notasIds sea siempre un array
            if (data.notasIds && !Array.isArray(data.notasIds)) {
                console.warn('notasIds no es un array, convirtiéndolo en array:', data.notasIds);
                data.notasIds = [data.notasIds];
            }
            
            const response = await api.put(`${API_ENDPOINTS.PERFUMES_PERSONALIZADOS}/${id}`, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Respuesta recibida de actualización:', response);
            return response;
        } catch (error) {
            console.error(`Error al actualizar perfume personalizado con ID ${id}:`, error);
            
            // Agregar información más específica sobre el error
            if (error.response) {
                console.error('Detalles del error:', error.response.status, error.response.data);
            } else if (error.request) {
                console.error('No se recibió respuesta del servidor');
            } else {
                console.error('Error en la configuración de la petición:', error.message);
            }
            
            throw error;
        }
    },
    
    delete: async (id) => {
        try {
            const response = await api.delete(`${API_ENDPOINTS.PERFUMES_PERSONALIZADOS}/${id}`);
            return response;
        } catch (error) {
            console.error(`Error al eliminar perfume personalizado con ID ${id}:`, error);
            throw error;
        }
    }
};

export default perfumePersonalizadoService;
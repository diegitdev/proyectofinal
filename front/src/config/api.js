// Intentamos primero con el puerto 8080, pero hacemos un fallback al 8081 si es necesario
const BASE_URL = 'http://localhost:8080/api';
const FALLBACK_URL = 'http://localhost:8081/api'; 

export const API_ENDPOINTS = {
    BASE_URL,
    FALLBACK_URL,
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    USER_PROFILE: `${BASE_URL}/usuarios/profile`,
    USER_BASE: `${BASE_URL}/usuarios`,
    PERFUMES: `${BASE_URL}/perfumes`,
    PERFUMES_PERSONALIZADOS: `${BASE_URL}/perfumes-personalizados`,
    CARRITO: `${BASE_URL}/carrito`,
    CATEGORIAS: `${BASE_URL}/categorias`,
    NOTAS_OLFATIVAS: `${BASE_URL}/notas-olfativas`,
    FACTURAS: `${BASE_URL}/facturas`
};

export default API_ENDPOINTS; 
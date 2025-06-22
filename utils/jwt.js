import jwt_decode from "jwt-decode";

/**
 * Valida si el JWT es válido y no ha expirado.
 * @param {string} token - El token JWT.
 * @returns {boolean} - true si el token es válido y no ha expirado, false de lo contrario.
 */
export function isValidJWT(token) {
  if (!token) return false;
  try {
    const decoded = jwt_decode(token);
    if (!decoded.exp) return false;
    const now = Date.now() / 1000; // ahora en segundos
    return decoded.exp > now;
  } catch (e) {
    return false;
  }
}

/**
 * Decodifica el token JWT y retorna los datos del usuario.
 * @param {string} token - El token JWT.
 * @returns {object|null} - Datos decodificados del usuario o null si el token es inválido.
 */
export function getUserFromJWT(token) {
  if (!token) return null;
  try {
    return jwt_decode(token);
  } catch (e) {
    return null;
  }
}

// Ejemplo de uso en tu frontend:
const token = localStorage.getItem("token");
if (isValidJWT(token)) {
  const user = getUserFromJWT(token);
  console.log("Usuario autenticado:", user);
  // ... continuar lógica de usuario autenticado
} else {
  // Token inválido o expirado, redirigir a login
  // window.location.href = '/login';
}
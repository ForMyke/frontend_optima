/**
 * Configuración de permisos por rol
 * 
 * Aquí defines qué páginas/secciones puede ver cada rol.
 * Para agregar un nuevo rol, simplemente agrega una nueva entrada.
 * Para modificar permisos, edita el array de páginas permitidas.
 */

// Definición de roles (puedes agregar más según necesites)
export const ROLES = {
  ADMIN: 'ADMIN',
  ALMACEN: 'ALMACEN',
  NOMINA: 'NOMINA',
  AVIAJE: 'AVIAJE',
  RVIAJE: 'RVIAJE',
  // Agrega más roles aquí según los vayas creando
}

/**
 * Configuración de permisos
 * Cada rol tiene un array de rutas permitidas
 * Si la ruta termina con '/*', permite todas las subrutas
*/
export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    allowedRoutes: [
      '/dashboard',
      '/dashboard/clientes',
      '/dashboard/usuarios',
      '/dashboard/operadores',
      '/dashboard/roles',
      '/dashboard/viajes',
      '/dashboard/bitacora',
      '/dashboard/unidades',
      '/dashboard/pagos',
      '/dashboard/carta-portes',
      '/dashboard/compliance',
      '/dashboard/quotes',
      '/dashboard/insurance',
      '/dashboard/licenses',
      '/dashboard/maintenance',
      '/dashboard/vehicles',
      '/dashboard/monlo',
      '/dashboard/graficos',
      // El admin tiene acceso a TODO
      '*' // Wildcard: acceso completo
    ],
    displayName: 'Administrador'
  },

  [ROLES.ALMACEN]: {
    allowedRoutes: [
      '/dashboard',
      '/dashboard/almacen',
    ],
    displayName: 'Almacen'
  },

  [ROLES.NOMINA]: {
    allowedRoutes: [
      '/dashboard',
      '/dashboard/operador',
    ],
    displayName: 'Nomina'
  },

  [ROLES.AVIAJE]: {
    allowedRoutes: [
      '/dashboard',
      '/dashboard/pagos',
      '/dashboard/carta-portes',
      '/dashboard/compliance',
      '/dashboard/quotes',
      '/dashboard/clientes',
      '/dashboard/operadores',
    ],
    displayName: 'Logística de asignación de viajes'
  },

  [ROLES.RVIAJE]: {
    allowedRoutes: [
      '/dashboard',
      '/dashboard/clientes',
      '/dashboard/operadores',
      '/dashboard/viajes',
      '/dashboard/bitacora',
      '/dashboard/unidades',
      '/dashboard/pagos',
    ],
    displayName: 'Logística de recepción de viajes'
  },
}

/**
 * Normaliza el rol del usuario
 * Maneja formatos como: "ROLE_ADMIN" -> "ADMIN", ["ROLE_ADMIN"] -> "ADMIN"
 * @param {string|Array} role - El rol a normalizar
 * @returns {string} - Rol normalizado
 */
export const normalizeRole = (role) => {
  if (!role) return null
  
  // Si es un array, tomar el primer elemento
  let normalizedRole = Array.isArray(role) ? role[0] : role
  
  // Quitar el prefijo "ROLE_" si existe
  if (typeof normalizedRole === 'string' && normalizedRole.startsWith('ROLE_')) {
    normalizedRole = normalizedRole.replace('ROLE_', '')
  }
  
  return normalizedRole
}

/**
 * Verifica si un usuario tiene permiso para acceder a una ruta
 * @param {string} userRole - El rol del usuario
 * @param {string} route - La ruta a verificar
 * @returns {boolean} - true si tiene permiso, false si no
 */
export const hasPermission = (userRole, route) => {
  // Si no hay rol, no hay permiso
  if (!userRole) return false

  // Normalizar el rol antes de verificar permisos
  const normalizedRole = normalizeRole(userRole)
  
  // Obtener los permisos del rol
  const rolePermissions = PERMISSIONS[normalizedRole]
  
  // Si el rol no existe, no hay permiso
  if (!rolePermissions) {
    console.warn(`Rol no encontrado en PERMISSIONS: ${normalizedRole}`)
    return false
  }

  const { allowedRoutes } = rolePermissions

  // Si tiene wildcard (*), tiene acceso a todo
  if (allowedRoutes.includes('*')) return true

  // Verificar si la ruta exacta está permitida
  if (allowedRoutes.includes(route)) return true

  // Verificar si hay un wildcard que cubra esta ruta
  // Ejemplo: '/dashboard/clientes/*' permite '/dashboard/clientes/1'
  const hasWildcardMatch = allowedRoutes.some(allowedRoute => {
    if (allowedRoute.endsWith('/*')) {
      const baseRoute = allowedRoute.slice(0, -2)
      return route.startsWith(baseRoute)
    }
    return false
  })

  return hasWildcardMatch
}

/**
 * Filtra los items del menú según los permisos del rol
 * @param {Array} menuItems - Items del menú
 * @param {string} userRole - Rol del usuario
 * @returns {Array} - Items filtrados
 */
export const filterMenuByPermissions = (menuItems, userRole) => {
  if (!userRole) return []

  return menuItems
    .map(item => {
      // Si el item tiene hijos, filtrarlos recursivamente
      if (item.children) {
        const filteredChildren = item.children.filter(child => 
          hasPermission(userRole, child.href)
        )

        // Si no quedan hijos después del filtrado, no mostrar el item padre
        if (filteredChildren.length === 0) return null

        return {
          ...item,
          children: filteredChildren
        }
      }

      // Si es un item simple, verificar permiso
      if (item.href && !hasPermission(userRole, item.href)) {
        return null
      }

      return item
    })
    .filter(item => item !== null) // Remover items nulos
}

/**
 * Obtiene el nombre del rol para mostrar
 * @param {string} role - El rol del usuario
 * @returns {string} - Nombre del rol para mostrar
 */
export const getRoleDisplayName = (role) => {
  return PERMISSIONS[role]?.displayName || role
}

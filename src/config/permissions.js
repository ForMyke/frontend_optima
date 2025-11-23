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
  LOGISTICA: 'LOGISTICA'
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
      '/dashboard/resumen-gastos',
      '/dashboard/historico',
      // El admin tiene acceso a TODO
      '*' // Wildcard: acceso completo
    ],
    displayName: 'Administrador'
  },

  [ROLES.ALMACEN]: {
    allowedRoutes: [
      '/dashboard',
      '/dashboard/graficos',
      '/dashboard/almacen',
      '/dashboard/historico',
      '/dashboard/almacen/*', // Permite todas las subrutas de almacen
    ],
    displayName: 'Almacen'
  },

  [ROLES.NOMINA]: {
    allowedRoutes: [
      '/dashboard',
      '/dashboard/nomina',
      '/dashboard/facturas',
      '/dashboard/facturas/extra',
      '/dashboard/gastos',
      '/dashboard/graficos',
      '/dashboard/operadores',
      '/dashboard/resumen-gastos',
    ],
    displayName: 'Nomina'
  },

  [ROLES.LOGISTICA]: {
    allowedRoutes: [
      '/dashboard',
      '/dashboard/tarifas-comisiones',
      '/dashboard/graficos',
      '/dashboard/viajes',
      '/dashboard/monlo',
      '/dashboard/clientes',
      '/dashboard/bitacora',
      '/dashboard/unidades',
    ],
    displayName: 'Logística de asignación de viajes'
  }
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

/**
 * Configuración de gráficos permitidos por rol
 * Define qué gráficos puede ver cada rol en la página de gráficos
 */
export const GRAFICOS_PERMISSIONS = {
  [ROLES.ADMIN]: {
    allowedCharts: [
      // Gráficos financieros
      'ingresos-vs-gastos',
      'gastos-categoria',
      'gastos-mensuales',
      // Gráficos de viajes
      'viajes-mes',
      'viajes-estado',
      // Gráficos de unidades
      'unidades-estado',
      'kilometraje-unidad',
      // Gráficos de mantenimiento
      'mantenimientos-tipo',
      'mantenimientos-costo',
      // Gráficos de clientes
      'viajes-cliente',
      'ingresos-cliente',
      // Gráficos de operadores
      'viajes-operador',
      'operadores-estatus',
      // Gráficos de facturas
      'facturas-estatus',
      'facturas-mensuales',
      // Gráficos de refacciones
      'refacciones-categoria',
      'inventario-bajo'
    ]
  },

  [ROLES.ALMACEN]: {
    allowedCharts: [
      // Mantenimiento
      'mantenimientos-tipo',
      'mantenimientos-costo',
      // Refacciones e inventario
      'refacciones-categoria',
      'inventario-bajo'
    ]
  },

  [ROLES.NOMINA]: {
    allowedCharts: [
      // Gastos y finanzas
      'gastos-mensuales',
      'gastos-categoria',
      'ingresos-vs-gastos',
      // Operadores
      'viajes-operador',
      'operadores-estatus',
      // Facturas
      'facturas-estatus',
      'facturas-mensuales'
    ]
  },

  [ROLES.LOGISTICA]: {
    allowedCharts: [
      // Viajes y operaciones
      'viajes-mes',
      'viajes-estado',
      // Unidades
      'kilometraje-unidad',
      // Clientes
      'viajes-cliente',
      'ingresos-cliente',
      // Gráficos de unidades
      'unidades-estado',
      'kilometraje-unidad',
    ]
  }
}

/**
 * Verifica si un rol puede ver un gráfico específico
 * @param {string} userRole - El rol del usuario
 * @param {string} chartId - ID del gráfico
 * @returns {boolean} - true si puede ver el gráfico
 */
export const canViewChart = (userRole, chartId) => {
  if (!userRole) return false

  const normalizedRole = normalizeRole(userRole)
  const roleCharts = GRAFICOS_PERMISSIONS[normalizedRole]

  if (!roleCharts) return false

  // Admin puede ver todo
  if (normalizedRole === ROLES.ADMIN) return true

  return roleCharts.allowedCharts.includes(chartId)
}

/**
 * Obtiene la lista de gráficos permitidos para un rol
 * @param {string} userRole - El rol del usuario
 * @returns {Array} - Array de IDs de gráficos permitidos
 */
export const getAllowedCharts = (userRole) => {
  if (!userRole) return []

  const normalizedRole = normalizeRole(userRole)
  const roleCharts = GRAFICOS_PERMISSIONS[normalizedRole]

  if (!roleCharts) return []

  return roleCharts.allowedCharts
}

/**
 * Configuración de StatCards (tarjetas de estadísticas) permitidas por rol
 * Define qué tarjetas de estadísticas puede ver cada rol en la página de gráficos
 */
export const STATCARDS_PERMISSIONS = {
  [ROLES.ADMIN]: {
    allowedStatCards: [
      // Tarjetas de viajes
      'total-viajes',
      'viajes-activos',
      // Tarjetas financieras
      'gastos-totales',
      // Tarjetas de unidades
      'unidades-activas',
      // Tarjetas de clientes
      'total-clientes',
      // Tarjetas de operadores
      'operadores-disponibles',
      // Tarjetas de facturas
      'facturas-pendientes',
      'monto-por-cobrar',
      // Tarjetas de refacciones
      'refacciones-stock-bajo'
    ]
  },

  [ROLES.ALMACEN]: {
    allowedStatCards: [
      // Refacciones
      'refacciones-stock-bajo'
    ]
  },

  [ROLES.NOMINA]: {
    allowedStatCards: [

      // Finanzas
      'gastos-totales',
      // Operadores
      'operadores-disponibles',
      // Facturas
      'facturas-pendientes',
      'monto-por-cobrar'
    ]
  },

  [ROLES.LOGISTICA]: {
    allowedStatCards: [
      // Viajes
      'total-viajes',
      'viajes-activos',
      // Clientes
      'total-clientes',
      // Tarjetas de unidades
      'unidades-activas',
    ]
  }
}

/**
 * Verifica si un rol puede ver una tarjeta de estadística específica
 * @param {string} userRole - El rol del usuario
 * @param {string} statCardId - ID de la tarjeta de estadística
 * @returns {boolean} - true si puede ver la tarjeta
 */
export const canViewStatCard = (userRole, statCardId) => {
  if (!userRole) return false

  const normalizedRole = normalizeRole(userRole)
  const roleStatCards = STATCARDS_PERMISSIONS[normalizedRole]

  if (!roleStatCards) return false

  // Admin puede ver todo
  if (normalizedRole === ROLES.ADMIN) return true

  return roleStatCards.allowedStatCards.includes(statCardId)
}

/**
 * Obtiene la lista de StatCards permitidas para un rol
 * @param {string} userRole - El rol del usuario
 * @returns {Array} - Array de IDs de StatCards permitidas
 */
export const getAllowedStatCards = (userRole) => {
  if (!userRole) return []

  const normalizedRole = normalizeRole(userRole)
  const roleStatCards = STATCARDS_PERMISSIONS[normalizedRole]

  if (!roleStatCards) return []

  return roleStatCards.allowedStatCards
}

/**
 * Configuración de elementos del Dashboard principal permitidos por rol
 * Define qué secciones y widgets puede ver cada rol en el dashboard principal
 */
export const DASHBOARD_PERMISSIONS = {
  [ROLES.ADMIN]: {
    allowedElements: [
      // StatCards principales
      'stat-viajes-activos',
      'stat-gastos-mes',
      'stat-ingresos-mes',
      'stat-viajes-completados',
      // Widgets
      'widget-estado-viajes',
      'widget-flota-vehicular',
      'widget-viajes-recientes',
      'widget-alertas-tareas',
      // Acciones rápidas
      'action-nuevo-viaje',
      'action-bitacora',
      'action-nuevo-cliente',
      'action-ver-reportes'
    ]
  },

  [ROLES.ALMACEN]: {
    allowedElements: [
      'action-ver-reportes'
    ]
  },

  [ROLES.NOMINA]: {
    allowedElements: [
      // StatCards
      'stat-viajes-activos',
      'stat-gastos-mes',
      'stat-ingresos-mes',
      // Widgets
      'widget-alertas-tareas',
      // Acciones rápidas
      'action-ver-reportes'
    ]
  },

  [ROLES.LOGISTICA]: {
    allowedElements: [
      // StatCards
      'stat-viajes-activos',
      'stat-viajes-completados',
      // Widgets
      'widget-estado-viajes',
      'widget-flota-vehicular',
      'widget-viajes-recientes',
      // Acciones rápidas
      'action-nuevo-viaje',
      'action-bitacora',
      'action-nuevo-cliente',
      'action-ver-reportes'
    ]
  }
}

/**
 * Verifica si un rol puede ver un elemento del dashboard
 * @param {string} userRole - El rol del usuario
 * @param {string} elementId - ID del elemento del dashboard
 * @returns {boolean} - true si puede ver el elemento
 */
export const canViewDashboardElement = (userRole, elementId) => {
  if (!userRole) return false

  const normalizedRole = normalizeRole(userRole)
  const roleDashboard = DASHBOARD_PERMISSIONS[normalizedRole]

  if (!roleDashboard) return false

  // Admin puede ver todo
  if (normalizedRole === ROLES.ADMIN) return true

  return roleDashboard.allowedElements.includes(elementId)
}

/**
 * Obtiene la lista de elementos del dashboard permitidos para un rol
 * @param {string} userRole - El rol del usuario
 * @returns {Array} - Array de IDs de elementos permitidos
 */
export const getAllowedDashboardElements = (userRole) => {
  if (!userRole) return []

  const normalizedRole = normalizeRole(userRole)
  const roleDashboard = DASHBOARD_PERMISSIONS[normalizedRole]

  if (!roleDashboard) return []

  return roleDashboard.allowedElements
}

export type AdminSection =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'categories'
  | 'size'

export const defaultAdminSection: AdminSection = 'dashboard'

export const adminSections: Array<{
  id: AdminSection
  label: string
}> = [
  {
    id: 'dashboard',
    label: 'Dashboard',
  },
  {
    id: 'orders',
    label: 'Orders',
  },
  {
    id: 'products',
    label: 'Products',
  },
  {
    id: 'categories',
    label: 'Categories',
  },
  {
    id: 'size',
    label: 'Size',
  },
]

const adminSectionPaths: Record<AdminSection, string> = {
  categories: '/admin/categories',
  dashboard: '/admin/dashboard',
  orders: '/admin/orders',
  products: '/admin/products',
  size: '/admin/size',
}

const adminSectionsByPath = new Map(
  Object.entries(adminSectionPaths).map(([section, path]) => [
    path,
    section as AdminSection,
  ]),
)

const normalizePath = (path: string) => path.replace(/\/+$/, '') || '/'

export const getAdminSectionPath = (section: AdminSection) =>
  adminSectionPaths[section]

export const getAdminSectionFromPath = (path: string) =>
  adminSectionsByPath.get(normalizePath(path)) ?? defaultAdminSection

export const isAdminSectionPath = (path: string) =>
  adminSectionsByPath.has(normalizePath(path))

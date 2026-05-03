const canUseLocalAdminAuth = import.meta.env.DEV

export const adminAuthConfig = {
  email: canUseLocalAdminAuth ? (import.meta.env.VITE_ADMIN_EMAIL ?? '') : '',
  password: canUseLocalAdminAuth
    ? (import.meta.env.VITE_ADMIN_PASSWORD ?? '')
    : '',
}

export const isLocalAdminAuthConfigured = Boolean(
  adminAuthConfig.email && adminAuthConfig.password,
)

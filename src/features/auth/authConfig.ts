export const adminAuthConfig = {
  email: import.meta.env.VITE_ADMIN_EMAIL ?? '',
  password: import.meta.env.VITE_ADMIN_PASSWORD ?? '',
}

export const isLocalAdminAuthConfigured = Boolean(
  adminAuthConfig.email && adminAuthConfig.password,
)

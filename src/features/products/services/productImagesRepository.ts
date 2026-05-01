import { isSupabaseConfigured, supabaseConfig } from '../../supabase/supabaseConfig'

const PRODUCT_IMAGES_BUCKET = 'product-images'

const createImagePath = () => {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  return `products/${id}.webp`
}

const getPublicImageUrl = (path: string) =>
  `${supabaseConfig.url}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${path
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`

export const canUploadProductImages = isSupabaseConfigured

export async function uploadProductImage(image: Blob, accessToken: string) {
  const path = createImagePath()
  const response = await fetch(
    `${supabaseConfig.url}/storage/v1/object/${PRODUCT_IMAGES_BUCKET}/${path}`,
    {
      body: image,
      headers: {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': image.type || 'image/webp',
      },
      method: 'POST',
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Image upload failed: ${response.status}`)
  }

  return getPublicImageUrl(path)
}

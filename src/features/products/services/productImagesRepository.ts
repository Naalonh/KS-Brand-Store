import { isSupabaseConfigured, supabaseConfig } from '../../supabase/supabaseConfig'
import { createSupabaseClientWithToken } from '../../supabase/supabaseClient'

const PRODUCT_IMAGES_BUCKET = 'product-images'

const createImagePath = (productId: string) => `products/${productId}/main.webp`

const getPublicImageUrl = (path: string) =>
  `${supabaseConfig.url}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${path
    .split('/')
    .map(encodeURIComponent)
    .join('/')}?v=${Date.now()}`

export const getProductImageStoragePath = (imageUrl: string) => {
  if (!isSupabaseConfigured) {
    return ''
  }

  try {
    const url = new URL(imageUrl)
    const supabaseUrl = new URL(supabaseConfig.url)
    const bucketPrefix = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`

    if (url.origin !== supabaseUrl.origin || !url.pathname.startsWith(bucketPrefix)) {
      return ''
    }

    return url.pathname
      .slice(bucketPrefix.length)
      .split('/')
      .map(decodeURIComponent)
      .join('/')
  } catch {
    return ''
  }
}

export const canUploadProductImages = isSupabaseConfigured

export async function uploadProductImageForProduct(
  image: Blob,
  accessToken: string,
  productId: string,
) {
  const path = createImagePath(productId)
  const storageClient = createSupabaseClientWithToken(accessToken)

  if (!storageClient) {
    throw new Error('Supabase is not configured.')
  }

  const { error } = await storageClient.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, image, {
      cacheControl: '0',
      contentType: 'image/webp',
      upsert: true,
    })

  if (error) {
    throw new Error(error.message || `Image upload failed for ${path}`)
  }

  return getPublicImageUrl(path)
}

export async function deleteProductImage(imageUrl: string, accessToken: string) {
  const path = getProductImageStoragePath(imageUrl)
  const storageClient = createSupabaseClientWithToken(accessToken)

  if (!path || !storageClient) {
    return
  }

  const { error } = await storageClient.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove([path])

  if (error) {
    throw new Error(error.message || `Image delete failed for ${path}`)
  }
}

export async function deleteProductImagesForProduct(
  productId: string,
  accessToken: string,
) {
  const storageClient = createSupabaseClientWithToken(accessToken)

  if (!storageClient) {
    return
  }

  const folderPath = `products/${productId}`
  const { data: files, error: listError } = await storageClient.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .list(folderPath)

  if (listError) {
    throw new Error(
      listError.message || `Image list failed for ${folderPath}`,
    )
  }

  const paths = (files ?? [])
    .filter((file) => file.name !== '.emptyFolderPlaceholder')
    .map((file) => `${folderPath}/${file.name}`)

  if (paths.length === 0) {
    return
  }

  const { error } = await storageClient.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove(paths)

  if (error) {
    throw new Error(
      error.message || `Image delete failed for ${folderPath}`,
    )
  }
}

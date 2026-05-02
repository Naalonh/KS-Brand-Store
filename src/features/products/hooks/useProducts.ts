import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { createProductId } from '../../../utils/createProductId'
import { defaultProducts, emptyProductForm } from '../data/defaultProducts'
import {
  canUseSupabaseProducts,
  createRemoteProduct,
  deleteRemoteProduct,
  fetchProducts,
  updateRemoteProduct,
  uuidPattern,
} from '../services/productsRepository'
import {
  deleteProductImage,
  deleteProductImagesForProduct,
  getProductImageStoragePath,
  uploadProductImageForProduct,
} from '../services/productImagesRepository'
import type { Product, ProductForm } from '../types'
import { loadProducts, saveProducts } from '../utils/productStorage'

export type ProductsState = ReturnType<typeof useProducts>

const maxProductSizesLength = 512

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : ''

export function useProducts(accessToken?: string) {
  const [products, setProducts] = useState<Product[]>(() =>
    canUseSupabaseProducts ? [] : loadProducts(),
  )
  const [form, setForm] = useState<ProductForm>(emptyProductForm)
  const [draftProductId, setDraftProductId] = useState(createProductId)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(canUseSupabaseProducts)
  const [source, setSource] = useState<'local' | 'supabase'>('local')

  const activeProducts = useMemo(
    () => products.filter((product) => product.active),
    [products],
  )

  const featuredProduct = activeProducts[0] ?? defaultProducts[0]

  useEffect(() => {
    if (!canUseSupabaseProducts || source === 'local') {
      saveProducts(products)
    }
  }, [products, source])

  useEffect(() => {
    if (!canUseSupabaseProducts) {
      return
    }

    let isMounted = true

    const syncProducts = async () => {
      setIsLoading(true)
      setError('')

      try {
        const remoteProducts = await fetchProducts(accessToken)

        if (!isMounted) {
          return
        }

        setProducts(remoteProducts)
        setSource('supabase')
      } catch (error) {
        if (!isMounted) {
          return
        }

        const errorMessage = getErrorMessage(error)
        setError(
          errorMessage
            ? `Supabase products table is not ready yet, so local products are showing. ${errorMessage}`
            : 'Supabase products table is not ready yet, so local products are showing.',
        )
        setSource('local')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void syncProducts()

    return () => {
      isMounted = false
    }
  }, [accessToken])

  const updateForm = (field: keyof ProductForm, value: string | boolean) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setForm(emptyProductForm)
    setEditingId(null)
    setDraftProductId(createProductId())
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
    imageBlob?: Blob,
  ) => {
    event.preventDefault()

    let imageUrl = form.image.trim()

    // Upload the pending blob now (at submit time, not at crop time)
    if (imageBlob && canUseSupabaseProducts && accessToken) {
      setError('')
      try {
        imageUrl = await uploadProductImageForProduct(
          imageBlob,
          accessToken,
          editingId ?? draftProductId,
        )
      } catch {
        setError('Could not upload the product image. Please try again.')
        return false
      }
    }

    const nextProduct: ProductForm = {
      name: form.name.trim(),
      price: form.price.trim(),
      discountPrice: form.discountPrice?.trim() ?? '',
      sizes: form.sizes.trim(),
      tag: form.tag.trim(),
      image: imageUrl,
      active: form.active,
    }

    if (
      !nextProduct.name ||
      !nextProduct.price ||
      !nextProduct.tag ||
      !nextProduct.image
    ) {
      setError('Please fill in all product details before saving.')
      return false
    }

    if (!nextProduct.sizes) {
      setError('Please choose at least one product size before saving.')
      return false
    }

    if (nextProduct.sizes.length > maxProductSizesLength) {
      setError(
        `Please choose fewer or shorter sizes. Product sizes can be at most ${maxProductSizesLength} characters.`,
      )
      return false
    }

    if (
      canUseSupabaseProducts &&
      !imageBlob &&
      !nextProduct.image.startsWith('http')
    ) {
      setError(
        'The product image must be uploaded to storage before saving. Please re-upload the image.',
      )
      return false
    }

    setError('')

    try {
      if (
        editingId &&
        canUseSupabaseProducts &&
        accessToken &&
        uuidPattern.test(editingId)
      ) {
        const previousProduct = products.find(
          (product) => product.id === editingId,
        )
        const previousImagePath = previousProduct?.image
          ? getProductImageStoragePath(previousProduct.image)
          : ''
        const nextImagePath = getProductImageStoragePath(nextProduct.image)
        const shouldDeletePreviousImage =
          previousProduct?.image &&
          previousImagePath &&
          previousImagePath !== nextImagePath &&
          !products.some(
            (product) =>
              product.id !== editingId &&
              product.image === previousProduct.image,
          )
        const updatedProduct = await updateRemoteProduct(
          editingId,
          nextProduct,
          accessToken,
        )

        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product.id === editingId ? updatedProduct : product,
          ),
        )
        setSource('supabase')

        if (shouldDeletePreviousImage && previousProduct) {
          try {
            await deleteProductImage(previousProduct.image, accessToken)
          } catch (storageError) {
            setError(
              `Product was updated, but the old image could not be removed from storage. ${
                storageError instanceof Error ? storageError.message : ''
              }`.trim(),
            )
          }
        }
      } else if (canUseSupabaseProducts && accessToken && !editingId) {
        const createdProduct = await createRemoteProduct(
          nextProduct,
          accessToken,
          uuidPattern.test(draftProductId) ? draftProductId : undefined,
        )

        setProducts((currentProducts) => [createdProduct, ...currentProducts])
        setSource('supabase')
      } else if (editingId) {
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product.id === editingId ? { ...product, ...nextProduct } : product,
          ),
        )
      } else {
        setProducts((currentProducts) => [
          { id: draftProductId, ...nextProduct },
          ...currentProducts,
        ])
      }

      resetForm()
      return true
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setError(
        errorMessage
          ? `Could not save this product in Supabase. ${errorMessage}`
          : 'Could not save this product in Supabase.',
      )
      return false
    }
  }

  const editProduct = (product: Product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice ?? '',
      sizes: product.sizes,
      tag: product.tag,
      image: product.image,
      active: product.active,
    })
  }

  const toggleProductStatus = async (productId: string) => {
    const product = products.find(
      (currentProduct) => currentProduct.id === productId,
    )

    if (!product) {
      return false
    }

    const nextProduct = { ...product, active: !product.active }

    setError('')

    if (canUseSupabaseProducts && accessToken && uuidPattern.test(productId)) {
      try {
        const updatedProduct = await updateRemoteProduct(
          productId,
          {
            active: nextProduct.active,
            discountPrice: nextProduct.discountPrice,
            image: nextProduct.image,
            name: nextProduct.name,
            price: nextProduct.price,
            sizes: nextProduct.sizes,
            tag: nextProduct.tag,
          },
          accessToken,
        )

        setProducts((currentProducts) =>
          currentProducts.map((currentProduct) =>
            currentProduct.id === productId ? updatedProduct : currentProduct,
          ),
        )
        return true
      } catch (error) {
        const errorMessage = getErrorMessage(error)
        setError(
          errorMessage
            ? `Could not update this product in Supabase. ${errorMessage}`
            : 'Could not update this product in Supabase.',
        )
        return false
      }
    }

    setProducts((currentProducts) =>
      currentProducts.map((currentProduct) =>
        currentProduct.id === productId
          ? { ...currentProduct, active: !currentProduct.active }
          : currentProduct,
      ),
    )
    return true
  }

  const deleteProduct = async (productId: string) => {
    setError('')
    const product = products.find(
      (currentProduct) => currentProduct.id === productId,
    )

    let shouldRemoveProductLocally = true

    if (canUseSupabaseProducts && accessToken && uuidPattern.test(productId)) {
      try {
        await deleteRemoteProduct(productId, accessToken)
      } catch (error) {
        const errorMessage = getErrorMessage(error)
        setError(
          errorMessage
            ? `Could not delete this product in Supabase. ${errorMessage}`
            : 'Could not delete this product in Supabase.',
        )
        shouldRemoveProductLocally = false
      }

      if (shouldRemoveProductLocally && product?.image) {
        try {
          await deleteProductImagesForProduct(productId, accessToken)
          await deleteProductImage(product.image, accessToken)
        } catch (storageError) {
          setError(
            `Product was deleted, but its image could not be removed from storage. ${
              storageError instanceof Error ? storageError.message : ''
            }`.trim(),
          )
        }
      }

      if (!shouldRemoveProductLocally) {
        return false
      }
    }

    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productId),
    )

    if (editingId === productId) {
      resetForm()
    }
    return true
  }

  const restoreDefaults = () => {
    setProducts(defaultProducts)
    setSource('local')
    resetForm()
  }

  return {
    accessToken,
    activeProducts,
    deleteProduct,
    editProduct,
    editingId,
    error,
    featuredProduct,
    form,
    handleSubmit,
    imageProductId: editingId ?? draftProductId,
    isLoading,
    products,
    resetForm,
    restoreDefaults,
    source,
    toggleProductStatus,
    updateForm,
  }
}

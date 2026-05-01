import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { createProductId } from '../../../utils/createProductId'
import { defaultProducts, emptyProductForm } from '../data/defaultProducts'
import {
  canUseSupabaseProducts,
  createRemoteProduct,
  deleteRemoteProduct,
  fetchProducts,
  updateRemoteProduct,
} from '../services/productsRepository'
import type { Product, ProductForm } from '../types'
import { loadProducts, saveProducts } from '../utils/productStorage'

export type ProductsState = ReturnType<typeof useProducts>

export function useProducts(accessToken?: string) {
  const [products, setProducts] = useState<Product[]>(loadProducts)
  const [form, setForm] = useState<ProductForm>(emptyProductForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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

        setProducts(remoteProducts.length > 0 ? remoteProducts : defaultProducts)
        setSource('supabase')
      } catch {
        if (!isMounted) {
          return
        }

        setError(
          'Supabase products table is not ready yet, so local products are showing.',
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
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextProduct: ProductForm = {
      name: form.name.trim(),
      price: form.price.trim(),
      sizes: form.sizes.trim(),
      tag: form.tag.trim(),
      image: form.image.trim(),
      active: form.active,
    }

    if (
      !nextProduct.name ||
      !nextProduct.price ||
      !nextProduct.sizes ||
      !nextProduct.tag ||
      !nextProduct.image
    ) {
      return false
    }

    setError('')

    try {
      if (canUseSupabaseProducts && accessToken) {
        if (editingId) {
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
        } else {
          const createdProduct = await createRemoteProduct(
            nextProduct,
            accessToken,
          )

          setProducts((currentProducts) => [createdProduct, ...currentProducts])
        }

        setSource('supabase')
      } else if (editingId) {
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product.id === editingId ? { ...product, ...nextProduct } : product,
          ),
        )
      } else {
        setProducts((currentProducts) => [
          { id: createProductId(), ...nextProduct },
          ...currentProducts,
        ])
      }

      resetForm()
      return true
    } catch {
      setError('Could not save this product in Supabase.')
      return false
    }
  }

  const editProduct = (product: Product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      price: product.price,
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
      return
    }

    const nextProduct = { ...product, active: !product.active }

    if (canUseSupabaseProducts && accessToken) {
      try {
        const updatedProduct = await updateRemoteProduct(
          productId,
          {
            active: nextProduct.active,
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
        return
      } catch {
        setError('Could not update this product in Supabase.')
        return
      }
    }

    setProducts((currentProducts) =>
      currentProducts.map((currentProduct) =>
        currentProduct.id === productId
          ? { ...currentProduct, active: !currentProduct.active }
          : currentProduct,
      ),
    )
  }

  const deleteProduct = async (productId: string) => {
    if (canUseSupabaseProducts && accessToken) {
      try {
        await deleteRemoteProduct(productId, accessToken)
      } catch {
        setError('Could not delete this product in Supabase.')
        return
      }
    }

    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productId),
    )

    if (editingId === productId) {
      resetForm()
    }
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
    isLoading,
    products,
    resetForm,
    restoreDefaults,
    source,
    toggleProductStatus,
    updateForm,
  }
}

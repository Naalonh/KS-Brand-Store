import { useEffect, useState, type FormEvent } from 'react'
import { createCategorySlug } from '../../../utils/createCategorySlug'
import { defaultCategories, emptyCategoryForm } from '../data/defaultCategories'
import {
  canUseSupabaseCategories,
  createRemoteCategory,
  deleteRemoteCategory,
  fetchCategories,
  updateRemoteCategory,
} from '../services/categoriesRepository'
import type { Category, CategoryForm } from '../types'
import { loadCategories, saveCategories } from '../utils/categoryStorage'

export type CategoriesState = ReturnType<typeof useCategories>

const createCategoryId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `category-${Date.now()}`
}

const createDraftCategory = (form: CategoryForm): Category => {
  const slug = createCategorySlug(form.name)

  return {
    active: false,
    id: createCategoryId(),
    name: form.name,
    productCount: 0,
    slug: `${slug}-${Date.now()}`,
  }
}

export function useCategories(accessToken?: string) {
  const [categories, setCategories] = useState<Category[]>(loadCategories)
  const [error, setError] = useState('')
  const [form, setForm] = useState<CategoryForm>(emptyCategoryForm)
  const [isLoading, setIsLoading] = useState(false)
  const [source, setSource] = useState<'local' | 'supabase'>('local')

  useEffect(() => {
    if (!canUseSupabaseCategories || source === 'local') {
      saveCategories(categories)
    }
  }, [categories, source])

  useEffect(() => {
    if (!canUseSupabaseCategories) {
      return
    }

    let isMounted = true

    const syncCategories = async () => {
      setIsLoading(true)
      setError('')

      try {
        const remoteCategories = await fetchCategories(accessToken)

        if (!isMounted) {
          return
        }

        setCategories(remoteCategories)
        setSource('supabase')
      } catch {
        if (!isMounted) {
          return
        }

        setError(
          'Supabase categories table is not ready yet, so local categories are showing.',
        )
        setSource('local')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void syncCategories()

    return () => {
      isMounted = false
    }
  }, [accessToken])

  const updateForm = (field: keyof CategoryForm, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setForm(emptyCategoryForm)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextForm = {
      name: form.name.trim(),
    }

    if (!nextForm.name) {
      return false
    }

    const nextCategory = createDraftCategory(nextForm)

    setError('')

    try {
      if (canUseSupabaseCategories && accessToken) {
        const createdCategory = await createRemoteCategory(
          nextCategory,
          accessToken,
        )

        setCategories((currentCategories) => [
          createdCategory,
          ...currentCategories,
        ])
        setSource('supabase')
      } else {
        setCategories((currentCategories) => [
          nextCategory,
          ...currentCategories,
        ])
      }

      resetForm()
      return true
    } catch {
      setError('Could not save this category in Supabase.')
      return false
    }
  }

  const toggleCategoryStatus = async (categoryId: string) => {
    const category = categories.find(
      (currentCategory) => currentCategory.id === categoryId,
    )

    if (!category) {
      return
    }

    const nextCategory = { ...category, active: !category.active }

    if (canUseSupabaseCategories && accessToken) {
      try {
        const updatedCategory = await updateRemoteCategory(
          categoryId,
          nextCategory,
          accessToken,
        )

        setCategories((currentCategories) =>
          currentCategories.map((currentCategory) =>
            currentCategory.id === categoryId
              ? updatedCategory
              : currentCategory,
          ),
        )
        return
      } catch {
        setError('Could not update this category in Supabase.')
        return
      }
    }

    setCategories((currentCategories) =>
      currentCategories.map((currentCategory) =>
        currentCategory.id === categoryId ? nextCategory : currentCategory,
      ),
    )
  }

  const deleteCategory = async (categoryId: string) => {
    if (canUseSupabaseCategories && accessToken) {
      try {
        await deleteRemoteCategory(categoryId, accessToken)
      } catch {
        setError('Could not delete this category in Supabase.')
        return
      }
    }

    setCategories((currentCategories) =>
      currentCategories.filter((category) => category.id !== categoryId),
    )
  }

  const restoreDefaults = () => {
    setCategories(defaultCategories)
    setSource('local')
    resetForm()
  }

  return {
    categories,
    deleteCategory,
    error,
    form,
    handleSubmit,
    isLoading,
    resetForm,
    restoreDefaults,
    source,
    toggleCategoryStatus,
    updateForm,
  }
}

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

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

const createCategoryId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `category-${Date.now()}`
}

const createUniqueCategorySlug = (name: string) => {
  const suffix = `-${Date.now()}`
  const maxBaseLength = 63 - suffix.length
  const slug = createCategorySlug(name).slice(0, maxBaseLength)

  return `${slug.replace(/-$/g, '') || 'category'}${suffix}`
}

const createDraftCategory = (form: CategoryForm): Category => {
  return {
    active: form.active,
    id: createCategoryId(),
    name: form.name,
    productCount: 0,
    slug: createUniqueCategorySlug(form.name),
  }
}

export function useCategories(accessToken?: string) {
  const [categories, setCategories] = useState<Category[]>(loadCategories)
  const [editingId, setEditingId] = useState<string | null>(null)
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

  const updateForm = (field: keyof CategoryForm, value: string | boolean) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setForm(emptyCategoryForm)
    setEditingId(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextForm = {
      active: form.active,
      name: form.name.trim(),
    }

    if (!nextForm.name) {
      return false
    }

    const nextCategory = createDraftCategory(nextForm)

    setError('')

    try {
      if (canUseSupabaseCategories && accessToken) {
        if (editingId) {
          const currentCategory = categories.find(
            (category) => category.id === editingId,
          )

          if (!currentCategory) {
            return false
          }

          const updatedCategory = await updateRemoteCategory(
            {
              ...currentCategory,
              active: nextForm.active,
              name: nextForm.name,
              slug:
                currentCategory.name === nextForm.name
                  ? currentCategory.slug
                  : createUniqueCategorySlug(nextForm.name),
            },
            accessToken,
          )

          setCategories((currentCategories) =>
            currentCategories.map((category) =>
              category.id === editingId ? updatedCategory : category,
            ),
          )
        } else {
          const createdCategory = await createRemoteCategory(
            nextCategory,
            accessToken,
          )

          setCategories((currentCategories) => [
            createdCategory,
            ...currentCategories,
          ])
        }
        setSource('supabase')
      } else if (editingId) {
        setCategories((currentCategories) =>
          currentCategories.map((category) =>
            category.id === editingId
              ? {
                  ...category,
                  active: nextForm.active,
                  name: nextForm.name,
                  slug:
                    category.name === nextForm.name
                      ? category.slug
                      : createUniqueCategorySlug(nextForm.name),
                }
              : category,
          ),
        )
      } else {
        setCategories((currentCategories) => [
          nextCategory,
          ...currentCategories,
        ])
      }

      resetForm()
      return true
    } catch (saveError) {
      setError(
        getErrorMessage(saveError, 'Could not save this category in Supabase.'),
      )
      return false
    }
  }

  const editCategory = (category: Category) => {
    setEditingId(category.id)
    setForm({
      active: category.active,
      name: category.name,
    })
  }

  const toggleCategoryStatus = async (categoryId: string) => {
    const category = categories.find(
      (currentCategory) => currentCategory.id === categoryId,
    )

    if (!category) {
      return false
    }

    const nextCategory = { ...category, active: !category.active }

    if (canUseSupabaseCategories && accessToken) {
      try {
        const updatedCategory = await updateRemoteCategory(
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
        return true
      } catch (updateError) {
        setError(
          getErrorMessage(
            updateError,
            'Could not update this category in Supabase.',
          ),
        )
        return false
      }
    }

    setCategories((currentCategories) =>
      currentCategories.map((currentCategory) =>
        currentCategory.id === categoryId ? nextCategory : currentCategory,
      ),
    )
    return true
  }

  const deleteCategory = async (categoryId: string) => {
    const category = categories.find(
      (currentCategory) => currentCategory.id === categoryId,
    )

    if (!category) {
      return false
    }

    if (canUseSupabaseCategories && accessToken) {
      try {
        await deleteRemoteCategory(category, accessToken)
      } catch (deleteError) {
        setError(
          getErrorMessage(
            deleteError,
            'Could not delete this category in Supabase.',
          ),
        )
        return false
      }
    }

    setCategories((currentCategories) =>
      currentCategories.filter((category) => category.id !== categoryId),
    )
    return true
  }

  const restoreDefaults = () => {
    setCategories(defaultCategories)
    setSource('local')
    resetForm()
  }

  return {
    categories,
    deleteCategory,
    editCategory,
    editingId,
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

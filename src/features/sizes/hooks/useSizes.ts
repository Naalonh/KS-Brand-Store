import { useEffect, useState, type FormEvent } from 'react'
import { defaultSizes, emptySizeForm } from '../data/defaultSizes'
import {
  canUseSupabaseSizes,
  createRemoteSize,
  deleteRemoteSize,
  fetchSizes,
  updateRemoteSize,
} from '../services/sizesRepository'
import type { Size, SizeForm } from '../types'
import { loadSizes, saveSizes } from '../utils/sizeStorage'

export type SizesState = ReturnType<typeof useSizes>

const createSizeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `size-${Date.now()}`
}

const createSize = (form: SizeForm): Size => ({
  active: form.active,
  id: createSizeId(),
  name: form.name,
})

export function useSizes(accessToken?: string) {
  const [error, setError] = useState('')
  const [form, setForm] = useState<SizeForm>(emptySizeForm)
  const [isLoading, setIsLoading] = useState(false)
  const [sizes, setSizes] = useState<Size[]>(loadSizes)
  const [source, setSource] = useState<'local' | 'supabase'>('local')

  useEffect(() => {
    if (!canUseSupabaseSizes || source === 'local') {
      saveSizes(sizes)
    }
  }, [sizes, source])

  useEffect(() => {
    if (!canUseSupabaseSizes) {
      return
    }

    let isMounted = true

    const syncSizes = async () => {
      setIsLoading(true)
      setError('')

      try {
        const remoteSizes = await fetchSizes(accessToken)

        if (!isMounted) {
          return
        }

        setSizes(remoteSizes)
        setSource('supabase')
      } catch {
        if (!isMounted) {
          return
        }

        setError(
          'Supabase sizes table is not ready yet, so local sizes are showing.',
        )
        setSource('local')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void syncSizes()

    return () => {
      isMounted = false
    }
  }, [accessToken])

  const updateForm = (field: keyof SizeForm, value: string | boolean) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setForm(emptySizeForm)
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

    const nextSize = createSize(nextForm)

    setError('')

    try {
      if (canUseSupabaseSizes && accessToken) {
        const createdSize = await createRemoteSize(nextSize, accessToken)

        setSizes((currentSizes) => [createdSize, ...currentSizes])
        setSource('supabase')
      } else {
        setSizes((currentSizes) => [nextSize, ...currentSizes])
      }

      resetForm()
      return true
    } catch {
      setError('Could not save this size in Supabase.')
      return false
    }
  }

  const toggleSizeStatus = async (sizeId: string) => {
    const size = sizes.find((currentSize) => currentSize.id === sizeId)

    if (!size) {
      return false
    }

    const nextSize = { ...size, active: !size.active }
    setError('')

    if (canUseSupabaseSizes && accessToken) {
      try {
        const updatedSize = await updateRemoteSize(sizeId, nextSize, accessToken)

        setSizes((currentSizes) =>
          currentSizes.map((currentSize) =>
            currentSize.id === sizeId ? updatedSize : currentSize,
          ),
        )
        return true
      } catch {
        setError('Could not update this size in Supabase.')
        return false
      }
    }

    setSizes((currentSizes) =>
      currentSizes.map((currentSize) =>
        currentSize.id === sizeId ? nextSize : currentSize,
      ),
    )

    return true
  }

  const deleteSize = async (sizeId: string) => {
    setError('')

    if (canUseSupabaseSizes && accessToken) {
      try {
        await deleteRemoteSize(sizeId, accessToken)
      } catch {
        setError('Could not delete this size in Supabase.')
        return false
      }
    }

    setSizes((currentSizes) =>
      currentSizes.filter((size) => size.id !== sizeId),
    )

    return true
  }

  const restoreDefaults = () => {
    setSizes(defaultSizes)
    setSource('local')
    resetForm()
  }

  return {
    deleteSize,
    error,
    form,
    handleSubmit,
    isLoading,
    resetForm,
    restoreDefaults,
    sizes,
    source,
    toggleSizeStatus,
    updateForm,
  }
}

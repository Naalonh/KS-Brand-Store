import type { Size, SizeForm } from '../types'

export const defaultSizes: Size[] = [
  { active: true, id: 'eu-36', name: 'EU 36' },
  { active: true, id: 'eu-37', name: 'EU 37' },
  { active: true, id: 'eu-38', name: 'EU 38' },
  { active: true, id: 'eu-39', name: 'EU 39' },
  { active: true, id: 'eu-40', name: 'EU 40' },
  { active: true, id: 'eu-41', name: 'EU 41' },
  { active: true, id: 'eu-42', name: 'EU 42' },
  { active: true, id: 'eu-43', name: 'EU 43' },
  { active: true, id: 'eu-44', name: 'EU 44' },
  { active: true, id: 'eu-45', name: 'EU 45' },
  { active: true, id: 'eu-38-44', name: 'EU 38-44' },
  { active: true, id: 'eu-39-45', name: 'EU 39-45' },
  { active: true, id: 'eu-40-46', name: 'EU 40-46' },
]

export const emptySizeForm: SizeForm = {
  active: true,
  name: '',
}

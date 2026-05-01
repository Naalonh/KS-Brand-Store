export type Size = {
  active: boolean
  id: string
  name: string
}

export type SizeForm = Pick<Size, 'active' | 'name'>

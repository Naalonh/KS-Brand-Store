export const getProductCategories = (categories: string) =>
  categories
    .split(',')
    .map((category) => category.trim())
    .filter(Boolean)

export const formatProductCategories = (categories: string[]) =>
  categories.join(', ')

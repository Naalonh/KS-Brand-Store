import type { CartItem } from '../../cart/cartStorage'

const getPriceValue = (price: string) => {
  const value = Number(price.replace(/[^0-9.]/g, ''))

  return Number.isFinite(value) ? value : 0
}

const formatTotalPrice = (value: number) => `${Number(value.toFixed(2))}$`

const getSharedOrderTotal = (items: CartItem[]) =>
  items.reduce(
    (sum, item) => sum + getPriceValue(item.price) * item.quantity,
    0,
  )

export const buildSharedOrderMessage = (items: CartItem[], orderLink: string) => {
  const productLines = items
    .map((item, index) => {
      const itemTotal = getPriceValue(item.price) * item.quantity

      return [
        `Product ${index + 1}`,
        `Product name : ${item.name}`,
        `Size : ${item.size || 'Confirm in chat'}`,
        `Qty : ${item.quantity}`,
        `Price : ${formatTotalPrice(itemTotal)}`,
      ].join('\n')
    })
    .join('\n\n')
  const total = getSharedOrderTotal(items)

  return `Hello Bong, this is my order\n\n${productLines}\n\nTotal : ${formatTotalPrice(total)}\nOrder link : ${orderLink}`
}

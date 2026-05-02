import { useMemo, useState } from 'react'
import { createOrderShare } from '../orders/services/ordersRepository'
import { buildSharedOrderMessage } from '../orders/utils/sharedOrderLink'
import { useToast } from '../../shared/toast/useToast'
import { Footer } from '../../shared/layout/Footer'
import type { CartItem } from './cartStorage'
import type { Product } from '../products/types'

type CartPageProps = {
  cartItems: CartItem[]
  language: 'en' | 'km'
  onClearCart: () => void
  onRemoveItem: (productId: string, size: string) => void
  onUpdateItemSize: (
    productId: string,
    currentSize: string,
    nextSize: string,
  ) => void
  onUpdateItemQuantity: (
    productId: string,
    size: string,
    quantity: number,
  ) => void
  onViewHome: () => void
  products: Product[]
}

const getPriceValue = (price: string) => {
  const value = Number(price.replace(/[^0-9.]/g, ''))

  return Number.isFinite(value) ? value : 0
}

const formatTotalPrice = (value: number) => `${Number(value.toFixed(2))}$`

const getProductSizes = (sizes: string) =>
  sizes
    .split(',')
    .map((size) => size.trim())
    .filter(Boolean)

const getCartItemKey = (item: Pick<CartItem, 'productId' | 'size'>) =>
  `${item.productId}-${item.size}`

export function CartPage({
  cartItems,
  language,
  onClearCart,
  onRemoveItem,
  onUpdateItemSize,
  onUpdateItemQuantity,
  onViewHome,
  products,
}: CartPageProps) {
  const { showToast } = useToast()
  const [editingItemKey, setEditingItemKey] = useState('')
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isPreparingShare, setIsPreparingShare] = useState(false)
  const [sharedOrderUrl, setSharedOrderUrl] = useState('')
  const [sharedOrderSignature, setSharedOrderSignature] = useState('')
  const items = cartItems
  const cartSignature = useMemo(
    () =>
      items
        .map((item) =>
          [
            item.productId,
            item.name,
            item.size,
            item.quantity,
            item.price,
            item.image,
          ].join('|'),
        )
        .join('::'),
    [items],
  )
  const productSizesById = useMemo(
    () =>
      new Map(
        products.map((product) => [
          product.id,
          getProductSizes(product.sizes),
        ]),
      ),
    [products],
  )
  const total = items.reduce(
    (sum, item) => sum + getPriceValue(item.price) * item.quantity,
    0,
  )
  const canShareOrder = items.length > 0 && !isPreparingShare
  const sharedOrderMessage = useMemo(
    () =>
      sharedOrderUrl
        ? buildSharedOrderMessage(items, sharedOrderUrl)
        : '',
    [items, sharedOrderUrl],
  )
  const editingItem = items.find(
    (item) => getCartItemKey(item) === editingItemKey,
  )
  const editingItemSizes = editingItem
    ? productSizesById.get(editingItem.productId) ?? []
    : []
  const availableEditingSizes =
    editingItem && !editingItemSizes.includes(editingItem.size)
      ? [editingItem.size, ...editingItemSizes].filter(Boolean)
      : editingItemSizes

  const updateEditingItemSize = (nextSize: string) => {
    if (!editingItem || nextSize === editingItem.size) {
      return
    }

    onUpdateItemSize(editingItem.productId, editingItem.size, nextSize)
    setEditingItemKey(`${editingItem.productId}-${nextSize}`)
  }

  const getShareLink = (shareId: string) =>
    `${window.location.origin}/orders?shareId=${encodeURIComponent(shareId)}`

  const openShareDialog = async () => {
    if (items.length === 0 || isPreparingShare) {
      return
    }

    if (sharedOrderUrl && sharedOrderSignature === cartSignature) {
      if (navigator.share) {
        try {
          await navigator.share({
            text: sharedOrderMessage,
            title: 'KS Brand Store Order',
            url: sharedOrderUrl,
          })
          return
        } catch {
          setIsShareDialogOpen(true)
          return
        }
      }

      setIsShareDialogOpen(true)
      return
    }

    setIsPreparingShare(true)

    try {
      const orderShare = await createOrderShare(items)
      const nextSharedOrderUrl = getShareLink(orderShare.id)
      const nextSharedOrderMessage = buildSharedOrderMessage(
        items,
        nextSharedOrderUrl,
      )

      setSharedOrderUrl(nextSharedOrderUrl)
      setSharedOrderSignature(cartSignature)

      if (navigator.share) {
        try {
          await navigator.share({
            text: nextSharedOrderMessage,
            title: 'KS Brand Store Order',
            url: nextSharedOrderUrl,
          })
          return
        } catch {
          setIsShareDialogOpen(true)
          return
        }
      }

      setIsShareDialogOpen(true)
    } catch (caughtError) {
      showToast({
        message:
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not prepare order link.',
        tone: 'error',
      })
    } finally {
      setIsPreparingShare(false)
    }
  }

  return (
    <>
      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-14 pt-[15px] sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-start lg:px-8 lg:py-20">
          <div>
            <div className="grid gap-4">
              {items.length > 0 ? (
                items.map((item) => {
                  const itemKey = getCartItemKey(item)

                  return (
                    <article
                      key={itemKey}
                      className="grid grid-cols-[6.75rem_minmax(0,1fr)] overflow-hidden rounded-[10px] border border-[#9C7A42]/40 bg-[#130E0D] shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:grid-cols-[10rem_1fr]"
                    >
                      <img
                        src={item.image}
                        alt={`${item.name} selected shoe`}
                        className="h-full min-h-28 w-full bg-[#000000] object-cover sm:min-h-40"
                      />
                      <div className="grid min-w-0 gap-3 p-4 sm:gap-4 sm:p-5">
                        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                          <h2 className="truncate text-lg font-black text-[#FFF8E7] sm:text-2xl">
                            {item.name}
                          </h2>
                          <p className="shrink-0 text-base font-black text-[#E4B45A] sm:text-xl">
                            {formatTotalPrice(
                              getPriceValue(item.price) * item.quantity,
                            )}
                          </p>
                        </div>
                        <div className="flex min-w-0 items-center justify-between gap-3 text-xs font-semibold text-[#B8A98A] sm:text-sm">
                          <p className="min-w-0 truncate">
                            Size: {item.size || 'Confirm in Messenger'}
                          </p>
                          <p className="shrink-0">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center justify-end gap-4 text-xs font-black uppercase tracking-[0.14em]">
                          <button
                            type="button"
                            onClick={() => setEditingItemKey(itemKey)}
                            className="text-[#E4B45A] transition hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onRemoveItem(item.productId, item.size)
                            }
                            className="text-[#C76A60] transition hover:text-[#E28E83] focus:outline-none focus:ring-2 focus:ring-[#E28E83]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })
              ) : (
                <article className="flex min-h-[23rem] flex-col items-center justify-center overflow-hidden rounded-[10px] border border-[#9C7A42]/40 bg-[#130E0D] p-6 text-center shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
                  <h2 className="text-2xl font-black text-[#FFF8E7]">
                    Your cart is empty.
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-[#B8A98A]">
                    Add a product from the collection first.
                  </p>
                </article>
              )}
            </div>
          </div>

          <aside className="rounded-3xl border border-[#9C7A42]/40 bg-[#130E0D] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#E4B45A]">
              Cart Summary
            </p>

            <div className="mt-6 grid gap-4 text-sm font-semibold text-[#B8A98A]">
              <div className="flex items-center justify-between gap-4 border-b border-[#9C7A42]/30 pb-4">
                <span>Items</span>
                <span className="text-right text-[#FFF8E7]">
                  {items.length}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-[#9C7A42]/30 pb-4">
                <span>Quantity</span>
                <span className="text-[#FFF8E7]">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 text-base">
                <span>Total</span>
                <span className="text-xl font-black text-[#E4B45A]">
                  {formatTotalPrice(total)}
                </span>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={openShareDialog}
                disabled={!canShareOrder}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#E4B45A] px-7 text-center text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPreparingShare ? 'Preparing...' : 'Share To Admin'}
              </button>
            </div>
            {items.length > 0 ? (
              <button
                type="button"
                onClick={onClearCart}
                className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#9C7A42]/70 bg-[#130E0D] px-7 text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#000000]"
              >
                Clear Cart
              </button>
            ) : null}
            <button
              type="button"
              onClick={onViewHome}
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#9C7A42]/70 bg-[#130E0D] px-7 text-sm font-black uppercase tracking-[0.14em] text-[#FFF8E7] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#000000]"
            >
              Continue Browsing
            </button>
          </aside>
        </section>
      </main>

      {editingItem ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000]/75 p-4"
          onMouseDown={() => setEditingItemKey('')}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-edit-title"
            className="w-full max-w-sm overflow-hidden rounded-[10px] border border-[#9C7A42]/45 bg-[#130E0D] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#9C7A42]/30 px-5 py-4">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]">
                Edit Item
              </p>
              <button
                type="button"
                onClick={() => setEditingItemKey('')}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E4B45A]/50 bg-[#000000] text-lg font-black text-[#FDD97D] transition hover:bg-[#2A0F0A] focus:outline-none focus:ring-2 focus:ring-[#FDD97D]"
                aria-label="Close edit item popup"
              >
                X
              </button>
            </div>

            <div className="grid gap-4 p-5">
              <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4">
                <img
                  src={editingItem.image}
                  alt={`${editingItem.name} selected shoe`}
                  className="aspect-square w-full rounded-[8px] bg-[#000000] object-cover"
                />
                <div className="min-w-0">
                  <h2
                    id="cart-edit-title"
                    className="truncate text-xl font-black text-[#FFF8E7]"
                  >
                    {editingItem.name}
                  </h2>
                  <p className="mt-1 text-lg font-black text-[#E4B45A]">
                    {formatTotalPrice(
                      getPriceValue(editingItem.price) * editingItem.quantity,
                    )}
                  </p>
                  <p className="mt-2 truncate text-sm font-semibold text-[#B8A98A]">
                    Size: {editingItem.size || 'Confirm in Messenger'}
                  </p>
                </div>
              </div>

              {availableEditingSizes.length > 0 ? (
                <div className="rounded-[8px] bg-[#000000] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8A98A]">
                    Size
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {availableEditingSizes.map((size) => {
                      const isSelected = editingItem.size === size

                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => updateEditingItemSize(size)}
                          className={`min-h-9 rounded-[8px] border px-3 text-xs font-black transition focus:outline-none focus:ring-2 focus:ring-[#FDD97D] ${
                            isSelected
                              ? 'border-[#E4B45A] bg-[#E4B45A] text-[#000000]'
                              : 'border-[#9C7A42]/45 bg-[#130E0D] text-[#FFF8E7] hover:border-[#E4B45A] hover:text-[#FDD97D]'
                          }`}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              <div className="rounded-[8px] bg-[#000000] p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8A98A]">
                  Quantity
                </p>
                <div className="mt-3 flex min-h-11 overflow-hidden rounded-[8px] border border-[#9C7A42]/45 bg-[#130E0D]">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateItemQuantity(
                        editingItem.productId,
                        editingItem.size,
                        editingItem.quantity - 1,
                      )
                    }
                    className="flex w-12 items-center justify-center text-xl font-black text-[#B8A98A] transition hover:bg-[#2A0F0A] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FDD97D]"
                    aria-label={`Decrease ${editingItem.name} quantity`}
                  >
                    -
                  </button>
                  <span className="flex min-w-0 flex-1 items-center justify-center border-x border-[#9C7A42]/25 text-base font-black text-[#FFF8E7]">
                    {editingItem.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateItemQuantity(
                        editingItem.productId,
                        editingItem.size,
                        editingItem.quantity + 1,
                      )
                    }
                    className="flex w-12 items-center justify-center text-xl font-black text-[#B8A98A] transition hover:bg-[#2A0F0A] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FDD97D]"
                    aria-label={`Increase ${editingItem.name} quantity`}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingItemKey('')}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#E4B45A] px-6 text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isShareDialogOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000]/75 p-4"
          onMouseDown={() => setIsShareDialogOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-share-title"
            className="w-full max-w-sm overflow-hidden rounded-[10px] border border-[#9C7A42]/45 bg-[#130E0D] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#9C7A42]/30 px-5 py-4">
              <p
                id="cart-share-title"
                className="text-sm font-black uppercase tracking-[0.18em] text-[#E4B45A]"
              >
                Share Order
              </p>
              <button
                type="button"
                onClick={() => setIsShareDialogOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E4B45A]/50 bg-[#000000] text-lg font-black text-[#FDD97D] transition hover:bg-[#2A0F0A] focus:outline-none focus:ring-2 focus:ring-[#FDD97D]"
                aria-label="Close share order popup"
              >
                X
              </button>
            </div>

            <div className="grid gap-3 p-5">
              {navigator.share ? (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.share({
                        text: sharedOrderMessage,
                        title: 'KS Brand Store Order',
                        url: sharedOrderUrl,
                      })
                      setIsShareDialogOpen(false)
                    } catch {
                      showToast({
                        message: 'Share was not completed.',
                        tone: 'warning',
                      })
                    }
                  }}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#E4B45A] px-6 text-sm font-black uppercase tracking-[0.14em] text-[#000000] transition hover:bg-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
                >
                  Share
                </button>
              ) : null}
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(sharedOrderUrl)
                  showToast({
                    message: 'Order link copied.',
                    tone: 'success',
                  })
                }}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#9C7A42]/70 px-6 text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Footer language={language} />
    </>
  )
}

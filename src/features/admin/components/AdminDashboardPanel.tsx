import { useState } from 'react'
import type { CategoriesState } from '../../categories/hooks/useCategories'
import { useOrders } from '../../orders/hooks/useOrders'
import type { Order } from '../../orders/types'
import type { ProductsState } from '../../products/hooks/useProducts'
import type { SizesState } from '../../sizes/hooks/useSizes'
import type { AdminSection } from '../adminSections'
import { AdminSummaryCard } from './AdminSummaryCard'

type AdminDashboardPanelProps = {
  accessToken: string
  categoriesState: CategoriesState
  onOpenSection: (section: AdminSection) => void
  productsState: ProductsState
  sizesState: SizesState
}

type SalesRange = 'today' | 'week' | 'month' | 'year'

const salesRangeOptions: Array<{
  label: string
  value: SalesRange
}> = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
]

const getPriceValue = (price: string) => {
  const value = Number(price.replace(/[^0-9.]/g, ''))

  return Number.isFinite(value) ? value : 0
}

const formatCurrency = (value: number) => `${Number(value.toFixed(2))}$`

const getStartOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

const addHours = (date: Date, hours: number) => {
  const nextDate = new Date(date)
  nextDate.setHours(nextDate.getHours() + hours)
  return nextDate
}

const getStartOfWeek = (date: Date) => {
  const startOfDay = getStartOfDay(date)
  const day = startOfDay.getDay()

  return addDays(startOfDay, day === 0 ? -6 : 1 - day)
}

const monthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const getSalesBuckets = (range: SalesRange, referenceDate = new Date()) => {
  if (range === 'today') {
    const today = getStartOfDay(referenceDate)

    return [
      { end: addHours(today, 6), label: '12A', start: today },
      { end: addHours(today, 12), label: '6A', start: addHours(today, 6) },
      { end: addHours(today, 18), label: '12P', start: addHours(today, 12) },
      { end: addDays(today, 1), label: '6P', start: addHours(today, 18) },
    ]
  }

  if (range === 'week') {
    const weekStart = getStartOfWeek(referenceDate)
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    return labels.map((label, index) => ({
      end: addDays(weekStart, index + 1),
      label,
      start: addDays(weekStart, index),
    }))
  }

  if (range === 'month') {
    const monthStart = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      1,
    )
    const nextMonthStart = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() + 1,
      1,
    )

    return [
      { end: addDays(monthStart, 7), label: 'W1', start: monthStart },
      {
        end: addDays(monthStart, 14),
        label: 'W2',
        start: addDays(monthStart, 7),
      },
      {
        end: addDays(monthStart, 21),
        label: 'W3',
        start: addDays(monthStart, 14),
      },
      {
        end: nextMonthStart,
        label: 'W4',
        start: addDays(monthStart, 21),
      },
    ]
  }

  return monthLabels.map((label, index) => ({
    end: new Date(referenceDate.getFullYear(), index + 1, 1),
    label,
    start: new Date(referenceDate.getFullYear(), index, 1),
  }))
}

const getSalesData = (orders: Order[], range: SalesRange) => {
  const buckets = getSalesBuckets(range)
  const activeOrders = orders.filter((order) => order.status !== 'cancelled')

  return buckets.map((bucket) => {
    const bucketOrders = activeOrders.filter((order) => {
      const createdAt = new Date(order.createdAt)

      return createdAt >= bucket.start && createdAt < bucket.end
    })

    return {
      label: bucket.label,
      orders: bucketOrders.length,
      revenue: bucketOrders.reduce(
        (total, order) => total + getPriceValue(order.totalPrice),
        0,
      ),
    }
  })
}

export function AdminDashboardPanel({
  accessToken,
  categoriesState,
  onOpenSection,
  productsState,
  sizesState,
}: AdminDashboardPanelProps) {
  const ordersState = useOrders(accessToken)
  const [isSalesRangeOpen, setIsSalesRangeOpen] = useState(false)
  const [salesRange, setSalesRange] = useState<SalesRange>('week')
  const totalProducts = productsState.products.length
  const activeProducts = productsState.activeProducts.length
  const hiddenProducts = totalProducts - activeProducts
  const discountedProducts = productsState.products.filter((product) =>
    product.discountPrice?.trim(),
  ).length
  const dashboardErrors = [
    productsState.error,
    categoriesState.error,
    sizesState.error,
    ordersState.error,
  ].filter(Boolean)
  const currentSales = getSalesData(ordersState.orders, salesRange)
  const salesRangeLabel =
    salesRangeOptions.find((option) => option.value === salesRange)?.label ??
    'This Week'
  const totalRevenue = currentSales.reduce(
    (total, item) => total + item.revenue,
    0,
  )
  const totalOrders = currentSales.reduce((total, item) => total + item.orders, 0)
  const maxRevenue = Math.max(...currentSales.map((item) => item.revenue), 1)
  const linePoints = currentSales
    .map((item, index) => {
      const x =
        currentSales.length === 1
          ? 50
          : 8 + (index / (currentSales.length - 1)) * 84
      const y = 86 - (item.revenue / maxRevenue) * 68

      return `${x},${y}`
    })
    .join(' ')
  const quickActions: Array<{
    label: string
    section: AdminSection
    tone: 'primary' | 'secondary'
  }> = [
    { label: 'Manage Products', section: 'products', tone: 'primary' },
    { label: 'Review Orders', section: 'orders', tone: 'secondary' },
    { label: 'Edit Categories', section: 'categories', tone: 'secondary' },
    { label: 'Manage Sizes', section: 'size', tone: 'secondary' },
  ]

  return (
    <div className="grid gap-6">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AdminSummaryCard
          icon="product"
          label="Total Products"
          value={totalProducts}
        />
        <AdminSummaryCard
          icon="active"
          label="Active"
          value={activeProducts}
        />
        <AdminSummaryCard
          icon="category"
          label="Categories"
          value={categoriesState.categories.length}
        />
        <AdminSummaryCard
          icon="size"
          label="Sizes"
          value={sizesState.sizes.length}
        />
      </section>

      <section className="grid gap-4">
        <div className="rounded-[10px] border border-[#9C7A42]/25 bg-[#000000]">
          <div className="flex flex-col justify-between gap-3 border-b border-[#9C7A42]/25 bg-[#130E0D] px-4 py-4 sm:flex-row sm:items-center">
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[#E4B45A]">
              Sales Overview
            </h2>
            <div
              className="relative w-full sm:w-44"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setIsSalesRangeOpen(false)
                }
              }}
            >
              <button
                type="button"
                onClick={() => setIsSalesRangeOpen((isOpen) => !isOpen)}
                className="inline-flex min-h-10 w-full cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-[#9C7A42]/35 bg-[#000000] px-4 text-left text-sm font-black text-[#FFF8E7] outline-none transition hover:border-[#FDD97D] focus:border-[#E4B45A] focus:ring-2 focus:ring-[#E4B45A]/35"
                aria-haspopup="listbox"
                aria-expanded={isSalesRangeOpen}
              >
                <span className="min-w-0 truncate">{salesRangeLabel}</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className={`h-4 w-4 shrink-0 text-[#E4B45A] transition-transform ${
                    isSalesRangeOpen ? '' : 'rotate-180'
                  }`}
                >
                  <path
                    d="M4 10L8 6L12 10"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.25"
                  />
                </svg>
              </button>
              {isSalesRangeOpen ? (
                <div
                  role="listbox"
                  className="absolute right-0 top-full z-20 mt-2 w-full overflow-hidden rounded-[10px] border border-[#9C7A42]/45 bg-[#000000] shadow-[0_18px_45px_rgba(0,0,0,0.65)]"
                >
                  {salesRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={salesRange === option.value}
                      onClick={() => {
                        setSalesRange(option.value)
                        setIsSalesRangeOpen(false)
                      }}
                      className={`block min-h-10 w-full cursor-pointer px-4 text-left text-xs font-black uppercase tracking-[0.1em] transition ${
                        salesRange === option.value
                          ? 'bg-[#E4B45A] text-[#000000]'
                          : 'text-[#B8A98A] hover:bg-[#130E0D] hover:text-[#FDD97D]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <DashboardMetric label="Revenue" value={formatCurrency(totalRevenue)} />
              <DashboardMetric label="Orders" value={totalOrders} />
            </div>

            <div className="rounded-[10px] border border-[#9C7A42]/25 bg-[#130E0D] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.12em]">
                  <span className="inline-flex items-center gap-2 text-[#E4B45A]">
                    <span className="h-2 w-2 rounded-full bg-[#E4B45A]" />
                    Revenue
                  </span>
                  <span className="inline-flex items-center gap-2 text-[#B8A98A]">
                    <span className="h-2 w-2 rounded-full bg-[#B8A98A]" />
                    Orders
                  </span>
                </div>
                <span className="text-xs font-normal uppercase tracking-[0.12em] text-[#B8A98A]">
                  {ordersState.isLoading ? 'Loading orders' : 'Live orders'}
                </span>
              </div>

              <div className="mt-5 h-64">
                <svg
                  aria-label="Sales revenue and orders chart"
                  className="h-full w-full overflow-visible"
                  role="img"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="sales-chart-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#E4B45A" stopOpacity="0.32" />
                      <stop offset="100%" stopColor="#E4B45A" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {[18, 35, 52, 69, 86].map((line) => (
                    <line
                      key={line}
                      x1="0"
                      x2="100"
                      y1={line}
                      y2={line}
                      stroke="#9C7A42"
                      strokeOpacity="0.22"
                      strokeWidth="0.35"
                    />
                  ))}
                  <polygon
                    fill="url(#sales-chart-fill)"
                    points={`8,86 ${linePoints} 92,86`}
                  />
                  <polyline
                    fill="none"
                    points={linePoints}
                    stroke="#E4B45A"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.6"
                    vectorEffect="non-scaling-stroke"
                  />
                  {currentSales.map((item, index) => {
                    const x =
                      currentSales.length === 1
                        ? 50
                        : 8 + (index / (currentSales.length - 1)) * 84
                    const orderHeight =
                      (item.orders /
                        Math.max(...currentSales.map((sample) => sample.orders), 1)) *
                      42

                    return (
                      <g key={item.label}>
                        <rect
                          x={x - 1.2}
                          y={86 - orderHeight}
                          width="2.4"
                          height={orderHeight}
                          rx="1"
                          fill="#B8A98A"
                          opacity="0.7"
                        />
                        <circle
                          cx={x}
                          cy={86 - (item.revenue / maxRevenue) * 68}
                          fill="#000000"
                          r="1.7"
                          stroke="#FDD97D"
                          strokeWidth="0.9"
                          vectorEffect="non-scaling-stroke"
                        />
                      </g>
                    )
                  })}
                </svg>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[0.68rem] font-black uppercase tracking-[0.08em] text-[#B8A98A] sm:flex sm:justify-between">
                {currentSales.map((item) => (
                  <span key={item.label}>{item.label}</span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <DashboardMetric label="Hidden products" value={hiddenProducts} />
              <DashboardMetric label="Discounted products" value={discountedProducts} />
              <DashboardMetric label="Low stock" value={0} />
              <DashboardMetric label="Out of stock" value={0} />
            </div>
          </div>
        </div>

        <div className="rounded-[10px] border border-[#9C7A42]/25 bg-[#000000]">
          <div className="border-b border-[#9C7A42]/25 bg-[#130E0D] px-4 py-4">
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[#E4B45A]">
              Quick Actions
            </h2>
          </div>
          <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => (
              <button
                key={action.section}
                type="button"
                onClick={() => onOpenSection(action.section)}
                className={`inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-[10px] px-4 text-center text-xs font-black uppercase tracking-[0.12em] transition focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000] ${
                  action.tone === 'primary'
                    ? 'bg-[#E4B45A] text-[#000000] hover:bg-[#FDD97D]'
                    : 'border border-[#9C7A42]/70 text-[#B8A98A] hover:border-[#FDD97D] hover:text-[#FDD97D]'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {dashboardErrors.length > 0 ? (
        <section className="grid gap-3">
          {dashboardErrors.map((error) => (
            <p
              key={error}
              className="rounded-[10px] border border-[#E46D5A]/45 bg-[#2A0F0A] px-4 py-3 text-sm font-semibold text-[#FFD0C7]"
            >
              {error}
            </p>
          ))}
        </section>
      ) : null}

    </div>
  )
}

function DashboardMetric({
  label,
  value,
}: {
  label: string
  value: number | string
}) {
  return (
    <div className="rounded-[10px] border border-[#9C7A42]/25 bg-[#130E0D] p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#B8A98A]">
        {label}
      </p>
      <p className="mt-3 text-2xl font-normal text-[#FFF8E7]">{value}</p>
    </div>
  )
}

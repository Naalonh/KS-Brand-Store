import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'



type ProductImagePickerProps = {
  accessToken?: string
  imageUrl: string
  onBlobChange?: (blob: Blob | null) => void
  onChange: (imageUrl: string) => void
  productId: string
}

type CropState = {
  boxSize: number
  offsetX: number
  offsetY: number
  zoom: number
}

const emptyCrop: CropState = {
  boxSize: 100,
  offsetX: 0,
  offsetY: 0,
  zoom: 1,
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

export function ProductImagePicker({
  imageUrl,
  onBlobChange,
  onChange,
}: ProductImagePickerProps) {
  const captureInputRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [cropSource, setCropSource] = useState('')
  const [cropError, setCropError] = useState('')

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setCropError('')
    setCropSource(await fileToDataUrl(file))
  }

  const handleCrop = async (blob: Blob) => {
    setCropError('')
    try {
      const previewUrl = await blobToDataUrl(blob)
      onChange(previewUrl)
      onBlobChange?.(blob)
      setCropSource('')
    } catch {
      setCropError('Could not process this image. Please try another image.')
    }
  }

  return (
    <div className="grid gap-3">
      <span className="text-sm font-black uppercase tracking-[0.14em] text-[#B8A98A]">
        Product Image
      </span>

      <div className="grid gap-4 rounded-2xl border border-[#9C7A42]/35 bg-[#000000] p-3 sm:p-4 md:grid-cols-[12rem_1fr]">
        <div className="aspect-square overflow-hidden rounded-[10px] border border-[#9C7A42]/25 bg-[#130E0D]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Selected product"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center px-4 text-center text-xs font-black uppercase tracking-[0.12em] text-[#B8A98A]">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-4">
          <p className="text-sm leading-6 text-[#B8A98A]">
            Upload a product photo or take one from your device camera. You can
            crop the image before it is saved.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] border border-[#E4B45A]/60 px-4 text-sm font-black uppercase tracking-[0.1em] text-[#E4B45A] transition hover:bg-[#E4B45A] hover:text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#000000] sm:px-5 sm:tracking-[0.12em]"
            >
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => {
                setCropError('')
                captureInputRef.current?.click()
              }}
              className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 px-4 text-sm font-black uppercase tracking-[0.1em] text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#000000] sm:px-5 sm:tracking-[0.12em]"
            >
              Capture
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={captureInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {cropError ? (
            <p className="rounded-[10px] border border-[#9C7A42]/35 px-4 py-3 text-sm font-semibold text-[#FDD97D]">
              {cropError}
            </p>
          ) : null}
        </div>
      </div>

      {cropSource ? (
        <ImageCropModal
          imageSource={cropSource}
          isBusy={false}
          onCancel={() => setCropSource('')}
          onCrop={handleCrop}
        />
      ) : null}

    </div>
  )
}

type ImageCropModalProps = {
  imageSource: string
  isBusy: boolean
  onCancel: () => void
  onCrop: (image: Blob) => void
}

function ImageCropModal({
  imageSource,
  isBusy,
  onCancel,
  onCrop,
}: ImageCropModalProps) {
  const imageRef = useRef<HTMLImageElement | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)
  const [crop, setCrop] = useState(emptyCrop)
  const [imageSize, setImageSize] = useState({ height: 1, width: 1 })
  const [previewSize, setPreviewSize] = useState({ height: 1, width: 1 })
  const imageAspectRatio = imageSize.width / imageSize.height
  const previewAspectRatio = previewSize.width / previewSize.height
  const baseImageWidth = Math.min(
    previewAspectRatio > imageAspectRatio
      ? previewSize.height * imageAspectRatio
      : previewSize.width,
    previewSize.width,
  )
  const baseImageHeight = Math.min(
    previewAspectRatio > imageAspectRatio
      ? previewSize.height
      : previewSize.width / imageAspectRatio,
    previewSize.height,
  )
  const scaledImageWidth = baseImageWidth * crop.zoom
  const scaledImageHeight = baseImageHeight * crop.zoom
  const cropBaseSide = Math.max(Math.min(baseImageWidth, baseImageHeight), 1)
  const cropBoxSize = cropBaseSide * (crop.boxSize / 100)
  const cropTravelX = Math.max((scaledImageWidth - cropBoxSize) / 2, 0)
  const cropTravelY = Math.max((scaledImageHeight - cropBoxSize) / 2, 0)
  const cropLeft =
    previewSize.width / 2 -
    cropBoxSize / 2 +
    (crop.offsetX / 100) * cropTravelX
  const cropTop =
    previewSize.height / 2 -
    cropBoxSize / 2 +
    (crop.offsetY / 100) * cropTravelY
  const selectionSize = Math.round(cropBoxSize)
  const zoomPercent = Math.round(crop.zoom * 100)

  useEffect(() => {
    const preview = previewRef.current

    if (!preview) {
      return
    }

    const updatePreviewSize = () => {
      const rect = preview.getBoundingClientRect()
      setPreviewSize({
        height: Math.max(rect.height, 1),
        width: Math.max(rect.width, 1),
      })
    }

    updatePreviewSize()

    const observer = new ResizeObserver(updatePreviewSize)
    observer.observe(preview)

    return () => observer.disconnect()
  }, [imageAspectRatio])

  const changeZoom = (amount: number) => {
    setCrop((currentCrop) => ({
      ...currentCrop,
      zoom: clamp(currentCrop.zoom + amount, 1, 3),
    }))
  }

  const beginCropDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) {
      return
    }

    event.preventDefault()

    const startX = event.clientX
    const startY = event.clientY
    const startOffsetX = crop.offsetX
    const startOffsetY = crop.offsetY
    const startTravelX = Math.max(cropTravelX, 1)
    const startTravelY = Math.max(cropTravelY, 1)

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const nextOffsetX =
        startOffsetX + ((moveEvent.clientX - startX) / startTravelX) * 100
      const nextOffsetY =
        startOffsetY + ((moveEvent.clientY - startY) / startTravelY) * 100

      setCrop((currentCrop) => ({
        ...currentCrop,
        offsetX: clamp(nextOffsetX, -100, 100),
        offsetY: clamp(nextOffsetY, -100, 100),
      }))
    }

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const beginCropResize = (
    event: ReactPointerEvent<HTMLButtonElement>,
    directionX: number,
    directionY: number,
  ) => {
    event.preventDefault()
    event.stopPropagation()

    const preview = previewRef.current

    if (!preview) {
      return
    }

    const rect = preview.getBoundingClientRect()
    const startX = event.clientX
    const startY = event.clientY
    const startSize = crop.boxSize
    const startMinSide = Math.max(cropBaseSide, Math.min(rect.width, rect.height), 1)

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = (moveEvent.clientX - startX) * directionX
      const deltaY = (moveEvent.clientY - startY) * directionY
      const delta = (deltaX + deltaY) / 2
      const nextSize = startSize + (delta * 2 * 100) / startMinSide

      setCrop((currentCrop) => ({
        ...currentCrop,
        boxSize: clamp(nextSize, 30, 100),
      }))
    }

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const createCroppedImage = () => {
    const image = imageRef.current

    if (!image) {
      return
    }

    const naturalWidth = image.naturalWidth
    const naturalHeight = image.naturalHeight
    const previewWidth = Math.max(previewRef.current?.clientWidth || 1, 1)
    const previewHeight = Math.max(previewRef.current?.clientHeight || 1, 1)
    const previewRatio = previewWidth / previewHeight
    const imageRatio = naturalWidth / naturalHeight
    const baseWidth =
      previewRatio > imageRatio ? previewHeight * imageRatio : previewWidth
    const baseHeight =
      previewRatio > imageRatio ? previewHeight : previewWidth / imageRatio
    const scaledWidth = baseWidth * crop.zoom
    const scaledHeight = baseHeight * crop.zoom
    const boxSize = Math.min(baseWidth, baseHeight) * (crop.boxSize / 100)
    const travelX = Math.max((scaledWidth - boxSize) / 2, 0)
    const travelY = Math.max((scaledHeight - boxSize) / 2, 0)
    const boxCenterX = previewWidth / 2 + (crop.offsetX / 100) * travelX
    const boxCenterY = previewHeight / 2 + (crop.offsetY / 100) * travelY
    const scaledLeft = (previewWidth - scaledWidth) / 2
    const scaledTop = (previewHeight - scaledHeight) / 2
    const sourceCenterX =
      ((boxCenterX - scaledLeft) / scaledWidth) * naturalWidth
    const sourceCenterY =
      ((boxCenterY - scaledTop) / scaledHeight) * naturalHeight
    const sourceSize = Math.min(
      (boxSize / scaledWidth) * naturalWidth,
      naturalWidth,
      naturalHeight,
    )
    const sourceX = clamp(
      sourceCenterX - sourceSize / 2,
      0,
      naturalWidth - sourceSize,
    )
    const sourceY = clamp(
      sourceCenterY - sourceSize / 2,
      0,
      naturalHeight - sourceSize,
    )
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 1200

    const context = canvas.getContext('2d')

    if (!context) {
      return
    }

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      canvas.width,
      canvas.height,
    )

    canvas.toBlob((blob) => {
      if (blob) {
        onCrop(blob)
      }
    }, 'image/webp', 0.9)
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[#000000]/80 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
      <div className="max-h-[calc(100vh-1.5rem)] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#9C7A42]/35 bg-[#130E0D] shadow-[0_30px_90px_rgba(0,0,0,0.75)] sm:max-h-[calc(100vh-3rem)] sm:rounded-[22px]">
        <div className="flex min-h-16 items-center justify-between gap-3 border-b border-[#9C7A42]/25 px-4 py-3 sm:min-h-20 sm:gap-4 sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] border border-[#E4B45A]/35 bg-[#000000] text-lg font-black text-[#E4B45A]">
              +
            </span>
            <div className="min-w-0">
              <h3 className="text-lg font-black text-[#FFF8E7] sm:text-xl">Crop Image</h3>
              <p className="mt-1 text-sm font-semibold text-[#B8A98A]">
                Square product selection
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/70 text-xl font-black text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
          >
            x
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#9C7A42]/25 bg-[#0B0807] px-5 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-[#B8A98A]">
              Zoom
            </span>
            <button
              type="button"
              onClick={() => changeZoom(-0.1)}
              disabled={crop.zoom <= 1 || isBusy}
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/45 text-lg font-black text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#0B0807]"
            >
              -
            </button>
            <span className="min-w-14 text-center text-sm font-black text-[#FFF8E7]">
              {zoomPercent}%
            </span>
            <button
              type="button"
              onClick={() => changeZoom(0.1)}
              disabled={crop.zoom >= 3 || isBusy}
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/45 text-lg font-black text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#0B0807]"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setCrop(emptyCrop)}
              disabled={isBusy}
              className="inline-flex h-9 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/45 px-4 text-sm font-black text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#0B0807]"
            >
              Reset
            </button>
          </div>
          <span className="text-xs font-black uppercase tracking-[0.14em] text-[#9C7A42]">
            Drag box to move
          </span>
        </div>

        <div className="grid gap-4 px-4 py-4 sm:px-5 sm:py-5">
          <div
            ref={previewRef}
            className="relative mx-auto max-h-[54vh] w-full max-w-[calc(54vh*var(--image-ratio))] overflow-hidden border border-[#9C7A42]/35 bg-[#000000]"
            style={
              {
                '--image-ratio': imageAspectRatio,
                aspectRatio: imageAspectRatio,
                backgroundImage:
                  'repeating-conic-gradient(#050403 0% 25%, #0B0807 0% 50%)',
                backgroundSize: '22px 22px',
              } as CSSProperties
            }
          >
            <img
              ref={imageRef}
              src={imageSource}
              alt="Crop preview"
              className="absolute left-1/2 top-1/2 max-w-none select-none"
              onLoad={(event) => {
                setImageSize({
                  height: event.currentTarget.naturalHeight,
                  width: event.currentTarget.naturalWidth,
                })
              }}
              style={{
                height: `${baseImageHeight}px`,
                transform: `translate(-50%, -50%) scale(${crop.zoom})`,
                width: `${baseImageWidth}px`,
              }}
            />
            <div
              onPointerDown={beginCropDrag}
              className="absolute cursor-move border-2 border-[#E4B45A] shadow-[0_0_0_9999px_rgba(0,0,0,0.5),0_0_20px_rgba(228,180,90,0.3)]"
              style={{
                height: `${cropBoxSize}px`,
                left: `${cropLeft}px`,
                top: `${cropTop}px`,
                width: `${cropBoxSize}px`,
              }}
            >
              <span className="pointer-events-none absolute left-1/3 top-0 h-full border-l border-[#FFF8E7]/20" />
              <span className="pointer-events-none absolute left-2/3 top-0 h-full border-l border-[#FFF8E7]/20" />
              <span className="pointer-events-none absolute left-0 top-1/3 w-full border-t border-[#FFF8E7]/20" />
              <span className="pointer-events-none absolute left-0 top-2/3 w-full border-t border-[#FFF8E7]/20" />
              <button
                type="button"
                aria-label="Resize crop from top left"
                onPointerDown={(event) => beginCropResize(event, -1, -1)}
                className="pointer-events-auto absolute -left-[6px] -top-[6px] h-3 w-3 cursor-nwse-resize rounded-[2px] border border-[#E4B45A] bg-[#FFF8E7] shadow-[0_0_0_1px_rgba(0,0,0,0.45)] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              />
              <button
                type="button"
                aria-label="Resize crop from top right"
                onPointerDown={(event) => beginCropResize(event, 1, -1)}
                className="pointer-events-auto absolute -right-[6px] -top-[6px] h-3 w-3 cursor-nesw-resize rounded-[2px] border border-[#E4B45A] bg-[#FFF8E7] shadow-[0_0_0_1px_rgba(0,0,0,0.45)] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              />
              <button
                type="button"
                aria-label="Resize crop from bottom left"
                onPointerDown={(event) => beginCropResize(event, -1, 1)}
                className="pointer-events-auto absolute -bottom-[6px] -left-[6px] h-3 w-3 cursor-nesw-resize rounded-[2px] border border-[#E4B45A] bg-[#FFF8E7] shadow-[0_0_0_1px_rgba(0,0,0,0.45)] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              />
              <button
                type="button"
                aria-label="Resize crop from bottom right"
                onPointerDown={(event) => beginCropResize(event, 1, 1)}
                className="pointer-events-auto absolute -bottom-[6px] -right-[6px] h-3 w-3 cursor-nwse-resize rounded-[2px] border border-[#FFF8E7] bg-[#E4B45A] shadow-[0_0_0_1px_rgba(0,0,0,0.45)] focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex min-h-10 items-center justify-between gap-3 rounded-[10px] border border-[#9C7A42]/35 bg-[#0B0807] px-4 text-sm font-black text-[#B8A98A]">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#E4B45A]" />
                Selection
              </span>
              <span className="text-[#FFF8E7]">
                {selectionSize} x {selectionSize} px
              </span>
            </div>
            <div className="flex min-h-10 items-center justify-between gap-3 rounded-[10px] border border-[#9C7A42]/35 bg-[#0B0807] px-4 text-sm font-black text-[#B8A98A]">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#FDD97D]" />
                File
              </span>
              <span className="text-[#FFF8E7]">Product image</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#9C7A42]/25 px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#9C7A42]/45 px-6 text-sm font-black text-[#B8A98A] transition hover:border-[#FDD97D] hover:text-[#FDD97D] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#E4B45A] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={createCroppedImage}
            disabled={isBusy}
            className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] bg-[#E4B45A] px-6 text-sm font-black text-[#000000] transition hover:bg-[#FDD97D] disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-[#FDD97D] focus:ring-offset-2 focus:ring-offset-[#130E0D]"
          >
            {isBusy ? 'Saving...' : 'Crop Image'}
          </button>
        </div>
      </div>
    </div>
  )
}

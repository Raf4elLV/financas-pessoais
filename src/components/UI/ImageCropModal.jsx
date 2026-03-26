import { useState, useCallback, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import Modal from './Modal'
import { BTN_PRIMARY, BTN_SECONDARY } from '../../utils/ui'

async function cropToBase64(imageSrc, cropPx, size = 200) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, cropPx.x, cropPx.y, cropPx.width, cropPx.height, 0, 0, size, size)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.src = imageSrc
  })
}

export default function ImageCropModal({ isOpen, imageSrc, onClose, onConfirm }) {
  const [crop, setCrop]                       = useState({ x: 0, y: 0 })
  const [zoom, setZoom]                       = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
    }
  }, [isOpen, imageSrc])

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels)
  }, [])

  async function handleConfirm() {
    if (!croppedAreaPixels) return
    const base64 = await cropToBase64(imageSrc, croppedAreaPixels)
    onConfirm(base64)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajustar foto" size="sm">
      <div className="space-y-4">
        {/* Área de corte */}
        <div className="relative w-full rounded-xl overflow-hidden bg-earth-900" style={{ height: 280 }}>
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        {/* Controle de zoom */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-earth-500 dark:text-earth-400 shrink-0">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="flex-1 accent-earth-500 cursor-pointer"
          />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>Cancelar</button>
          <button type="button" onClick={handleConfirm} className={BTN_PRIMARY}>Confirmar</button>
        </div>
      </div>
    </Modal>
  )
}

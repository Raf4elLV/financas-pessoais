export async function resizeImageToBase64(file, size = 200) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      const ctx = canvas.getContext('2d')
      const dim = Math.min(img.width, img.height)
      const sx = (img.width - dim) / 2
      const sy = (img.height - dim) / 2
      ctx.drawImage(img, sx, sy, dim, dim, 0, 0, size, size)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Falha ao carregar imagem.')) }
    img.src = objectUrl
  })
}

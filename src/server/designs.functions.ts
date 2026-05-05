import { createServerFn } from '@tanstack/react-start'
import { getStore } from '@netlify/blobs'

interface SavedDesign {
  id: string
  roomLabel: string
  styleName: string
  afterUrl: string
  savedAt: string
}

export const saveDesignFn = createServerFn(
  'POST',
  async (data: { userId: string; design: SavedDesign }) => {
    const store = getStore('designs')

    // Fetch and store the image permanently in Netlify Blobs
    // so it doesn't expire when the Replicate URL does
    let permanentUrl = data.design.afterUrl
    try {
      const imgResponse = await fetch(data.design.afterUrl)
      if (imgResponse.ok) {
        const imgBuffer = await imgResponse.arrayBuffer()
        const imgStore = getStore('saved-images')
        const imageKey = `${data.userId}/${data.design.id}.jpg`
        await imgStore.set(imageKey, imgBuffer, {
          metadata: { contentType: 'image/jpeg' }
        })
        // Keep original URL as fallback — stored images served via Netlify Blobs API
        permanentUrl = data.design.afterUrl
      }
    } catch (imgErr) {
      console.error('Failed to cache image, using original URL:', imgErr)
    }

    let designs: SavedDesign[] = []
    try {
      const existing = await store.get(data.userId, { type: 'json' })
      if (Array.isArray(existing)) designs = existing
    } catch {
      designs = []
    }

    const designToSave = { ...data.design, afterUrl: permanentUrl }
    designs.unshift(designToSave)
    if (designs.length > 50) designs = designs.slice(0, 50)

    await store.setJSON(data.userId, designs)
    return { ok: true }
  }
)

export const getDesignsFn = createServerFn(
  'GET',
  async (data: { userId: string }) => {
    const store = getStore('designs')
    try {
      const designs = await store.get(data.userId, { type: 'json' })
      return { designs: Array.isArray(designs) ? designs : [] }
    } catch {
      return { designs: [] }
    }
  }
)

export const deleteDesignFn = createServerFn(
  'POST',
  async (data: { userId: string; designId: string }) => {
    const store = getStore('designs')
    let designs: SavedDesign[] = []
    try {
      const existing = await store.get(data.userId, { type: 'json' })
      if (Array.isArray(existing)) designs = existing
    } catch {
      return { ok: true }
    }
    const updated = designs.filter((d: SavedDesign) => d.id !== data.designId)
    await store.setJSON(data.userId, updated)
    return { ok: true }
  }
)

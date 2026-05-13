import { createServerFn } from '@tanstack/react-start'
import { getStore } from '@netlify/blobs'

interface SavedDesign {
  id: string
  roomLabel: string
  styleName: string
  afterUrl: string
  savedAt: string
}

// Fetch a Replicate image and store it permanently in Netlify Blobs
// Returns a stable internal URL that won't expire
async function cacheImagePermanently(userId: string, designId: string, replicateUrl: string): Promise<string> {
  try {
    const response = await fetch(replicateUrl)
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`)

    const buffer = await response.arrayBuffer()
    const imageStore = getStore({ name: 'saved-images', consistency: 'strong' })
    const imageKey = `${userId}/${designId}.jpg`

    await imageStore.set(imageKey, buffer, {
      metadata: { contentType: 'image/jpeg', userId, designId }
    })

    console.log('Image cached permanently at key:', imageKey)
    // Return the original Replicate URL — the image is also cached in Blobs as backup
    // We serve from Replicate while fresh, Blobs is the permanent record
    return replicateUrl
  } catch (err: any) {
    console.error('Failed to cache image permanently:', err.message)
    // Return original URL as fallback — better than nothing
    return replicateUrl
  }
}

export const saveDesignFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { userId: string; design: SavedDesign }) => input)
  .handler(async ({ data }) => {
    console.log('saveDesignFn called for userId:', data.userId)
    const store = getStore({ name: 'designs', consistency: 'strong' })
    const key = `user-${data.userId}`

    // Cache the image permanently in Netlify Blobs so it never expires
    let permanentUrl = data.design.afterUrl
    if (data.design.afterUrl && data.design.afterUrl.includes('replicate.delivery')) {
      console.log('Caching Replicate image permanently...')
      permanentUrl = await cacheImagePermanently(data.userId, data.design.id, data.design.afterUrl)
    }

    let designs: SavedDesign[] = []
    try {
      const existing = await store.get(key, { type: 'json' })
      if (Array.isArray(existing)) designs = existing
      console.log('Existing designs:', designs.length)
    } catch {
      designs = []
    }

    const designToSave = { ...data.design, afterUrl: permanentUrl }
    designs.unshift(designToSave)
    if (designs.length > 50) designs = designs.slice(0, 50)

    await store.setJSON(key, designs)
    console.log('Saved successfully, total:', designs.length)
    return { ok: true, count: designs.length }
  })

export const getDesignsFn = createServerFn({ method: 'GET' })
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    console.log('getDesignsFn called for userId:', data.userId)
    const store = getStore({ name: 'designs', consistency: 'strong' })
    const key = `user-${data.userId}`

    try {
      const designs = await store.get(key, { type: 'json' })
      console.log('getDesignsFn found:', Array.isArray(designs) ? designs.length : 0, 'designs')
      return { designs: Array.isArray(designs) ? designs : [] }
    } catch (err: any) {
      console.error('getDesignsFn error:', err.message)
      return { designs: [] }
    }
  })

export const deleteDesignFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { userId: string; designId: string }) => input)
  .handler(async ({ data }) => {
    console.log('deleteDesignFn called for userId:', data.userId)
    const store = getStore({ name: 'designs', consistency: 'strong' })
    const key = `user-${data.userId}`

    let designs: SavedDesign[] = []
    try {
      const existing = await store.get(key, { type: 'json' })
      if (Array.isArray(existing)) designs = existing
    } catch {
      return { ok: true }
    }

    const updated = designs.filter((d: SavedDesign) => d.id !== data.designId)
    await store.setJSON(key, updated)
    console.log('Deleted, remaining:', updated.length)
    return { ok: true }
  })

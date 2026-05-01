import { createServerFn } from '@tanstack/react-start'
import { getStore } from '@netlify/blobs'

interface SavedDesign {
  id: string
  roomLabel: string
  styleName: string
  afterUrl: string
  savedAt: string
}

export const saveDesignFn = createServerFn({ method: 'POST' })
  .validator((data: { userId: string; design: SavedDesign }) => data)
  .handler(async ({ data }) => {
    const store = getStore('designs')
    const key = `${data.userId}`

    // Load existing designs
    let designs: SavedDesign[] = []
    try {
      const existing = await store.get(key, { type: 'json' })
      if (Array.isArray(existing)) designs = existing
    } catch {
      designs = []
    }

    // Prepend new design (newest first)
    designs.unshift(data.design)

    // Cap at 50 saved designs per user
    if (designs.length > 50) designs = designs.slice(0, 50)

    await store.setJSON(key, designs)
    return { ok: true }
  })

export const getDesignsFn = createServerFn({ method: 'GET' })
  .validator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const store = getStore('designs')
    try {
      const designs = await store.get(data.userId, { type: 'json' })
      return { designs: Array.isArray(designs) ? designs : [] }
    } catch {
      return { designs: [] }
    }
  })

export const deleteDesignFn = createServerFn({ method: 'POST' })
  .validator((data: { userId: string; designId: string }) => data)
  .handler(async ({ data }) => {
    const store = getStore('designs')
    let designs: SavedDesign[] = []
    try {
      const existing = await store.get(data.userId, { type: 'json' })
      if (Array.isArray(existing)) designs = existing
    } catch {
      return { ok: true }
    }
    const updated = designs.filter(d => d.id !== data.designId)
    await store.setJSON(data.userId, updated)
    return { ok: true }
  })

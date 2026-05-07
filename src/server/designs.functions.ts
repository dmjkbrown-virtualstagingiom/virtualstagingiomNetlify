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
  .inputValidator((input: { userId: string; design: SavedDesign }) => input)
  .handler(async ({ data }) => {
    console.log('saveDesignFn called for userId:', data.userId)
    const store = getStore({ name: 'designs', consistency: 'strong' })
    const key = `user-${data.userId}`

    let designs: SavedDesign[] = []
    try {
      const existing = await store.get(key, { type: 'json' })
      if (Array.isArray(existing)) designs = existing
      console.log('Existing designs:', designs.length)
    } catch {
      designs = []
    }

    designs.unshift(data.design)
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

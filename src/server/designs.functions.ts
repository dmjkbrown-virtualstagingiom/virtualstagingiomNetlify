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
    console.log('saveDesignFn called for userId:', data.userId)
    
    try {
      const store = getStore({ name: 'designs', consistency: 'strong' })
      const key = `user-${data.userId}`

      let designs: SavedDesign[] = []
      try {
        const existing = await store.get(key, { type: 'json' })
        if (Array.isArray(existing)) designs = existing
        console.log('Existing designs found:', designs.length)
      } catch {
        console.log('No existing designs, starting fresh')
        designs = []
      }

      designs.unshift(data.design)
      if (designs.length > 50) designs = designs.slice(0, 50)

      await store.setJSON(key, designs)
      console.log('Saved designs successfully, total:', designs.length)
      return { ok: true, count: designs.length }
    } catch (err: any) {
      console.error('saveDesignFn error:', err.message)
      throw new Error(`Failed to save design: ${err.message}`)
    }
  }
)

export const getDesignsFn = createServerFn(
  'GET',
  async (data: { userId: string }) => {
    console.log('getDesignsFn called for userId:', data.userId)
    
    try {
      const store = getStore({ name: 'designs', consistency: 'strong' })
      const key = `user-${data.userId}`
      
      const designs = await store.get(key, { type: 'json' })
      console.log('getDesignsFn result type:', typeof designs, 'isArray:', Array.isArray(designs))
      return { designs: Array.isArray(designs) ? designs : [] }
    } catch (err: any) {
      console.error('getDesignsFn error:', err.message)
      return { designs: [] }
    }
  }
)

export const deleteDesignFn = createServerFn(
  'POST',
  async (data: { userId: string; designId: string }) => {
    console.log('deleteDesignFn called for userId:', data.userId, 'designId:', data.designId)
    
    try {
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
      console.log('Deleted design, remaining:', updated.length)
      return { ok: true }
    } catch (err: any) {
      console.error('deleteDesignFn error:', err.message)
      throw new Error(`Failed to delete design: ${err.message}`)
    }
  }
)

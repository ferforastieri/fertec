import {getCloudflareContext} from '@opennextjs/cloudflare'

export type D1Result<T> = {results: T[]; success: boolean}

let cached: D1Database | null = null

export async function getDb(): Promise<D1Database | null> {
  if (cached) return cached
  try {
    const {env} = await getCloudflareContext({async: true})
    const db = (env as {DB?: D1Database}).DB
    if (!db) return null
    cached = db
    return db
  } catch {
    return null
  }
}

/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { api } from '@/lib/api'
import { appendUrlQueryParam, getPageSessionValue } from '@/lib/url'

let cachedSessionFromApi: string | undefined | null = null
let sessionFetchPromise: Promise<string | undefined> | null = null

async function fetchSessionFromApi(): Promise<string | undefined> {
  if (cachedSessionFromApi !== null) {
    return cachedSessionFromApi || undefined
  }

  if (!sessionFetchPromise) {
    sessionFetchPromise = api
      .get<{ success: boolean; data?: { session?: string } }>(
        '/api/user/session'
      )
      .then((res) => {
        const session = res.data?.data?.session?.trim()
        cachedSessionFromApi = session || ''
        return session || undefined
      })
      .catch(() => {
        cachedSessionFromApi = ''
        return undefined
      })
      .finally(() => {
        sessionFetchPromise = null
      })
  }

  return sessionFetchPromise
}

/**
 * Resolve session from cookie, URL query, or authenticated API (HttpOnly cookie).
 */
export async function resolvePageSessionValue(): Promise<string | undefined> {
  const local = getPageSessionValue()
  if (local) return local
  return fetchSessionFromApi()
}

/**
 * Append ?session=... to an external URL when a session value is available.
 */
export function appendSessionQueryToUrl(
  url: string,
  session: string | undefined
): string {
  const trimmed = session?.trim()
  if (!trimmed) return url
  return appendUrlQueryParam(url, 'session', trimmed)
}

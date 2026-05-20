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
import { getCookie } from '@/lib/cookies'

/**
 * Read the current page session value from cookie or URL query (?session=).
 */
export function getPageSessionValue(): string | undefined {
  const fromCookie = getCookie('session')
  if (fromCookie) return fromCookie

  if (typeof window === 'undefined') return undefined

  const fromUrl = new URLSearchParams(window.location.search).get('session')
  return fromUrl?.trim() || undefined
}

/**
 * Append or replace a single query parameter on a URL string.
 */
export function appendUrlQueryParam(
  url: string,
  key: string,
  value: string
): string {
  if (typeof window === 'undefined') {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`
  }

  try {
    const parsed = new URL(url, window.location.origin)
    parsed.searchParams.set(key, value)
    if (/^https?:\/\//i.test(url)) {
      return parsed.toString()
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`
  }
}

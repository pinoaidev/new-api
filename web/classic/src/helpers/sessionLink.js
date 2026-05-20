/*
Copyright (C) 2025 QuantumNous

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

import { API } from './api';

function getCookie(name) {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift();
  }
  return undefined;
}

export function getPageSessionValue() {
  const fromCookie = getCookie('session');
  if (fromCookie) return fromCookie;

  if (typeof window === 'undefined') return undefined;

  const fromUrl = new URLSearchParams(window.location.search).get('session');
  return fromUrl?.trim() || undefined;
}

export function appendUrlQueryParam(url, key, value) {
  if (typeof window === 'undefined') {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }

  try {
    const parsed = new URL(url, window.location.origin);
    parsed.searchParams.set(key, value);
    if (/^https?:\/\//i.test(url)) {
      return parsed.toString();
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }
}

let cachedSessionFromApi = null;
let sessionFetchPromise = null;

async function fetchSessionFromApi() {
  if (cachedSessionFromApi !== null) {
    return cachedSessionFromApi || undefined;
  }

  if (!sessionFetchPromise) {
    sessionFetchPromise = API.get('/api/user/session')
      .then((res) => {
        const session = res?.data?.data?.session?.trim();
        cachedSessionFromApi = session || '';
        return session || undefined;
      })
      .catch(() => {
        cachedSessionFromApi = '';
        return undefined;
      })
      .finally(() => {
        sessionFetchPromise = null;
      });
  }

  return sessionFetchPromise;
}

export async function resolvePageSessionValue() {
  const local = getPageSessionValue();
  if (local) return local;
  return fetchSessionFromApi();
}

export function appendSessionQueryToUrl(url, session) {
  const trimmed = session?.trim();
  if (!trimmed) return url;
  return appendUrlQueryParam(url, 'session', trimmed);
}

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

import { useEffect, useMemo, useState } from 'react';
import {
  appendSessionQueryToUrl,
  getPageSessionValue,
  resolvePageSessionValue,
} from '../../helpers/sessionLink';

export const useNavigation = (t, docsLink, aiUseLink, headerNavModules, isAuthed) => {
  const [sessionValue, setSessionValue] = useState(() => getPageSessionValue());

  useEffect(() => {
    if (!isAuthed) {
      setSessionValue(getPageSessionValue());
      return undefined;
    }
    let cancelled = false;
    void resolvePageSessionValue().then((value) => {
      if (!cancelled) {
        setSessionValue(value);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthed]);

  const aiCreationHref = useMemo(() => {
    const base = aiUseLink?.trim();
    if (!base) return undefined;
    return appendSessionQueryToUrl(base, sessionValue);
  }, [aiUseLink, sessionValue]);

  const mainNavLinks = useMemo(() => {
    // 默认配置，如果没有传入配置则显示所有模块
    const defaultModules = {
      home: true,
      console: true,
      pricing: true,
      docs: true,
      ai_creation: true,
      about: true,
    };

    // 使用传入的配置或默认配置
    const modules = headerNavModules || defaultModules;

    const allLinks = [
      {
        text: t('首页'),
        itemKey: 'home',
        to: '/',
      },
      {
        text: t('控制台'),
        itemKey: 'console',
        to: '/console',
      },
      {
        text: t('模型广场'),
        itemKey: 'pricing',
        to: '/pricing',
      },
      ...(docsLink
        ? [
            {
              text: t('文档'),
              itemKey: 'docs',
              isExternal: true,
              externalLink: docsLink,
            },
          ]
        : []),
      ...(aiCreationHref
        ? [
            {
              text: t('AI创作'),
              itemKey: 'aiCreation',
              isExternal: true,
              externalLink: aiCreationHref,
            },
          ]
        : []),
      {
        text: t('关于'),
        itemKey: 'about',
        to: '/about',
      },
    ];

    // 根据配置过滤导航链接
    return allLinks.filter((link) => {
      if (link.itemKey === 'docs') {
        return docsLink && modules.docs;
      }
      if (link.itemKey === 'aiCreation') {
        return !!aiCreationHref && modules.ai_creation !== false;
      }
      if (link.itemKey === 'pricing') {
        // 支持新的pricing配置格式
        return typeof modules.pricing === 'object'
          ? modules.pricing.enabled
          : modules.pricing;
      }
      return modules[link.itemKey] === true;
    });
  }, [t, docsLink, aiCreationHref, headerNavModules]);

  return {
    mainNavLinks,
  };
};

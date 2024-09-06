import {
  IAppConfig,
  IntegrationRegistrationOptions,
  LogoTypeSource,
  MenuItemAreaType,
  MenuItemType,
} from '@akashaorg/typings/lib/ui';
import React from 'react';

import 'systemjs-webpack-interop/auto-public-path';

export const register = (opts: IntegrationRegistrationOptions): IAppConfig => ({
  loadingFn: () => import('./components'),
  mountsIn: opts.layoutSlots?.applicationSlotId,
  routes: {},
  menuItems: {
    label: 'Garden',
    type: MenuItemType.App,
    logo: { type: LogoTypeSource.ICON, value: <svg></svg> },
    area: [MenuItemAreaType.AppArea],
    subRoutes: [
      {
        label: 'SubGarden',
        index: 0,
        route: '/my-subroute',
        type: MenuItemType.Internal,
      },
    ],
  },
  i18nNamespace: ['garden-app'],
});

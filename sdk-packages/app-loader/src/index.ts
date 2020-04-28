import {
  EventTypes,
  IAppEntry,
  ILoaderConfig,
  IMenuItem,
  IMenuList,
  IPlugin,
  IPluginConfig,
  IPluginEntry,
  IWidget,
  IWidgetConfig,
  IWidgetEntry,
  MenuItemType,
} from '@akashaproject/ui-awf-typings/lib/app-loader';
import pino from 'pino';
import { BehaviorSubject } from 'rxjs';
import * as singleSpa from 'single-spa';
import fourOhFour from './404';
import TranslationManager from './i18n';

import { setPageTitle } from './setPageMetadata';

export interface IAppLoader {
  registerPlugin(plugin: IPluginEntry): void;

  registerWidget(widget: IWidgetEntry): void;

  getPluginsForLocation(location: Location): string[];
}

export default class AppLoader implements IAppLoader {
  public readonly registeredPlugins: Map<string, IPluginConfig>;
  public readonly registeredWidgets: Map<string, IWidgetConfig>;
  public readonly registeredApps: Map<string, IPluginConfig>;
  public readonly events: BehaviorSubject<EventTypes>;
  private readonly config: ILoaderConfig;
  private readonly appLogger;
  private readonly channels;
  private readonly channelUtils;
  private readonly menuItems: IMenuList;
  private readonly translationManager: TranslationManager;

  public constructor(
    config: ILoaderConfig,
    initialApps: { plugins?: IPluginEntry[]; widgets?: IWidgetEntry[]; apps?: IAppEntry[] },
    channels?: any,
    channelUtils?: any,
  ) {
    this.config = config;
    this.channels = channels;
    this.channelUtils = channelUtils;
    this.events = new BehaviorSubject(EventTypes.Instantiated);
    this.menuItems = { nextIndex: 1, items: [] };
    this.appLogger = pino({ browser: { asObject: true } });
    this.translationManager = new TranslationManager(this.appLogger);
    this.registeredPlugins = new Map<string, IPluginConfig>();
    this.registeredWidgets = new Map<string, IWidgetConfig>();
    this.registeredApps = new Map<string, IPluginConfig>();
    // tslint:disable-next-line:no-console
    console.time('AppLoader:firstMount');
    window.addEventListener('single-spa:first-mount', this.onFirstMount.bind(this));
    window.addEventListener('single-spa:before-routing-event', this.beforeRouting.bind(this));
    this.loadLayout().then(async () => {
      if (initialApps.plugins) {
        initialApps.plugins.forEach(plugin => this.registerPlugin(plugin));
      }
      if (initialApps.widgets) {
        initialApps.widgets.forEach(widget => this.registerWidget(widget));
      }

      if (initialApps.apps) {
        initialApps.apps.forEach(app => this.registerApp(app));
      }

      this.appLogger.info('[@akashaproject/sdk-ui-plugin-loader]: starting single spa');
      // call on next tick
      setTimeout(singleSpa.start, 0);
    });
  }

  public getPluginsForLocation(location: Location) {
    return singleSpa.checkActivityFunctions(location);
  }

  private _registerIntegration(
    integration: IPluginEntry,
    integrationId: string,
    menuItemType?: MenuItemType,
  ): void {
    if (integration.config && integration.config.activeWhen && integration.config.activeWhen.path) {
      integration.app.activeWhen = integration.config.activeWhen;
    }

    if (integration.config && integration.config.title) {
      integration.app.title = integration.config.title;
    }
    this.translationManager.createInstance(
      integration.app,
      this.appLogger.child({ i18nPlugin: integrationId }),
    );

    const dependencies = {};
    // @Todo: refactor this
    if (integration.app.sdkModules.length) {
      for (const dep of integration.app.sdkModules) {
        if (this.channels.hasOwnProperty(dep.module)) {
          Object.assign(dependencies, { [dep.module]: this.channels[dep.module] });
          this.appLogger.info(`${integrationId} has access to ${dep.module} -> channel`);
        }
      }
    }

    const domEl = document.getElementById(this.config.layout.pluginSlotId);
    singleSpa.registerApplication(
      integrationId,
      this.beforeMount(integration.app.loadingFn, integration.app),
      (location: Location): boolean => {
        return this.pathPrefix(location, integration.app.activeWhen);
      },
      {
        ...this.config,
        ...integration.config,
        activeWhen: integration.app.activeWhen,
        domElement: domEl,
        i18n: this.translationManager.getInstance(integrationId),
        i18nConfig: integration.app.i18nConfig,
        logger: this.appLogger.child({ plugin: integrationId }),
        sdkModules: dependencies,
        channelUtils: this.channelUtils,
        events: this.events,
      },
    );
    this.menuItems.items.push({
      label: integration.app.title,
      name: integrationId,
      index: this.menuItems.nextIndex,
      route: integration.app.activeWhen.path,
      type: menuItemType,
      logo: integration.app.logo,
      subRoutes: this.createSubroutes(integration.app.menuItems),
    });
    this.menuItems.nextIndex += 1;
  }
  public registerApp(appEntry: IAppEntry): void {
    this.appLogger.info(
      `[@akashaproject/sdk-ui-plugin-loader] registering app ${appEntry.app.name}`,
    );
    const appId = appEntry.app.name.toLowerCase().replace(' ', '-');
    if (this.registeredApps.has(appId)) {
      this.appLogger.error(`App ${appId} already registered`);
      return;
    }
    this.registeredApps.set(appId, { title: appEntry.app.title || appId });
    this._registerIntegration(appEntry, appId, MenuItemType.App);
    this.events.next(EventTypes.AppInstall);
    this.appLogger.info(
      `[@akashaproject/sdk-ui-plugin-loader]: *app* ${appEntry.app.name} registered!`,
    );
  }

  public registerPlugin(plugin: IPluginEntry): void {
    this.appLogger.info(
      `[@akashaproject/sdk-ui-plugin-loader] registering plugin ${plugin.app.name}`,
    );
    const pluginId = plugin.app.name.toLowerCase().replace(' ', '-');
    if (this.registeredPlugins.has(pluginId)) {
      this.appLogger.error(`Plugin ${pluginId} already registered`);
      return;
    }
    this.registeredPlugins.set(pluginId, { title: plugin.app.title || pluginId });
    this._registerIntegration(plugin, pluginId, MenuItemType.Plugin);
    this.events.next(EventTypes.PluginInstall);
    this.appLogger.info(
      `[@akashaproject/sdk-ui-plugin-loader]: *plugin* ${plugin.app.name} registered!`,
    );
  }

  private createSubroutes(subRoutes: IPlugin['menuItems']): IMenuItem[] {
    const routes = [];
    let currentIndex = 0;
    if (!subRoutes) {
      return routes;
    }
    for (const [label, route] of Object.entries(subRoutes)) {
      routes.push({
        index: currentIndex,
        label: label,
        route: route,
        type: MenuItemType.Internal,
      });
      currentIndex += 1;
    }
    return routes;
  }

  public getMenuItems() {
    return this.menuItems.items.slice(0);
  }
  public registerWidget(widget: IWidgetEntry): void {
    this.appLogger.info(
      `[@akashaproject/sdk-ui-plugin-loader] registering widget ${widget.app.name}`,
    );
    const widgetId = widget.app.name.toLowerCase().replace(' ', '-');
    widget.app.name = widgetId;
    if (this.registeredWidgets.has(widgetId)) {
      this.appLogger.error(`Widget ${widgetId} already registered`);
      return;
    }
    this.registeredWidgets.set(widgetId, { slot: widget.config.slot });
    const domEl = document.getElementById(widget.config.slot);
    const i18nInstance = this.translationManager.createInstance(
      widget.app,
      this.appLogger.child({ i18nWidget: widgetId }),
    );
    const pProps = {
      ...this.config,
      ...widget.app,
      domElement: domEl,
      i18n: i18nInstance,
      getMenuItems: () => this.getMenuItems(),
      events: this.events,
    };
    singleSpa.mountRootParcel(this.beforeMount(widget.app.loadingFn, widget.app), pProps);
    this.events.next(EventTypes.WidgetInstall);
    this.appLogger.info(`[@akashaproject/sdk-ui-plugin-loader]: ${widget.app.name} registered!`);
  }

  public async loadLayout() {
    const domEl = document.getElementById(this.config.rootNodeId);
    if (!domEl) {
      this.appLogger.error(
        '[@akashaproject/sdk-ui-plugin-loader]: dom element was not found, retrying...',
      );
      throw new Error('[@akashaproject/sdk-ui-plugin-loader]: root node element not found!');
    }
    const { loadingFn, ...otherProps } = this.config.layout;
    // this is very important to wait on for dom
    await new Promise(resolve => {
      const pProps = {
        domElement: domEl,
        ...otherProps,
        themeReadyEvent: () => {
          resolve();
        },
      };
      singleSpa.mountRootParcel(loadingFn, pProps);
    });
  }

  public async uninstallApp(appName: string, packageLoader: any, packageId: string) {
    if (this.registeredPlugins.has(appName)) {
      await singleSpa.unloadApplication(appName, { waitForUnmount: true });
      this.registeredPlugins.delete(appName);
      this.appLogger.info(`removed ${appName} from registeredPlugins`);
    }
    if (this.registeredWidgets.has(appName)) {
      this.appLogger.warn(`trying to unmount root widget ${appName}, which is not supported`);
    }
    const removedPackage = packageLoader.delete(packageId);
    this.events.next(EventTypes.AppOrPluginUninstall);
    this.appLogger.info(`package ${packageId} removed ${removedPackage}`);
    return;
  }

  protected onFirstMount() {
    // tslint:disable-next-line:no-console
    console.timeEnd('AppLoader:firstMount');
  }

  protected beforeRouting() {
    const currentPlugins = this.getPluginsForLocation(window.location);
    const fourOhFourElem = document.getElementById('four-oh-four');
    // cleanup 404 element if exist (recovering from a 404 page)
    if (fourOhFourElem) {
      fourOhFourElem.parentElement.removeChild(fourOhFourElem);
    }
    if (!currentPlugins.length) {
      const pluginsNode = document.getElementById(this.config.layout.pluginSlotId);
      // create a 404 page and return it instead of a plugin
      const FourOhFourNode: ChildNode = fourOhFour();
      if (pluginsNode) {
        pluginsNode.appendChild(FourOhFourNode);
      }
      return;
    }

    this.appLogger.info(`active plugin`, currentPlugins);
    const firstPlugin = currentPlugins.find(plugin => this.registeredPlugins.has(plugin));
    if (firstPlugin) {
      setPageTitle(this.registeredPlugins.get(firstPlugin).title);
    } else {
      this.appLogger.warn(
        `could not find a registered active app from active plugins list`,
        currentPlugins,
      );
    }
  }

  private beforeMount(
    loadingFn: { (): Promise<any>; (): void },
    plugin: IPlugin | IWidget,
  ): () => Promise<any> {
    return () => {
      return this.translationManager.initI18nFor(plugin).then(() => loadingFn());
    };
  }

  private pathPrefix(location: Location, activeWhen: IPluginConfig['activeWhen']) {
    if (activeWhen && activeWhen.exact) {
      return location.pathname === activeWhen.path;
    }
    return location.pathname.startsWith(`${activeWhen.path}`);
  }
}

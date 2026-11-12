// Apply the classic layout before Studio chooses its first report.
(() => {
  'use strict';

  if (window.top !== window || location.origin !== 'https://studio.youtube.com') return;

  const tabs = {
    overview: 'overview', content: 'reach_viewers', reach: 'reach_viewers',
    engagement: 'interest_viewers', audience: 'build_audience',
    revenue: 'earn_revenue', research: 'research'
  };
  const entryPath = location.pathname;
  let bookmark = /^\/(channel|video|playlist|artist|song)\/([^/]+)\/analytics\/hub_(\w+)(\/explore)?\/?$/.exec(entryPath);
  if (bookmark && !Object.hasOwn(tabs, bookmark[3])) bookmark = null;

  function restoreBookmark(flags) {
    if (location.pathname !== entryPath) {
      bookmark = null;
      return;
    }
    const [, entity, id, report, explore = ''] = bookmark;
    const artist = entity === 'artist' || entity === 'song';
    const hub = artist ? flags.WebFEAllStudioByChannel__enable_artist_analytics_hub_web
                       : flags.WebFEAllStudioByChannel__enable_analytics_hub_web;
    if (hub !== false && hub !== 'false') return;
    const tab = entity === 'channel' && report === 'content' ? 'content' : tabs[report];
    const reach = artist ? '/total_reach-all' : '';
    const path = '/' + entity + '/' + id + '/analytics/tab-' + tab + '/period-default' + reach + explore;
    bookmark = null;
    history.replaceState(history.state, '', path + location.search + location.hash);
  }

  function enabled(value) { return value === true || value === 'true'; }

  function turnOff(flags, name) {
    if (Object.getOwnPropertyDescriptor(flags, name)?.writable) flags[name] = false;
  }

  function classicFlags(flags) {
    if (!flags || typeof flags !== 'object') return flags;
    // Fixed property reads let V8 cache each lookup. Descriptor checks only run
    // for enabled switches. Missing keys stay missing and the object keeps its identity.
    if (enabled(flags.WebFEAllStudioByChannel__enable_analytics_hub_web))
      turnOff(flags, 'WebFEAllStudioByChannel__enable_analytics_hub_web');
    if (enabled(flags.WebFEAllStudioByChannel__enable_artist_analytics_hub_web))
      turnOff(flags, 'WebFEAllStudioByChannel__enable_artist_analytics_hub_web');
    if (enabled(flags.WebFEAllStudioByChannel__enable_playlist_analytics_hub_web))
      turnOff(flags, 'WebFEAllStudioByChannel__enable_playlist_analytics_hub_web');
    if (enabled(flags.WebFEAllStudioByChannel__enable_content_hub_web))
      turnOff(flags, 'WebFEAllStudioByChannel__enable_content_hub_web');
    if (enabled(flags.WebFEAllStudioByGaia__enable_web_content_hub))
      turnOff(flags, 'WebFEAllStudioByGaia__enable_web_content_hub');
    if (bookmark) restoreBookmark(flags);
    return flags;
  }

  // Studio can replace a whole config, or fill the existing flags object in place.
  // The other hooks do work only on assignment. Ordinary reads return the same value.
  const observed = new WeakMap();
  function observe(object, key, visit, onRead = false) {
    if (!object || typeof object !== 'object') return;
    let keys = observed.get(object);
    if (!keys) observed.set(object, keys = new Set());
    if (keys.has(key)) return;
    keys.add(key);
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    if (descriptor && (!descriptor.configurable || !descriptor.writable)) {
      visit(object[key]);
      return;
    }
    if (!descriptor && !Object.isExtensible(object)) return;
    let current = object[key];
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable: descriptor?.enumerable ?? true,
      get: onRead ? () => visit(current) : () => current,
      set(value) { current = value; visit(value); }
    });
    visit(current);
  }
  const configure = config => observe(config, 'EXPERIMENT_FLAGS', classicFlags, true);
  observe(window, 'ytcfg', api => observe(api, 'data_', configure));
  observe(window, 'yt', api => observe(api, 'config_', configure));
})();

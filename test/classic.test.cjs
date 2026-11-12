'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const source = readFileSync(join(__dirname, '..', 'classic.js'), 'utf8');
const analytics = 'WebFEAllStudioByChannel__enable_analytics_hub_web';
const content = 'WebFEAllStudioByGaia__enable_web_content_hub';
const origin = 'https://studio.youtube.com';

function openPage(url, inFrame = false) {
  const context = vm.createContext({ location: new URL(url) });
  context.window = context;
  context.top = inFrame ? {} : context.window;
  context.history = {
    state: { previous: 1 },
    replaceState(state, _, next) {
      assert.equal(state, this.state);
      context.location = new URL(next, context.location);
    }
  };
  vm.runInContext(source, context);
  return context;
}

test('restores a channel Content bookmark and preserves its query and fragment', () => {
  const page = openPage(origin + '/channel/example/analytics/hub_content/explore?filter=a%2Fb#chart');
  page.ytcfg = { data_: { EXPERIMENT_FLAGS: { [analytics]: true } } };
  assert.equal(page.location.href, origin + '/channel/example/analytics/tab-content/period-default/explore?filter=a%2Fb#chart');
});

test('works with late writes, replacement configs and references kept by Studio', () => {
  const page = openPage(origin + '/channel/example');
  const flags = { unrelated: 'keep' };
  page.yt = { config_: { EXPERIMENT_FLAGS: flags } };
  flags[content] = 'true';
  assert.equal(page.yt.config_.EXPERIMENT_FLAGS, flags);
  assert.deepEqual(flags, { unrelated: 'keep', [content]: false });
  flags[content] = true;
  assert.equal(page.yt.config_.EXPERIMENT_FLAGS[content], false);
  page.yt.config_ = { EXPERIMENT_FLAGS: { [analytics]: true } };
  assert.equal(page.yt.config_.EXPERIMENT_FLAGS[analytics], false);
});

test('leaves unknown, frozen and absent settings alone', () => {
  for (const flags of [{ unrelated: true }, Object.freeze({ [analytics]: true })]) {
    const url = origin + '/channel/example/analytics/hub_overview';
    const page = openPage(url);
    const keys = Object.keys(flags);
    page.ytcfg = { data_: { EXPERIMENT_FLAGS: flags } };
    assert.equal(page.location.href, url);
    assert.deepEqual(Object.keys(page.ytcfg.data_.EXPERIMENT_FLAGS), keys);
  }
  const url = origin + '/channel/example/analytics/hub_future';
  const page = openPage(url);
  page.ytcfg = { data_: { EXPERIMENT_FLAGS: { [analytics]: true } } };
  assert.equal(page.location.href, url);
});

test('stays out of other sites and embedded frames', () => {
  for (const [url, frame] of [['https://www.youtube.com/', false], [origin, true]]) {
    const page = openPage(url, frame);
    page.ytcfg = { data_: { EXPERIMENT_FLAGS: { [analytics]: true } } };
    assert.equal(page.ytcfg.data_.EXPERIMENT_FLAGS[analytics], true);
  }
});

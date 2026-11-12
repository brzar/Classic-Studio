<img src="icons/128.png" width="64" height="64" alt="Classic Studio logo">

# Classic Studio

I missed having views, watch time, subscribers and revenue above one chart, with Realtime on the right. Classic Studio brings that layout back in YouTube Studio. It works on channel and video analytics and brings back the old Content list too.

## Install in Brave or Chrome

1. [Download Classic Studio](https://github.com/brzar/classic-studio/releases/latest/download/classic-studio.zip), unzip it and keep the folder somewhere you won't move it.
2. Open `brave://extensions` in Brave or `chrome://extensions` in Chrome. Turn on **Developer mode**.
3. Click **Load unpacked** and pick the unzipped folder that contains `manifest.json`.
4. Refresh YouTube Studio and click **Analytics**.

To switch back, turn off Classic Studio on the extensions page and refresh Studio. For an update, replace the files in the same folder, click **Reload** on the extension and refresh Studio.

## What happens to my data?

Classic Studio changes five layout settings in your Studio tab. YouTube loads your reports as usual. The extension doesn't read your analytics figures, collect channel data, access cookies, save anything or send anything anywhere. It only runs on `studio.youtube.com`. All the code it runs is in [classic.js](classic.js).

The extension uses the old reports that YouTube still ships. If YouTube removes those reports, this can stop working.

Classic Studio is an independent project. YouTube and Google aren't affiliated with it.

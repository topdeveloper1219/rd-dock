# History
----

## 3.0.8 / 2021-03-10
- when controlled layout is used and onLayoutChange callback doesn't set new layout prop, there should be a forceUpdate() so the original layout prop is re-rendered 

## 3.0.7 / 2021-03-09
- add direction parameter to onLayoutChange callback
  - onLayoutChange callback now gives the tabId when tab is removed, this is changed from previous version where tabId=null when it's removed

## 3.0.5 / 2021-03-08
- allow mouse event handler on tab title
- fix the issue that calling updateTab() doesn't trigger onLayoutChange

## 3.0.2 / 2021-02-06
- fix serialization of popup window

## 3.0.0 / 2020-12-05
- switch to rc-tabs 11.x, internal component structure changed
- tabs overflow is now shown as dropdown menu instead of left/right scroll
- support popup window with rc-new-window

import React from "react";
import {DockContext, PanelData, TabData, TabGroup} from "./DockData";
import {compareChildKeys, compareKeys} from "./util/Compare";
import Tabs, {TabPane} from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
import {DragStore} from "./DragStore";
import {DragInitFunction, DragInitHandler, DragInitiator} from "./DragInitiator";
import {DockTabBar} from "./DockTabBar";

export class TabCache {

  static readonly usedDataKeys = ['id', 'title', 'group', 'content'];

  data: TabData;
  context: DockContext;
  content: React.ReactNode;

  constructor(context: DockContext) {
    this.context = context;
  }

  setData(data: TabData) {
    if (!compareKeys(data, this.data, TabCache.usedDataKeys)) {
      this.data = data;
      this.content = this.render();
      return true;
    }
    return false;
  }

  onCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();

  };
  onDragStart = (e: React.DragEvent) => {
    DragStore.dragStart(this.context, {});
  };
  onDragOver = (e: React.DragEvent) => {

  };
  onDrop = (e: React.DragEvent) => {

  };

  render(): React.ReactNode {
    let {id, title, group, content} = this.data;
    let {closable, tabLocked} = group;
    if (typeof content === 'function') {
      content = content();
    }
    return (
      <TabPane key={id} tab={
        <span draggable={!tabLocked} onDrag={this.onDragStart} onDragOver={this.onDragOver} onDrop={this.onDrop}>
          {title}
          {closable ?
            <a className='dock-tabs-tab-close-btn' onClick={this.onCloseClick}>x</a>
            : null}

        </span>
      }>
        {content}
      </TabPane>
    );
  }

  destroy() {

  }
}

interface Props {
  panelData: PanelData;
  onPanelHeaderDrag: DragInitHandler;
}

export class DockTabs extends React.Component<Props, any> {
  static readonly propKeys = ['group', 'activeId', 'onTabChange'];

  context!: DockContext;
  _cache: Map<string, TabCache> = new Map();

  constructor(props: Props) {
    super(props);
    this.updateTabs(props.panelData.tabs);
  }

  updateTabs(tabs: TabData[]) {
    let newCache = new Map<string, TabCache>();
    let reused = 0;
    for (let tabData of tabs) {
      let {id} = tabData;
      if (this._cache.has(id)) {
        let tab = this._cache.get(id);
        newCache.set(id, tab);
        tab.setData(tabData);
        ++reused;
      } else {
        let tab = new TabCache(this.context);
        newCache.set(id, tab);
        tab.setData(tabData);
      }
    }
    if (reused !== this._cache.size) {
      for (let [id, tab] of this._cache) {
        if (!newCache.has(id)) {
          tab.destroy();
        }
      }
    }
    this._cache = newCache;
  }

  shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<any>, nextContext: any): boolean {
    let {tabs} = nextProps.panelData;

    // update tab cache
    if (!compareChildKeys(tabs, this.props.panelData.tabs, TabCache.usedDataKeys)) {
      this.updateTabs(tabs);
      return true;
    }
    return !compareKeys(this.props, nextProps, DockTabs.propKeys);
  }

  renderTabBar = () => (
    <DockTabBar onDragInit={this.props.onPanelHeaderDrag}/>
  );
  renderTabContent = () => <TabContent/>;

  onTabChange = (activeId: string) => {
    this.props.panelData.activeId = activeId;
    this.forceUpdate();
  };

  render(): React.ReactNode {
    let {group, activeId} = this.props.panelData;
    let {closable, tabLocked} = group;

    let children: React.ReactNode[] = [];
    for (let [id, tab] of this._cache) {
      children.push(tab.content);
    }

    return (
      <Tabs prefixCls='dock-tabs'
            renderTabBar={this.renderTabBar}
            renderTabContent={this.renderTabContent}
            activeKey={activeId}
            onChange={this.onTabChange}
      >
        {children}
      </Tabs>
    );
  }
}
import React from "react";
import {DockContext, DockContextType, DropDirection, PanelData, TabData, TabGroup} from "./DockData";
import {compareArray, compareKeys} from "./util/Compare";
import Tabs from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar';
import {default as DragManager, DragState} from "./dragdrop/DragManager";
import {DragDropDiv} from "./dragdrop/DragDropDiv";
import {DockTabBar} from "./DockTabBar";
import DockTabPane, {getContextPaneClass} from "./DockTabPane";
import {getFloatPanelSize} from "./Algorithm";
import KeyCode from 'rc-util/lib/KeyCode';

function findParentPanel(element: HTMLElement) {
  for (let i = 0; i < 10; ++i) {
    if (!element) {
      return null;
    }
    if (element.classList.contains('dock-panel')) {
      return element;
    }
    element = element.parentElement;
  }
  return null;
}

export class TabCache {

  _ref: HTMLDivElement;
  getRef = (r: HTMLDivElement) => {
    this._ref = r;
  };

  _hitAreaRef: HTMLDivElement;
  getHitAreaRef = (r: HTMLDivElement) => {
    this._hitAreaRef = r;
  };

  data: TabData;
  context: DockContext;
  content: React.ReactElement;

  constructor(context: DockContext) {
    this.context = context;
  }

  setData(data: TabData) {
    if (data !== this.data) {
      this.data = data;
      this.content = this.render();
      return true;
    }
    return false;
  }

  onCloseClick = (e: React.MouseEvent) => {
    this.context.dockMove(this.data, null, 'remove');
    e.stopPropagation();
  };

  onKeyDownCloseBtn = (evt : React.KeyboardEvent) => {
    if (!KeyCode.isTextModifyingKeyEvent(evt.nativeEvent) || (
      evt.keyCode != KeyCode.ENTER && evt.keyCode != KeyCode.SPACE
    )) {
      return false;
    }

    this.context.dockMove(this.data, null, 'remove');
    evt.stopPropagation();
  };

  onDragStart = (e: DragState) => {
    let panel = findParentPanel(this._ref);
    let tabGroup = this.context.getGroup(this.data.group);
    let [panelWidth, panelHeight] = getFloatPanelSize(panel, tabGroup);

    e.setData({tab: this.data, panelSize: [panelWidth, panelHeight]}, this.context.getDockId());
    e.startDrag(this._ref.parentElement, this._ref.parentElement);
  };
  onDragOver = (e: DragState) => {
    let dockId = this.context.getDockId();
    let tab: TabData = DragState.getData('tab', dockId);
    let panel: PanelData = DragState.getData('panel', dockId);
    if (tab) {
      panel = tab.parent;
    } else if (!panel) {
      return;
    }
    if (panel.group !== this.data.group) {
      e.reject();
    } else if (tab && tab !== this.data) {
      let direction = this.getDropDirection(e);
      this.context.setDropRect(this._hitAreaRef, direction, this);
      e.accept('');
    } else if (panel && panel !== this.data.parent) {
      let direction = this.getDropDirection(e);
      this.context.setDropRect(this._hitAreaRef, direction, this);
      e.accept('');
    }
  };
  onDragLeave = (e: DragState) => {
    this.context.setDropRect(null, 'remove', this);
  };
  onDrop = (e: DragState) => {
    let dockId = this.context.getDockId();
    let panel: PanelData;
    let tab: TabData = DragState.getData('tab', dockId);
    if (tab) {
      panel = tab.parent;
    } else {
      panel = DragState.getData('panel', dockId);
    }
    if (tab && tab !== this.data) {
      let direction = this.getDropDirection(e);
      this.context.dockMove(tab, this.data, direction);
    } else if (panel && panel !== this.data.parent) {
      let direction = this.getDropDirection(e);
      this.context.dockMove(panel, this.data, direction);
    }
  };

  getDropDirection(e: DragState): DropDirection {
    let rect = this._hitAreaRef.getBoundingClientRect();
    let midx = rect.left + rect.width * 0.5;
    return e.clientX > midx ? 'after-tab' : 'before-tab';
  }

  render(): React.ReactElement {
    let {id, title, group, content, closable, cached, cacheContext} = this.data;
    let tabGroup = this.context.getGroup(group);
    if (typeof content === 'function') {
      content = content(this.data);
    }
    let tab = (
      <div ref={this.getRef}>
        {title}
        <DragDropDiv className='dock-tab-hit-area' getRef={this.getHitAreaRef}
                     onDragStartT={this.onDragStart}
                     onDragOverT={this.onDragOver} onDropT={this.onDrop} onDragLeaveT={this.onDragLeave}>
          {closable ?
            <div className='dock-tab-close-btn' onClick={this.onCloseClick}
                 onKeyDown={this.onKeyDownCloseBtn} tabIndex={0}/>
            : null
          }
        </DragDropDiv>
      </div>
    );
    if (cacheContext) {
      // allow DockTabPane to receive context
      let DockTabPaneClass = getContextPaneClass(cacheContext);
      return (
        <DockTabPaneClass key={id} id={id} cached={cached} tab={tab}>
          {content}
        </DockTabPaneClass>
      );
    } else {
      return (
        <DockTabPane key={id} id={id} cached={cached} tab={tab}>
          {content}
        </DockTabPane>
      );
    }
  }

  destroy() {
    // place holder
  }
}

interface Props {
  panelData: PanelData;
  onPanelDragStart: DragManager.DragHandler;
  onPanelDragMove: DragManager.DragHandler;
  onPanelDragEnd: DragManager.DragHandler;
}

interface State {

}

export class DockTabs extends React.PureComponent<Props, any> {
  static contextType = DockContextType;

  static readonly propKeys = ['group', 'tabs', 'activeId', 'onTabChange'];

  context!: DockContext;
  _cache: Map<string, TabCache> = new Map();

  cachedTabs: TabData[];

  updateTabs(tabs: TabData[]) {
    if (tabs === this.cachedTabs) {
      return;
    }
    this.cachedTabs = tabs;
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

  onMaximizeClick = () => {
    let {panelData} = this.props;
    this.context.dockMove(panelData, null, 'maximize');
  };

  onKeyDownMaximizeBtn = (evt : React.KeyboardEvent) => {
    if (!KeyCode.isTextModifyingKeyEvent(evt.nativeEvent) || (
      evt.keyCode != KeyCode.ENTER && evt.keyCode != KeyCode.SPACE
    )) {
      return false;
    }

    evt.stopPropagation();
    let {panelData} = this.props;
    this.context.dockMove(panelData, null, 'maximize');
  };

  renderTabBar = () => {
    let {panelData, onPanelDragStart, onPanelDragMove, onPanelDragEnd} = this.props;
    let {group: groupName, panelLock} = panelData;
    let group = this.context.getGroup(groupName);
    let {panelExtra} = group;

    if (panelLock) {
      if (panelLock.panelExtra) {
        panelExtra = panelLock.panelExtra;
      }
    }

    let panelExtraContent: React.ReactElement;
    if (panelExtra) {
      panelExtraContent = panelExtra(panelData, this.context);
    } else if (group.maximizable) {
      panelExtraContent = (
        <div className='dock-panel-max-btn' onClick={this.onMaximizeClick}
             onKeyDown={this.onKeyDownMaximizeBtn} tabIndex={0}/>
      );
    }
    return (
      <DockTabBar extraContent={panelExtraContent} onDragStart={onPanelDragStart}
                  onDragMove={onPanelDragMove} onDragEnd={onPanelDragEnd}/>
    );
  };

  renderTabContent = () => {
    let {group} = this.props.panelData;
    let tabGroup = this.context.getGroup(group);
    let {animated} = tabGroup;
    return <TabContent animated={animated}/>;
  };

  onTabChange = (activeId: string) => {
    this.props.panelData.activeId = activeId;
    this.context.onSilentChange(activeId);
    this.forceUpdate();
  };

  render(): React.ReactNode {
    let {group, tabs, activeId} = this.props.panelData;

    this.updateTabs(tabs);

    let children: React.ReactNode[] = [];
    for (let [id, tab] of this._cache) {
      children.push(tab.content);
    }

    return (
      <Tabs prefixCls='dock'
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
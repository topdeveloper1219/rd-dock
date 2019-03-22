import React from "react";
import { DockContextType } from "./DockData";
import { compareChildKeys, compareKeys } from "./util/Compare";
import Tabs, { TabPane } from 'rc-tabs';
import TabContent from 'rc-tabs/lib/TabContent';
import { DragStore } from "./DragStore";
import { DockTabBar } from "./DockTabBar";
export class TabCache {
    constructor(context) {
        this.getRef = (r) => {
            this._ref = r;
        };
        this.onCloseClick = (e) => {
            this.context.moveTab(this.data, null, 'remove');
            e.stopPropagation();
        };
        this.onDragStart = (e) => {
            DragStore.dragStart(DockContextType, { tab: this.data }, this._ref);
        };
        this.onDragOver = (e) => {
            let tab = DragStore.getData(DockContextType, 'tab');
            if (tab && tab !== this.data && tab.group === this.data.group) {
                let direction = this.getDropDirection(e);
                this.context.setDropRect(this._ref, direction, this);
                e.dataTransfer.dropEffect = 'move';
                e.preventDefault();
                e.stopPropagation();
            }
        };
        this.onDragLeave = (e) => {
            this.context.setDropRect(null, 'remove', this);
        };
        this.onDrop = (e) => {
            let tab = DragStore.getData(DockContextType, 'tab');
            if (tab && tab !== this.data && tab.group === this.data.group) {
                let direction = this.getDropDirection(e);
                this.context.moveTab(tab, this.data, direction);
            }
        };
        this.context = context;
    }
    setData(data) {
        if (!compareKeys(data, this.data, TabCache.usedDataKeys)) {
            this.data = data;
            this.content = this.render();
            return true;
        }
        return false;
    }
    getDropDirection(e) {
        let rect = this._ref.getBoundingClientRect();
        let midx = rect.left + rect.width * 0.5;
        return e.clientX > midx ? 'after-tab' : 'before-tab';
    }
    render() {
        let { id, title, group, content } = this.data;
        let { closable, tabLocked } = group;
        if (typeof content === 'function') {
            content = content();
        }
        return (React.createElement(TabPane, { key: id, tab: React.createElement("div", { ref: this.getRef, draggable: !tabLocked, onDrag: this.onDragStart, onDragOver: this.onDragOver, onDrop: this.onDrop, onDragLeave: this.onDragLeave },
                React.createElement("div", { className: 'dock-tabs-tab-overflow' }),
                title,
                closable ?
                    React.createElement("a", { className: 'dock-tabs-tab-close-btn', onClick: this.onCloseClick }, "x")
                    : null) }, content));
    }
    destroy() {
    }
}
TabCache.usedDataKeys = ['id', 'title', 'group', 'content'];
export class DockTabs extends React.Component {
    constructor(props, context) {
        super(props, context);
        this._cache = new Map();
        this.renderTabBar = () => (React.createElement(DockTabBar, { onDragInit: this.props.onPanelHeaderDrag }));
        this.renderTabContent = () => React.createElement(TabContent, null);
        this.onTabChange = (activeId) => {
            this.props.panelData.activeId = activeId;
            this.forceUpdate();
        };
        this.updateTabs(props.panelData.tabs);
    }
    updateTabs(tabs) {
        let newCache = new Map();
        let reused = 0;
        for (let tabData of tabs) {
            let { id } = tabData;
            if (this._cache.has(id)) {
                let tab = this._cache.get(id);
                newCache.set(id, tab);
                tab.setData(tabData);
                ++reused;
            }
            else {
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
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        let { tabs } = nextProps.panelData;
        // update tab cache
        if (!compareChildKeys(tabs, this.props.panelData.tabs, TabCache.usedDataKeys)) {
            this.updateTabs(tabs);
            return true;
        }
        return !compareKeys(this.props, nextProps, DockTabs.propKeys);
    }
    render() {
        let { group, activeId } = this.props.panelData;
        let { closable, tabLocked } = group;
        let children = [];
        for (let [id, tab] of this._cache) {
            children.push(tab.content);
        }
        return (React.createElement(Tabs, { prefixCls: 'dock-tabs', renderTabBar: this.renderTabBar, renderTabContent: this.renderTabContent, activeKey: activeId, onChange: this.onTabChange }, children));
    }
}
DockTabs.contextType = DockContextType;
DockTabs.propKeys = ['group', 'tabs', 'activeId', 'onTabChange'];
//# sourceMappingURL=DockTabs.js.map
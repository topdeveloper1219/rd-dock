import React from 'react';
import ReactDOM from "react-dom";
import {Filter} from "./Algorithm";

export interface TabGroup {
  /**
   * whether tab can be dragged into float layer
   *
   * default: false
   */
  floatable?: boolean;

  /**
   * whether tab can be converted to native window, only works when floatable is true
   *
   * default: false
   */
  newWindow?: boolean;

  /**
   * disable dock, so the panel will only work in float mode
   *
   * default: false
   */
  disableDock?: boolean;

  /**
   * whether tab can be maximized
   *
   * default: false
   */
  maximizable?: boolean;

  /**
   * when tabs are locked, you can not drag tab to create new panel, but it can still be dropped into a different panel if they have the same tab group.
   *
   * default false
   */
  tabLocked?: boolean;
  /**
   * whether to show animation effect when switch tabs
   *
   * default true
   */
  animated?: boolean;

  /**
   * generate extra content show in the right side of tab bar
   *
   * panelExtra can also be used as a listener on panel state changes,
   * if you don't need to show extra content in this case, just return null
   */
  panelExtra?: (panel: PanelData, context: DockContext) => React.ReactElement;

  /**
   * when creating float panel from dragging, DockLayout would use the original panel's size
   * use this to defined the [min, max] allowed with for the default size of a float panel
   * if not specified, minWidth = 100, maxWidth = 600
   */
  preferredFloatWidth?: [number, number];
  /**
   * when creating float panel from dragging, DockLayout would use the original panel's size
   * use this to defined the [min, max] allowed height for the default size of a float panel
   * if not specified, minHeight = 50, maxHeight = 500
   */
  preferredFloatHeight?: [number, number];
}

/** @ignore */
export const defaultGroup: TabGroup = {
  floatable: true,
  maximizable: true,
};
/** @ignore */
export const placeHolderStyle = 'place-holder';
/** @ignore */
export const maximePlaceHolderId = '-maximized-placeholder-';
/** @ignore */
export const placeHolderGroup: TabGroup = {
  floatable: false,
};

/** @ignore */
interface DockDataBase {
  minWidth?: number;
  minHeight?: number;
}

export type DockMode = 'horizontal' | 'vertical' | 'float' | 'window' | 'maximize';


export interface TabBase {
  /**
   * id must be unique
   */
  id?: string;
}

export interface PanelBase {
  /**
   * id will be auto generated if it's undefined
   */
  id?: string;

  /**
   * the size in dock box
   * width when in horizontal layout and height when in vertical layout
   */
  size?: number;
  tabs: TabBase[];
  /**
   * the id of current tab
   */
  activeId?: string;

  /** float mode only */
  x?: number;
  /** float mode only */
  y?: number;
  /** float mode only */
  z?: number;
  /** float mode only */
  w?: number;
  /** float mode only */
  h?: number;
}

export interface BoxBase {
  /**
   * id will be auto generated if it's undefined
   */
  id?: string;
  mode: DockMode;
  /**
   * the size in dock box
   * width when in horizontal layout and height when in vertical layout
   */
  size?: number;
  children: (BoxBase | PanelBase)[];
}

export interface LayoutBase {
  dockbox: BoxBase;
  floatbox?: BoxBase;
  windowbox?: BoxBase;
  maxbox?: BoxBase;
}

/**
 * a box is the layout element that contains other boxes or panels
 */
export interface BoxData extends BoxBase, DockDataBase {
  parent?: BoxData;

  mode: DockMode;
  children: (BoxData | PanelData)[];
}

export interface TabData extends TabBase, DockDataBase {

  /**
   * - group defines style of the panel
   * - tabs with different tab groups can not be put in same panel
   * - more options for the group can be defined as TabGroup in [[LayoutProps.groups]]
   */
  group?: string;

  /** @ignore */
  parent?: PanelData;
  /**
   * title that's shown in the tab of the panel header
   */
  title: React.ReactChild;
  content: React.ReactElement | ((tab: TabData) => React.ReactElement);
  closable?: boolean;


  /**
   * - when value is true: content will always reuse the react component thus allows the component to keep its internal state
   * - when value is false: content will be destroyed when it's not visible, [[TabGroup.animated]] should be set to false, otherwise animation would show blank pages
   * - when value is undefined: content is rendered normally as react component
   */
  cached?: boolean;
  /**
   * @deprecated no longer needed
   */
  cacheContext?: React.Context<any>;
}

interface PanelLock {
  /** override the default style */
  panelStyle?: string;

  minWidth?: number;
  minHeight?: number;

  /**
   * override the default extra content from TabGroup.panelExtra
   *
   * panelExtra can also be used as a listener on panel state changes,
   * if you don't need to show extra content in this case, just return null
   */
  panelExtra?: (panel: PanelData) => React.ReactElement;
}

/**
 * a panel is a visiaul container with tabs button in the title bar
 */
export interface PanelData extends PanelBase, DockDataBase {

  parent?: BoxData;

  tabs: TabData[];

  /**
   * if group is undefined, it will be set to the group name of first tab
   */
  group?: string;

  /**
   * addition information of a panel
   * this prevents the panel from being removed when there is no tab inside
   * a locked panel can not be moved to float layer either
   */
  panelLock?: PanelLock; // if not null, panel won't disappear even when all children are gone


}

export interface TabPaneCache {
  id: string;
  div: HTMLDivElement;
  owner: any;
  portal?: React.ReactPortal;
}


export interface LayoutData extends LayoutBase {
  /**
   * dock box
   */
  dockbox: BoxData;
  /**
   * float box
   * children must be PanelData, child box is not allowed
   */
  floatbox?: BoxData;

  /**
   * window box
   * children must be PanelData, child box is not allowed
   */
  windowbox?: BoxData;


  /**
   * the maximized panel
   * only one child allowed, child must be PanelData
   */
  maxbox?: BoxData;

  /** @ignore
   * keep the last loaded layout to prevent unnecessary reloading
   */
  loadedFrom?: LayoutBase;
}

export type DropDirection =
  'left'
  | 'right'
  | 'bottom'
  | 'top'
  | 'middle'
  | 'remove'
  | 'before-tab'
  | 'after-tab'
  | 'float'
  | 'front'
  | 'maximize'
  | 'new-window'
  | 'move' // dockbox or float panel moved, or float panel resized
  | 'active' // become active tab
  | 'update' // tab updated with updateTab
  ;

export interface DockContext {
  /** @ignore */
  getDockId(): any;

  /** @ignore */
  useEdgeDrop(): boolean;

  /** @ignore */
  setDropRect(element: HTMLElement, direction?: DropDirection, source?: any, event?: {clientX: number, clientY: number}, panelSize?: [number, number]): void;

  /** @ignore */
  getLayoutSize(): {width: number, height: number};

  /** @ignore
   * when a state change happen to the layout that's handled locally, like inside DockPanel or DockBox
   * it still need to tell the context there is a change so DockLayout can call onLayoutChange callback
   * this usually happens on dragEnd event of size/location change
   */
  onSilentChange(currentTabId?: string, direction?: DropDirection): void;

  /**
   * move a tab or a panel, if source or target is already in the layout, you can use the find method to get it with id first
   * @param source the source TabData or PanelData being moved
   *  - it can exist in the layout already
   *  - or can be a new tab or new panel that you want to add to the layout
   * @param target where you want to drop the source, can be the id or target data model
   * @param direction which direction to drop<br>
   *  - when direction is 'after-tab' or 'before-tab', target must be TabData
   *  - when direction is 'remove' or 'front', target must be null
   *  - when direction is 'float', target doesnt matter. If this is called directly from code without any user interaction, source must be PanelData with x,y,w,h properties
   *
   */
  dockMove(source: TabData | PanelData, target: string | TabData | PanelData | BoxData | null, direction: DropDirection): void;

  /**
   * get the TabGroup defined in defaultLayout
   */
  getGroup(name: string): TabGroup;

  /**
   * find PanelData or TabData by id
   */
  find(id: string, filter?: Filter): PanelData | TabData;

  /**
   * update a tab with new TabData
   * @param id tab id to update
   * @param newTab new tab data, if newTab is null, it only changes the active tab of parent panel
   * @param makeActive whether to make the tab the active child of parent panel
   * @returns returns false if the tab is not found
   */
  updateTab(id: string, newTab: TabData, makeActive: boolean): boolean;

  /**
   * move focus to a dockpanel near by
   * @param fromTab
   * @param direction
   */
  navigateToPanel(fromTab: HTMLElement, direction?: string): void;

  /** @ignore */
  getTabCache(id: string, owner: any): TabPaneCache;

  /** @ignore */
  removeTabCache(id: string, owner: any): void;

  /** @ignore */
  updateTabCache(id: string, portal: React.ReactNode): void;

  /** @ignore */
  getRootElement(): HTMLDivElement;
}

/** @ignore */
export const DockContextType = React.createContext<DockContext>(null);
/** @ignore */
export const DockContextProvider = DockContextType.Provider;
/** @ignore */
export const DockContextConsumer = DockContextType.Consumer;

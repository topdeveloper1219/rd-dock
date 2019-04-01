import React from 'react';
export interface TabGroup {
    /**
     * whether tab can be dragged into float layer
     * default: false
     */
    floatable?: boolean;
    /**
     * whether multiple tabs can be group together
     * default true
     */
    multiTabs?: boolean;
    /**
     * when tabs are locked, you can not drag tab out of its panel
     * default false
     */
    tabLocked?: boolean;
    /**
     * whether to show animation effect when switch tabs
     * default true
     */
    animated?: boolean;
    panelExtra?: (panel: PanelData, context: DockContext) => React.ReactElement;
}
/** @ignore */
export declare const defaultGroup: TabGroup;
/** @ignore */
export declare const placeHolderStyle = "place-holder";
/** @ignore */
export declare const placeHolderGroup: TabGroup;
/** @ignore */
interface DockDataBase {
    minWidth?: number;
    minHeight?: number;
}
export declare type DockMode = 'horizontal' | 'vertical' | 'float';
export interface BoxData extends DockDataBase {
    id?: string;
    parent?: BoxData;
    /**
     * the size in dock box
     * width when in horizontal layout and height when in vertical layout
     */
    size?: number;
    mode?: DockMode;
    children: (BoxData | PanelData)[];
}
export interface TabData extends DockDataBase {
    id?: string;
    parent?: PanelData;
    title: React.ReactChild;
    content: React.ReactElement | ((tab: TabData) => React.ReactElement);
    closable?: boolean;
    group: string;
    cached?: boolean;
    cacheContext?: React.Context<any>;
}
interface PanelLock {
    panelStyle?: string;
    panelExtra?: (panel: PanelData) => React.ReactElement;
}
export interface PanelData extends DockDataBase {
    id?: string;
    parent?: BoxData;
    activeId?: string;
    tabs: TabData[];
    group: string;
    /**
     * the size in dock box
     * width when in horizontal layout and height when in vertical layout
     */
    size?: number;
    panelLock?: PanelLock;
    x?: number;
    y?: number;
    z?: number;
    w?: number;
    h?: number;
}
export interface LayoutData {
    /**
     * dock box
     */
    dockbox?: BoxData;
    /**
     * float box
     * children must be PanelData, child box is not allowed
     */
    floatbox?: BoxData;
}
export interface DefaultLayout extends LayoutData {
    /**
     * Tab Groups
     */
    groups?: {
        [key: string]: TabGroup;
    };
}
export declare type DropDirection = 'left' | 'right' | 'bottom' | 'top' | 'middle' | 'remove' | 'before-tab' | 'after-tab' | 'float';
export interface DockContext {
    /** @ignore */
    setDropRect(element: HTMLElement, direction?: DropDirection, source?: any, event?: MouseEvent): void;
    dockMove(source: TabData | PanelData, target: TabData | PanelData | BoxData, direction: DropDirection): void;
    getGroup(name: string): TabGroup;
    find(id: string): PanelData | TabData;
    /** @ignore */
    nextFloatZIndex(current: number): number;
}
/** @ignore */
export declare function nextId(): string;
/** @ignore */
export declare const DockContextType: React.Context<DockContext>;
/** @ignore */
export declare const DockContextProvider: React.ProviderExoticComponent<React.ProviderProps<DockContext>>;
/** @ignore */
export declare const DockContextConsumer: React.ExoticComponent<React.ConsumerProps<DockContext>>;
export interface SavedTab {
    id: string;
    group: string;
}
export interface SavedPanel {
    id: string;
    group: string;
    size: number;
    tabs: SavedTab[];
    activeId: string;
    x?: number;
    y?: number;
    z?: number;
    w?: number;
    h?: number;
}
export interface SavedBox {
    id: string;
    mode: DockMode;
    size: number;
    children: (SavedBox | SavedPanel)[];
}
export interface SavedLayout {
    dockbox: SavedBox;
    floatbox: SavedBox;
}
export interface SaveModifier {
    modifySavedPanel?(savedPanel: SavedPanel, panelData: PanelData): void;
    modifySavedTab?(savedTab: SavedTab, tabData: TabData): void;
}
export interface LoadModifier {
    modifyLoadedPanel?(savedPanel: SavedPanel, panelData: PanelData): void;
    loadTab?(savedTab: SavedTab): TabData;
}
export {};

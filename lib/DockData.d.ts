import React from 'react';
interface DockDataBase {
    minWidth?: number;
    minHeight?: number;
}
export declare type DockMode = 'horizontal' | 'vertical' | 'float';
export interface BoxData extends DockDataBase {
    id?: string | number;
    parent?: BoxData;
    size?: number;
    mode?: DockMode;
    children: (BoxData | PanelData)[];
}
export interface TabGroup {
    floatable?: boolean;
    multiTabs?: boolean;
    tabLocked?: boolean;
    panelClass?: string;
    animated?: boolean;
}
export interface TabData extends DockDataBase {
    id?: string;
    parent?: PanelData;
    title: string;
    content: React.ReactElement | (() => React.ReactElement);
    closable?: boolean;
    cached?: boolean;
    group: TabGroup;
}
export interface PanelData extends DockDataBase {
    id?: string | number;
    parent?: BoxData;
    activeId?: string;
    tabs: TabData[];
    group: TabGroup;
    size?: number;
    panelLocked?: boolean;
    x?: number;
    y?: number;
    z?: number;
    w?: number;
    h?: number;
}
export interface LayoutData {
    dockbox?: BoxData;
    floatbox?: BoxData;
}
export declare type DropDirection = 'left' | 'right' | 'bottom' | 'top' | 'middle' | 'remove' | 'before-tab' | 'after-tab' | 'float';
export interface DockContext {
    /** @ignore */
    setDropRect(element: HTMLElement, direction?: DropDirection, source?: any, event?: MouseEvent): void;
    moveTab(tab: TabData, target: TabData | PanelData | BoxData, direction: DropDirection): void;
    movePanel(panel: PanelData, target: PanelData, direction: DropDirection): void;
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
export {};

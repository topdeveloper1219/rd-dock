import React from "react";
import { DockContext, DropDirection, PanelData, TabData } from "./DockData";
import * as DragManager from "./dragdrop/DragManager";
export declare class TabCache {
    _ref: HTMLDivElement;
    getRef: (r: HTMLDivElement) => void;
    _hitAreaRef: HTMLDivElement;
    getHitAreaRef: (r: HTMLDivElement) => void;
    data: TabData;
    context: DockContext;
    content: React.ReactElement;
    constructor(context: DockContext);
    setData(data: TabData): boolean;
    onCloseClick: (e: React.MouseEvent) => void;
    onKeyDownCloseBtn: (evt: React.KeyboardEvent) => boolean;
    onDragStart: (e: DragManager.DragState) => void;
    onDragOver: (e: DragManager.DragState) => void;
    onDragLeave: (e: DragManager.DragState) => void;
    onDrop: (e: DragManager.DragState) => void;
    getDropDirection(e: DragManager.DragState): DropDirection;
    render(): React.ReactElement;
    destroy(): void;
}
interface Props {
    panelData: PanelData;
    onPanelDragStart: DragManager.DragHandler;
    onPanelDragMove: DragManager.DragHandler;
    onPanelDragEnd: DragManager.DragHandler;
}
export declare class DockTabs extends React.PureComponent<Props, any> {
    static contextType: React.Context<DockContext>;
    static readonly propKeys: string[];
    context: DockContext;
    _cache: Map<string, TabCache>;
    cachedTabs: TabData[];
    updateTabs(tabs: TabData[]): void;
    onMaximizeClick: () => void;
    onNewWindowClick: () => void;
    onKeyDownMaximizeBtn: (evt: React.KeyboardEvent) => boolean;
    renderTabBar: (props: any, DefaultTabBar: React.ComponentType) => JSX.Element;
    onTabChange: (activeId: string) => void;
    render(): React.ReactNode;
}
export {};

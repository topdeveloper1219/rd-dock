import React from "react";
import * as DragManager from "./dragdrop/DragManager";
import type { TabNavListProps } from "rc-tabs/lib/TabNavList";
interface DockTabBarProps extends TabNavListProps {
    panelId: string;
    onDragStart?: DragManager.DragHandler;
    onDragMove?: DragManager.DragHandler;
    onDragEnd?: DragManager.DragHandler;
    TabNavList: React.ComponentType;
}
export declare function DockTabBar(props: DockTabBarProps): JSX.Element;
export {};

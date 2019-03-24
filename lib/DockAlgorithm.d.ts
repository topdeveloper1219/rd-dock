import { BoxData, DropDirection, LayoutData, PanelData, TabData, TabGroup } from "./DockData";
export declare const placeHolderGroup: TabGroup;
export declare function getUpdatedObject(obj: any): any;
export declare function addTabToTab(layout: LayoutData, tab: TabData, target: TabData, direction: DropDirection): LayoutData;
export declare function addTabToPanel(layout: LayoutData, tab: TabData, panel: PanelData, idx?: number): LayoutData;
export declare function newPanelFromTab(tab: TabData): PanelData;
export declare function dockPanelToPanel(layout: LayoutData, newPanel: PanelData, panel: PanelData, direction: DropDirection): LayoutData;
export declare function dockPanelToBox(layout: LayoutData, newPanel: PanelData, box: BoxData, direction: DropDirection): LayoutData;
export declare function floatPanel(layout: LayoutData, newPanel: PanelData, rect: {
    left: number;
    top: number;
    width: number;
    height: number;
}): LayoutData;
export declare function removeTab(layout: LayoutData, tab: TabData): LayoutData;
export declare function fixLayoutData(layout: LayoutData): LayoutData;

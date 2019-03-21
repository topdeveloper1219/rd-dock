import React from "react";
import { DockContext, DropDirection, PanelData } from "./DockData";
interface DockDropSquareProps {
    direction: DropDirection;
    panelData: PanelData;
    panelElement: HTMLElement;
}
interface DockDropSquareState {
    dropping: boolean;
}
export declare class DockDropSquare extends React.PureComponent<DockDropSquareProps, DockDropSquareState> {
    static contextType: React.Context<DockContext>;
    context: DockContext;
    state: {
        dropping: boolean;
    };
    onDragOver: (e: React.DragEvent<Element>) => void;
    onDragLeave: (e: React.DragEvent<Element>) => void;
    onDrop: (e: React.DragEvent<Element>) => void;
    render(): React.ReactNode;
}
interface DockDropLayerProps {
    panelData: PanelData;
    panelElement: HTMLElement;
    dropFromPanel: PanelData;
}
export declare class DockDropLayer extends React.PureComponent<DockDropLayerProps, any> {
    static contextType: React.Context<DockContext>;
    context: DockContext;
    onDragOver: (e: React.DragEvent<Element>) => void;
    onDrop: (e: React.DragEvent<Element>) => void;
    render(): React.ReactNode;
}
export {};

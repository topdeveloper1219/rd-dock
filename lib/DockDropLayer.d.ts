import React from "react";
import { DockContext, DockMode, DropDirection, PanelData } from "./DockData";
interface DockDropSquareProps {
    direction: DropDirection;
    depth?: number;
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
    componentWillUnmount(): void;
}
interface DockDropLayerProps {
    panelData: PanelData;
    panelElement: HTMLElement;
    dropFromPanel: PanelData;
}
export declare class DockDropLayer extends React.PureComponent<DockDropLayerProps, any> {
    static addDepthSquare(children: React.ReactNode[], mode: DockMode, panelData: PanelData, panelElement: HTMLElement, depth?: number): void;
    render(): React.ReactNode;
}
export {};

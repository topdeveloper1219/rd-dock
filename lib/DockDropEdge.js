"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const DockData_1 = require("./DockData");
const DragDropDiv_1 = require("./dragdrop/DragDropDiv");
const DragManager_1 = require("./dragdrop/DragManager");
class DockDropEdge extends react_1.default.PureComponent {
    constructor() {
        super(...arguments);
        this.getRef = (r) => {
            this._ref = r;
        };
        this.onDragOver = (e) => {
            let { panelData, panelElement, dropFromPanel } = this.props;
            let draggingPanel = DragManager_1.DragState.getData('panel', DockData_1.DockContextType);
            let fromGroup = this.context.getGroup(dropFromPanel.group);
            if (draggingPanel && draggingPanel.parent.mode === 'float') {
                // ignore float panel in edge mode
                return;
            }
            let { direction, mode, depth } = this.getDirection(e);
            depth = this.getActualDepth(depth, mode, direction);
            if (!direction) {
                this.context.setDropRect(null, 'remove', this);
            }
            let targetElement = panelElement;
            for (let i = 0; i < depth; ++i) {
                targetElement = targetElement.parentElement;
            }
            this.context.setDropRect(targetElement, direction, this, e);
            e.accept('');
        };
        this.onDragLeave = (e) => {
            this.context.setDropRect(null, 'remove', this);
        };
        this.onDrop = (e) => {
            let { panelData, dropFromPanel } = this.props;
            let source = DragManager_1.DragState.getData('tab', DockData_1.DockContextType);
            if (!source) {
                source = DragManager_1.DragState.getData('panel', DockData_1.DockContextType);
            }
            if (source) {
                let { direction, mode, depth } = this.getDirection(e);
                depth = this.getActualDepth(depth, mode, direction);
                if (!direction) {
                    return;
                }
                let target = panelData;
                for (let i = 0; i < depth; ++i) {
                    target = target.parent;
                }
                this.context.dockMove(source, target, direction);
            }
        };
    }
    getDirection(e) {
        let rect = this._ref.getBoundingClientRect();
        let left = (e.clientX - rect.left) / rect.width;
        let right = (rect.right - e.clientX) / rect.width;
        let top = (e.clientY - rect.top) / rect.height;
        let bottom = (rect.bottom - e.clientY) / rect.height;
        let min = Math.min(left, right, top, bottom);
        let depth = 0;
        if (min < 0) {
            return { direction: null, depth: 0 };
        }
        else if (min < 0.075) {
            depth = 3; // depth 3 or 4
        }
        else if (min < 0.15) {
            depth = 1; // depth 1 or 2
        }
        else if (min < 0.3) {
            // default
        }
        else {
            return { direction: 'float', mode: 'float', depth: 0 };
        }
        switch (min) {
            case left: {
                return { direction: 'left', mode: 'horizontal', depth };
            }
            case right: {
                return { direction: 'right', mode: 'horizontal', depth };
            }
            case top: {
                return { direction: 'top', mode: 'vertical', depth };
            }
            case bottom: {
                return { direction: 'bottom', mode: 'vertical', depth };
            }
        }
        // probably a invalid input causing everything to be NaN?
        return { direction: null, depth: 0 };
    }
    getActualDepth(depth, mode, direction) {
        let afterPanel = (direction === 'bottom' || direction === 'right');
        if (!depth) {
            return depth;
        }
        let { panelData } = this.props;
        let previousTarget = panelData;
        let targetBox = panelData.parent;
        let lastDepth = 0;
        if (panelData.parent.mode === mode) {
            ++depth;
        }
        while (targetBox && lastDepth < depth) {
            if (targetBox.mode === mode) {
                if (afterPanel) {
                    if (targetBox.children[targetBox.children.length - 1] !== previousTarget) {
                        // dont go deeper if current target is on different side of the box
                        break;
                    }
                }
                else {
                    if (targetBox.children[0] !== previousTarget) {
                        // dont go deeper if current target is on different side of the box
                        break;
                    }
                }
            }
            previousTarget = targetBox;
            targetBox = targetBox.parent;
            ++lastDepth;
        }
        while (depth > lastDepth) {
            depth -= 2;
        }
        return depth;
    }
    render() {
        return (react_1.default.createElement(DragDropDiv_1.DragDropDiv, { getRef: this.getRef, className: 'dock-drop-edge', onDragOverT: this.onDragOver, onDragLeaveT: this.onDragLeave, onDropT: this.onDrop }));
    }
    componentWillUnmount() {
        this.context.setDropRect(null, 'remove', this);
    }
}
DockDropEdge.contextType = DockData_1.DockContextType;
exports.DockDropEdge = DockDropEdge;
//# sourceMappingURL=DockDropEdge.js.map
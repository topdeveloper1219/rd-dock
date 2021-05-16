"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockTabBar = void 0;
const react_1 = __importDefault(require("react"));
const DragDropDiv_1 = require("./dragdrop/DragDropDiv");
const DockData_1 = require("./DockData");
/**
 * @return returns true if navigation is handled in local tab move, otherwise returns false
 */
function checkLocalTabMove(key, tabbar, tabBtn) {
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
        let tabs = Array.from(tabbar.querySelectorAll('.dock-tab-btn'));
        let i = tabs.indexOf(tabBtn);
        if (i >= 0) {
            if (key === 'ArrowLeft') {
                if (i > 0) {
                    tabs[i - 1].click();
                    tabs[i - 1].focus();
                    return true;
                }
            }
            else {
                if (i < tabs.length - 1) {
                    tabs[i + 1].click();
                    tabs[i + 1].focus();
                    return true;
                }
            }
        }
    }
    return false;
}
function DockTabBar(props) {
    const { panelId, onDragStart, onDragMove, onDragEnd, TabNavList } = props, restProps = __rest(props, ["panelId", "onDragStart", "onDragMove", "onDragEnd", "TabNavList"]);
    const layout = react_1.default.useContext(DockData_1.DockContextType);
    const ref = react_1.default.useRef();
    const getRef = (div) => {
        ref.current = div;
    };
    const onKeyDown = (e) => {
        let tabBtn = e.target;
        if (tabBtn.classList.contains('dock-tab-btn') && e.key.startsWith('Arrow')) {
            if (!checkLocalTabMove(e.key, ref.current, tabBtn)) {
                layout.navigateToPanel(tabBtn, e.key);
            }
            e.stopPropagation();
            e.preventDefault();
        }
    };
    return (react_1.default.createElement(DragDropDiv_1.DragDropDiv, { onDragStartT: onDragStart, onDragMoveT: onDragMove, onDragEndT: onDragEnd, role: "tablist", className: "dock-bar", onKeyDown: onKeyDown, getRef: getRef },
        react_1.default.createElement(TabNavList, Object.assign({}, restProps))));
}
exports.DockTabBar = DockTabBar;

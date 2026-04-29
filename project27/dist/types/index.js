export var NodeType;
(function (NodeType) {
    NodeType["RECTANGLE"] = "rectangle";
    NodeType["DIAMOND"] = "diamond";
    NodeType["CIRCLE"] = "circle";
    NodeType["PARALLELOGRAM"] = "parallelogram";
    NodeType["SWIMLANE"] = "swimlane";
})(NodeType || (NodeType = {}));
export var PortType;
(function (PortType) {
    PortType["INPUT"] = "input";
    PortType["OUTPUT"] = "output";
})(PortType || (PortType = {}));
export var ConnectionStyle;
(function (ConnectionStyle) {
    ConnectionStyle["STRAIGHT"] = "straight";
    ConnectionStyle["POLYLINE"] = "polyline";
    ConnectionStyle["CURVE"] = "curve";
})(ConnectionStyle || (ConnectionStyle = {}));
export var AlignType;
(function (AlignType) {
    AlignType["LEFT"] = "left";
    AlignType["CENTER_HORIZONTAL"] = "centerH";
    AlignType["RIGHT"] = "right";
    AlignType["TOP"] = "top";
    AlignType["CENTER_VERTICAL"] = "centerV";
    AlignType["BOTTOM"] = "bottom";
})(AlignType || (AlignType = {}));
export var DistributeType;
(function (DistributeType) {
    DistributeType["HORIZONTAL"] = "horizontal";
    DistributeType["VERTICAL"] = "vertical";
})(DistributeType || (DistributeType = {}));

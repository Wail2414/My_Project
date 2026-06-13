import React from "react";
import GaugeItem from "./GaugeItem";
import TextItem from "./TextItem";
import NavigateItem from "./NavigateItem";
import SliderItem from "./SliderItem";
import ChartItem from "./ChartItem";
import LedItem from "./LedItem";
import ImageItem from "./ImageItem";
import RectangleItem from "./RectangleItem";
import SquareItem from "./SquareItem";
import TriangleItem from "./TriangleItem";
import RhombusItem from "./RhombusItem";
import CircleItem from "./CircleItem";
import HexagonItem from "./HexagonItem";
import PentagonItem from "./PentagonItem";
import StarItem from "./StarItem";
import EllipseItem from "./EllipseItem";
import MotorControlItem from "./MotorControlItem";

const DroppedItem = ({ item, mode }) => {
  const position = item.position || { x: 0, y: 0 }; // ← sécurité ici

  const commonProps = {
    id: item.id,
    style: {
      position: "absolute",
      left: position.x,
      top: position.y,
    },
    settingsData: item.settings,
    mode,
  };

  switch (item.type) {
    case "GAUGE":
      return <GaugeItem {...commonProps} />;
    case "TEXT":
      return <TextItem {...commonProps} />;
    case "NAV":
      return <NavigateItem {...commonProps} />;
    case "SLIDER":
      return <SliderItem {...commonProps} />;
    case "CHART":
      return <ChartItem {...commonProps} />;
    case "LED":
      return <LedItem {...commonProps} />;
    case "IMAGE":
      return <ImageItem {...commonProps} />;
    case "RECTANGLE":
      return <RectangleItem {...commonProps} />;
    case "SQUARE":
      return <SquareItem {...commonProps} />;
    case "TRIANGLE":
      return <TriangleItem {...commonProps} />;
    case "LOSANGE":
      return <RhombusItem {...commonProps} />;
    case "CIRCLE":
      return <CircleItem {...commonProps} />;
    case "PENTAGON":
      return <PentagonItem {...commonProps} />;
    case "HEXAGON":
      return <HexagonItem {...commonProps} />;
    case "STAR":
      return <StarItem {...commonProps} />;
    case "ELLIPSE":
      return <EllipseItem {...commonProps} />;
    case "MOTOR":
      return <MotorControlItem {...commonProps} />;
    default:
      return null;
  }
};

export default DroppedItem;

import {
  CaretRightOutlined,
  FlagOutlined,
  PauseOutlined,
  PlusSquareOutlined,
  StopOutlined,
  UndoOutlined
} from "@ant-design/icons";
import { Button, Col, Input, Row } from "antd";
import React, { Component } from "react";
import "./index.less";

export class PropertyPanel extends Component<any> {
  state = {
    playing: false,
    properties: []
  };
  componentDidMount() {}

  setProperties(properties: any) {
    this.setState({
      properties
    });
  }
  togglePlay = () => {
    const { onPlay, onPause } = this.props;
    const { playing } = this.state;
    if (playing) {
      this.setState({
        playing: false
      });
      onPause();
    } else {
      this.setState({
        playing: true
      });
      onPlay();
    }
  };
  render() {
    const { properties, playing } = this.state;
    const { togglePlay } = this;
    const { onStop, onReplay, onSetDuration, onSetCurrentTime } = this.props;
    const propertyItems = properties.map((property: any, index: number) => {
      const { name, data, onAdd } = property;
      return (
        <Row className="propertyItem" key={index}>
          <Col span={8} className="propertyNameWrap">
            <span>{name}</span>
          </Col>
          <Col span={8} offset={8} className="propertyItemOperate">
            <Button
              type="primary"
              className="addKeyframeBtn"
              size={"small"}
              icon={<PlusSquareOutlined />}
              onClick={() => {
                onAdd && onAdd(name, data, index);
              }}
            />
          </Col>
        </Row>
      );
    });
    return (
      <div className="propertyPanel">
        <Row className="operationWrap">
          <Button.Group size="small" className="buttonGroup">
            <Button type="primary" icon={playing ? <PauseOutlined /> : <CaretRightOutlined />} onClick={togglePlay} />
            <Button type="primary" icon={<UndoOutlined />} onClick={onReplay} />
            <Button type="primary" icon={<FlagOutlined />} onClick={onSetDuration} />
          </Button.Group>
          <div className="currentTime">
            <Input
              className="currentTimeInput"
              placeholder="currentTime"
              size="small"
              onChange={(e) => {
                const { value } = e.target;
                if (!isNaN(+value)) {
                  onSetCurrentTime(value);
                }
              }}
            />
          </div>
        </Row>
        {propertyItems}
      </div>
    );
  }
}

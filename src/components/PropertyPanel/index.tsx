import { CaretRightOutlined, PauseOutlined, PlusSquareOutlined, UndoOutlined } from "@ant-design/icons";
import { Button, Col, Input, InputNumber, Row, Tree, Dropdown, Menu } from "antd";
import React, { Component } from "react";
import type { DataNode } from "antd/lib/tree";
import "./index.less";
import { findParentElementByClass } from "../../utils";

export interface KeyframeData {
  key: string;
  property: string;
  subProperty?: string;
}
interface IProps {
  currentFrame: number;
  propertiesAdded: any[];
  onPlay: () => void;
  onPause: () => void;
  onReplay: () => void;
  onScroll: (scrollTop: number) => void;
  onSetCurrentFrame: (currentFrame: number) => void;
  onSetSamples: (samples: number) => void;
  onAddKeyframe: (keyframeData: KeyframeData) => void;
  onExpand: (key: string, expanded: boolean) => void;
}

export class PropertyPanel extends Component<IProps> {
  propertiesWrapRef: React.RefObject<HTMLDivElement>;
  propertiesLineIndexMap: Record<string, string> = {};
  constructor(props: IProps) {
    super(props);
    this.propertiesWrapRef = React.createRef();
  }
  state = {
    playing: false,
    showMenu: false
  };

  menu = (
    <Menu
      items={[
        {
          key: "1",
          label: (
            <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
              1st menu item
            </a>
          )
        },
        {
          key: "2",
          label: (
            <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
              2nd menu item (disabled)
            </a>
          ),
          disabled: true
        },
        {
          key: "3",
          label: (
            <a target="_blank" rel="noopener noreferrer" href="https://www.luohanacademy.com">
              3rd menu item (disabled)
            </a>
          ),
          disabled: true
        },
        {
          key: "4",
          danger: true,
          label: "a danger item"
        }
      ]}
    />
  );

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
    const { togglePlay } = this;
    const { playing } = this.state;
    const { onReplay, onSetSamples, onSetCurrentFrame, onScroll, onAddKeyframe, onExpand } = this.props;
    const propertiesAdded = this.props.propertiesAdded || [];
    const propertyTreeData = propertiesAdded.map((propertyAdded: any, index: number) => {
      const { name, properties, key } = propertyAdded;
      const isLeaf = !properties.length;
      let title = (
        <div className="propertyItem" key={key}>
          {name}
          {isLeaf && (
            <Button
              type="primary"
              className="addKeyframeBtn"
              size={"small"}
              icon={<PlusSquareOutlined />}
              onClick={(e) => {
                onAddKeyframe(propertyAdded);
              }}
            />
          )}
        </div>
      );
      const propertyTree: DataNode = {
        title,
        key: `${index}`,
        children: properties.map((property: any, subIndex: number) => {
          const { name: subPropertyName, key: subKey } = property;
          return {
            title: (
              <div className="propertyItem" key={subKey}>
                {subPropertyName}
                <Button
                  type="primary"
                  className="addKeyframeBtn"
                  size={"small"}
                  icon={<PlusSquareOutlined />}
                  onClick={(e) => {
                    onAddKeyframe(property);
                  }}
                />
              </div>
            ),
            key: `${index}-${subIndex}`
          };
        })
      };
      return propertyTree;
    });

    return (
      <div className="propertyPanel">
        <div className="operationWrap">
          <Button.Group size="small" className="buttonGroup">
            <Button
              className="icon-btn"
              type="primary"
              icon={playing ? <PauseOutlined /> : <CaretRightOutlined />}
              onClick={togglePlay}
            />
            <Button className="icon-btn" type="primary" icon={<UndoOutlined />} onClick={onReplay} />
          </Button.Group>
          <div className="inputWrap">
            <div className="samples">
              <Input
                prefix={<span>samples:</span>}
                placeholder="samples"
                size="small"
                defaultValue={60}
                onChange={(e) => {
                  const { value } = e.target;
                  if (+value > 0) {
                    onSetSamples(+value);
                  }
                }}
              />
            </div>
            <div className="currentFrame">
              <InputNumber
                prefix={<span>current:</span>}
                placeholder="current"
                size="small"
                defaultValue={0}
                value={this.props.currentFrame || 0}
                min={0}
                step={1}
                parser={(text) => (/^\d+$/.test(text!) ? +text! : parseInt(text!))}
                onChange={(currentFrame: number) => {
                  onSetCurrentFrame(currentFrame);
                }}
              />
            </div>
          </div>
        </div>
        <div
          className="propertiesWrap"
          ref={this.propertiesWrapRef}
          onScroll={(ev) => {
            const scrollTop = (ev.target as HTMLElement).scrollTop;
            onScroll(+scrollTop);
          }}
        >
          <Tree
            treeData={propertyTreeData}
            defaultExpandAll={true}
            onExpand={(expandKeys, nodeInfo) => {
              const {
                node: { key },
                expanded
              } = nodeInfo;
              onExpand(key as string, expanded);
            }}
          />
          <div className="addBtnWrap">
            <Dropdown overlay={this.menu} placement="topLeft" visible={this.state.showMenu}>
              <Button
                icon={<PlusSquareOutlined />}
                onBlur={() => {
                  this.setState({
                    showMenu: false
                  });
                }}
                onClick={() => {
                  this.setState({
                    showMenu: true
                  });
                }}
              >
                Add Property
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>
    );
  }
}

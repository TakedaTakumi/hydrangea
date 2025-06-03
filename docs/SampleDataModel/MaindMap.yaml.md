# マインドマップファイルのYAML形式

```yaml
background_color: "#fff"

defaults:
  node:
    content: "新しいノード"
    margin: 10
    padding: 5
  style:
    inherit_style: true
    fill: "#fff"
    stroke: "#000"
    edge: "#000"
    font:
      family: ""
      size: 14
      color: ""
      bold: false
      italic: false
      under: false

root:
  content: "新しいマップ"
  right:
    icon: ""
    children:
      - "node_ulid_1" # 右側の子ノードのID
  left:
    icon: ""
    children:
      - "node_ulid_2" # 左側の子ノードのID
  style:
    inherit_style: true
    fill: "#color"
    stroke: "#color"
    edge: "#color"
    font:
      family: ""
      size: 14
      bold: false
      italic: false
      under: false

node_list:
  "node_ulid_1":
    content: ""
    icon: ""
    children:
      - "child_ulid_1" # このノードの子ノードのID
    style:
      inherit_style: true
      fill: "#color"
      stroke: "#color"
      edge: "#color"
      font:
        family: ""
        size: 14
        bold: false
        italic: false
        under: false
  "node_ulid_2":
    content: ""
    icon: ""
    children:
      - "child_ulid_2" # このノードの子ノードのID
    style:
      inherit_style: true
      fill: "#color"
      stroke: "#color"
      edge: "#color"
      font:
        family: ""
        size: 14
        bold: false
        italic: false
        under: false
  # ... 他のノードも同様にリスト形式で記述
```

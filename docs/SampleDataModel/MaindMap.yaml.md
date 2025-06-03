# マインドマップファイルのYAML形式

```yaml
background_color: "#fff"

defaults:
  node:
    content: "新しいノード"
    icon: ""
    margin: 10
    padding: 5
    collapsed: false # ノードの折りたたみ状態（デフォルト:展開）
  style:
    inherit_style: true
    fill: "#fff"
    stroke: "#000"
    edge:
      color: "#000"
      type: "solid" # エッジの種類（solid / dotted / dashed など）
      width: 2 # エッジの太さ
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
    collapsed: false # ノードの折りたたみ状態
  left:
    icon: ""
    children:
      - "node_ulid_2" # 左側の子ノードのID
    collapsed: false # ノードの折りたたみ状態
  style:
    inherit_style: true
    fill: "#color"
    stroke: "#color"
    edge:
      color: "#color"
      type: "solid" # エッジの種類（solid / dotted / dashed など）
      width: 3 # エッジの太さ
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
      edge:
        color: "#color"
        type: "solid" # エッジの種類（solid / dotted / dashed など）
        width: 2 # エッジの太さ
      font:
        family: ""
        size: 14
        bold: false
        italic: false
        under: false
    collapsed: false # ノードの折りたたみ状態
  "node_ulid_2":
    content: ""
    icon: ""
    children:
      - "child_ulid_2" # このノードの子ノードのID
    style:
      inherit_style: true
      fill: "#color"
      stroke: "#color"
      edge:
        color: "#color"
        type: "solid" # エッジの種類（solid / dotted / dashed など）
        width: 2 # エッジの太さ
      font:
        family: ""
        size: 14
        bold: false
        italic: false
        under: false
    collapsed: false # ノードの折りたたみ状態
  # ... 他のノードも同様にリスト形式で記述
```

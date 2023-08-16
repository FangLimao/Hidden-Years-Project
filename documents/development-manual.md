# 技术手册
> 模组版本：隐藏之年1.x.x
> 
> 游戏版本：Minecraft基岩版1.20.12

## 目录
- [内部规范](#内部规范)
  - [版本规范](#版本规范)
  - [命令引用](#命令引用)
  - [文件储存与命名规范](#文件储存与命名规范)
- [开放接口](#开放接口)
  - [函框架API](#函框架API)
  - [物品标签](#物品标签)
  - [方块标签](#方块标签)
  - [玩家标签](#玩家标签)

## 内部规范
### 版本规范
遵循语义化版本规范，采用`<主版本号.次版本号.修订号>`的格式。

开发阶段：
- Snapshot（快照），处于开发阶段，这个阶段的附加包不可用于生存模式。
- Release（正式版），这个阶段的附加包可以于生存模式，可能有一些小漏洞。
- Hotfix（热修复），修复些许漏洞，不添加物品、方块。

打包后的模组文件应在文件名标清开发阶段。

### 命令引用
如果一个物品、方块或实体需要使用命令，请将该命令已函数的形式引用。

对于一些有用的函数，可以考虑将其公开成为`函框架API`。

### 文件储存与命名规范
#### 文件存储规范
物品存储规范：
```
|📁tools（存储工具类物品）
 |📁axes（存储斧类物品）
 |📁awls（存储锥类物品）
 |📁...
|📁weapons（存储武器类物品）
 |📁swords（存储剑类物品）
 |📁daggers（存储匕首类物品）
 |📁knifes（存储小刀类物品）
 |📁...
|📁materials（存储材料类物品）
|📁treasures（存储宝藏类物品）
|📁vanilla（修改原版物品）
|📁unused（存储弃用物品）
📝debug.json（测试物品）
```

函数存储规范：
```
|📁gameplay（存储游戏玩法相关函数）
|📁api（存储可复用的函数）
📝tick.json（游戏刻函数列表）
```
#### 文件命名规范
- 物品、方块、实体的行为文件使用其ID命名
- 文件名不可以包含作者名称等附加信息
- 不可以过长

好的命名示例：`copper_ingot`、`brass_pickaxe`

不好的命名示例：`oldb:lv2stone`、`oooollllllddddddddbbbbbbbbbbbbbbbbbbb:fang_limao`、`zheshiid:shitougongyi`、`kkkkkkkkkaaaaaaaaaaaaasssssssssssstttttttttttnnnnnnnnnnnaaaaaaaaaammmmmmmmmeeeeeeeeeee!!!!!!!!!!!!`


### 打包方式
为避免在UWP平台上可能的导入失败，应遵循以下打包方式：
1. 将行为包打包成`.mcpack`文件
2. 将资源包打包为`.mcpack`文件
3. 将行为包、资源包的`.mcpack`文件打包成`.mcaddon`文件

## 开放接口
### 函框架API
> 漓猫lib（不是

函框架本质是一个函数包，函数即预打包的命令，隐藏之年的一些功能需要函框架。

#### `upgrade_information`
- 版本：1.1
- 描述：模组更新后向所有玩家发送更新信息
- 调用方法：
	- `/function api/upgrade_information/v1.1`（清除所有状态效果）

#### `clear_effect`
- 版本：1.0
- 描述：清除状态效果
- 调用方法：
	- `/function api/clear_effect/v1.0/clear_all_effects`（清除所有状态效果）
	- `/function api/clear_effect/v1.0/clear_good_effects`（清除所有正面效果）
	- `/function api/clear_effect/v1.0/clear_bad_effecs`（清除所有负面效果）
	
#### `give_effect`
- 版本：1.0
- 描述：给予状态效果
- 可选参数：15s、30s、60s
- 调用方法：
	- `/function api/give_effect/v1.0/15s/give_all_effects`（给予15秒所有状态效果）
	- `/function api/give_effect/v1.0/15s/give_good_effects`（给予15秒所有正面状态效果）
	- `/function api/give_effect/v1.0/15s/give_bad_effects`（给予15秒所有负面状态效果）

#### `give_xp`
- 版本：1.0
- 描述：给予经验并播放音效
- 调用方法：
	- `/function api/give_xp/v1.0/base`（给予1点经验并播放音效）
	
#### `tetanus.effect`
- 版本：1.0
- 描述：给予『破伤风』状态效果集
- 可选参数：self、radius4
- 调用方法：
	- `/function api/tetanus.effect/v1.0/radius4/lv1`（给予半径四格内除自己外所有实体一级破伤风）
	- `/function api/tetanus.effect/v1.0/radius4/lv2`（给予半径四格内除自己外所有实体二级破伤风）
	- `/function api/tetanus.effect/v1.0/radius4/lv3`（给予半径四格内除自己外所有实体三级破伤风）
	- `/function api/tetanus.effect/v1.0/self/lv1`（给予自己一级破伤风）
	- `/function api/tetanus.effect/v1.0/self/lv2`（给予自己二级破伤风）
	- `/function api/tetanus.effect/v1.0/self/lv3`（给予自己三级破伤风）
	 
#### `body_corrosion.effect`
> 这是一个计划中的API，目前无法调用

- 版本：1.0
- 描述：给予『身心腐蚀』状态效果集
- 调用方法：
	- `/function api/clear_effect/v1.0/clear_all_effects`（清除所有状态效果）
	- `/function api/clear_effect/v1.0/clear_good_effects`（清除所有正面效果）
	- `/function api/clear_effect/v1.0/clear_bad_effecs`（清除所有负面效果）	
	
### 物品标签
- 斑驳的物品
	- 用于合成
```
hy:exposed_item
```

- 锈蚀的物品
	- 用于合成
```
hy:weathered_item
```

- 氧化的物品
	- 用于合成
```
hy:oxidized_item
```

- 燃金
	- 用于合成
```
hy:fuel
```

- 药物
	- 用于合成
```
hy:medicine_poison
```

- 斧
	- 用于剥皮原木
```
minecraft:is_axe
```

- 锹
	- 用于制造土径
```
minecraft:is_shovel
```

- 锄
	- 用于制造耕地
```
minecraft:is_hoe
```

- 锤
  - 保留标签
```
hy:is_hammer
```

- `impart`
	- 保留标签
```
hy:is_impart
```

## 方块标签
- 金属方块
  - 用于挖掘
```
metal
```

- 岩金石
  - 用于挖掘
```
stone
```

## 玩家标签
```
hy.temp.tetanus_attacker
```
- 用于标记攻击者
	- 添加标签后的玩家将无法受破伤风影响
    
```
hy.temp.exposed_attacker
```
- 用于标记攻击者
	- 添加标签的玩家将无法受锈蚀攻击影响

    
```
hy.updateXYYZ
```
- 用于标记已更新版本者
	- 缺失此标签的玩家将收到更新提示

---

## 附录
### 原版挖掘速度表
> 本文档挖掘速度指`minecraft:digger`中定义的`speed`值

| 值 | 描述 |
| -------- | -------- |
| `0` | 无法挖掘 |
| `2` | 木工具挖掘速度 | 
| `3` | 石工具挖掘速度 |   
| `6` | 钻石工具挖掘速度 | 
| `7` | 下界合金工具挖掘速度 | 
| `8` | 金工具挖掘速度 | 

### 原版道具耐久表

| 道具 | 耐久 | 其他 |
| -------- | -------- | -------- |
| 木 | 59 |  |
| 石 | 131 |  |
| 铁 | 250 |  |
| 金 | 32 |  |
| 钻石 | 1561 |  |
| 下界合金 | 2031 |  |

### 原版伤害来源
| 伤害来源 | ID |
| -------- | -------- |
| all |  |  
| anvil |  |  
| block_explosion |  |  
| charging |  |  
| contact |  |  
| drowning |  | 
| entity_attack	||
| entity_explosion	||
|fall	||
|falling_block	||
|fire	||
|fire_tick	||
|fireworks	||
|fly_into_wall	||
|freezing	||
|lava	||
|lightning	||
|magic	||
|magma	||
|none	||
|override	||
|piston	||
|projectile	||
|stalactite	||
|stalagmite	||
|starve	||
|suffocation	||
|suicide	||
|temperature	||
|thorns	||
|void	||
|wither ||

### 原版道具伤害表
import * as mc from "@minecraft/server";
import * as hyApi from "../dependencies/hy2Utils.js";
import { HyQuestCondition, HyQuestAward } from "./data.js";
import { Quest } from "../dependencies/hy2Quest.js";

export const COPPER_APPLE = new Quest(
  "copper_apple",
  "§d[超级美食家]§r 重金属超标",
  "将铜锭与苹果捏合到一起，就会有神奇的事情发生……不过听说吃多了会中毒哦～",
  HyQuestCondition.copperApple,
  HyQuestAward.goldenApple3,
);
export const METAL_STAR = new Quest(
  "metal_star",
  "§d[策划大失败]§r 半吊子引雷士",
  "这个东西理论上可以引雷，啊嘞，怎么引不了了……",
  HyQuestCondition.metalStar,
  HyQuestAward.diamondCoin9,
);
export const COPPER_ESSENCE = new Quest(
  "copper_essence",
  "§d[策划大失败]§r 没有用的东西",
  "恭喜你，获得了此模组最没有用的东西！！！（是的，我在写这句话的时候也都忘了这个东西叫啥了）",
  HyQuestCondition.copperEssence,
  HyQuestAward.dirt12,
);

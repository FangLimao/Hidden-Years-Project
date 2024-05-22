/** hy2-utils
 * @version v0.1.0
 * @author FangLimao <mucigames@outlook.com>
 * @author RawDiamondMC <RawDiamondMC@outlook.com>
 * @license BSD-3
 */
import * as mc from "@minecraft/server";
import * as mcui from "@minecraft/server-ui";
import * as hyData from "../data/data.js";
import * as sapi from "sapi-utils";

/**
 * 让物品堆开始冷却
 * @param itemStack 要冷却的物品
 * @param player 触发冷却的玩家
 * @returns 开始冷却的物品
 */
export function startCooldown(itemStack: mc.ItemStack, player: mc.Player) {
  const COOLDOWN = itemStack.getComponent("cooldown");
  if (COOLDOWN === undefined) return itemStack;
  COOLDOWN.startCooldown(player);
  return itemStack;
}

/**
 * 在特定维度筛选实体并对其造成伤害
 * @param dimension 实体所在维度
 * @param damageOption 实体的类型
 * @param amount 伤害数量
 * @since v0.1.0
 */
export function damageEntities(
  dimension: mc.Dimension,
  damageOption: mc.EntityQueryOptions,
  amount: number,
) {
  const TARGET = dimension.getEntities(damageOption);
  TARGET.forEach((targets) => {
    targets.applyDamage(amount);
  });
}

/**
 * 在特定维度筛选实体并赋予其状态效果
 * @param dimension 实体所在维度
 * @param affectOption 实体的类型
 * @param effectType 效果类型
 * @param duration 效果持续时长
 * @param effectOption 效果选项
 * @since v0.1.0
 */
export function affectEntities(
  dimension: mc.Dimension,
  affectOption: mc.EntityQueryOptions,
  effectType: mc.EffectType | string,
  duration: number,
  effectOption?: mc.EntityEffectOptions,
) {
  const TARGET = dimension.getEntities(affectOption);
  TARGET.forEach((targets) => {
    targets.addEffect(effectType, duration, effectOption);
  });
}

/**
 * 造成仿制伤害
 * @param entity 使用了仿制工具的实体
 * @since v0.1.0
 */
export function applyImitationDamage(entity: mc.Entity) {
  switch (sapi.randomInteger(10, 1)) {
    case 1:
      entity?.applyDamage(2);
      if (entity instanceof mc.Player) {
        entity?.sendMessage([{ translate: "hy.message.imitation_damage.1" }]);
      }
      break;
    case 2:
      entity?.applyDamage(8);
      if (entity instanceof mc.Player) {
        entity?.sendMessage([{ translate: "hy.message.imitation_damage.2" }]);
      }
      break;
    default:
      break;
  }
}

/**
 * 输出一个错误
 * @param data 错误信息
 * @author RawDiamondMC <RawDiamondMC@outlook.com>
 * @since v0.1.0
 */
export function error(data: any) {
  console.error(`[HY2] ${data}`);
}

/**
 * 为物品消耗耐久值
 * @param itemStack 要消耗耐久的物品
 * @param value 要消耗的耐久值
 * @param entity 破坏工具的生物
 * @returns 消耗耐久值完毕的物品
 * @since v0.1.0
 */
export function consumeDurability(
  itemStack: mc.ItemStack,
  value: number,
  entity?: mc.Entity,
) {
  let durability = itemStack.getComponent("minecraft:durability");
  if (durability === undefined) return itemStack;
  if (durability.damage + value >= durability.maxDurability) {
    if (itemStack.hasTag("hy:corrosive_tools")) {
      // @ts-ignore
      return hyData.HyCorrosionMap[itemStack.typeId.replace("hy:", "")];
    }
    if (entity instanceof mc.Player) {
      entity.playSound("random.break");
    }
    return undefined;
  } else {
    durability.damage += value;
    return itemStack;
  }
}

/**
 * 获取实体主手的物品堆
 * @param entity 要获取主手物品的实体
 * @returns 实体主手的物品堆
 * @since v0.1.0
 */
export function getEquipmentItem(entity: mc.Entity) {
  return entity
    .getComponent("minecraft:equippable")
    .getEquipment(mc.EquipmentSlot.Mainhand);
}

/**
 * 生成一张散落的信纸
 * @param title 信纸的标题
 * @param body 信纸的内容
 * @param typeId 信纸的物品ID
 * @since v0.1.0
 */
export function createLetterForm(title: string, body: string, typeId: string) {
  const FORM = new mcui.ActionFormData()
    .title(title)
    .body(body)
    .button({ translate: "gui.ok" });
  mc.world.afterEvents.itemUse.subscribe((event) => {
    if (event.itemStack.typeId === typeId) {
      FORM.show(event.source);
    }
  });
}

/** hy-utils
 * @version v0.1.0
 * @author FangLimao <mucigames@outlook.com>
 * @author RawDiamondMC <RawDiamondMC@outlook.com>
 */
import * as mc from "@minecraft/server";
import * as mcui from "@minecraft/server-ui";
import * as hyData from "./data.js";

/**
 * 获取物品栏中指定物品的数量
 * @param container 要检查的物品栏
 * @param item 物品Id
 * @author RawDiamondMC <RawDiamondMC@outlook.com>
 * @since v0.1.0
 */
export function getItemAmountInContainer(
  container: mc.Container,
  item: string,
) {
  let amount: number = 0;
  for (let slot = 0; slot < container.size; slot++) {
    const itemStack: undefined | mc.ItemStack = container.getItem(slot);
    if (itemStack?.typeId === item) {
      amount++;
    }
  }
  return amount;
}

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
  switch (getRandomChance()) {
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
 * 为实体移除状态效果
 * @param entity 要移除状态效果的实体
 * @param effectType 要移除的状态效果，除了原版效果外还可填`bad`、`good`、`all`
 * @since v0.1.0
 */
export function clearEffect(
  entity: mc.Entity,
  effectType: mc.EffectType | string,
) {
  switch (effectType) {
    case "all":
      entity.getEffects().forEach((effect) => {
        entity.removeEffect(effect.typeId);
      });
      break;
    case "bad":
      entity.removeEffect("slowness");
      entity.removeEffect("mining_fatigue");
      entity.removeEffect("instant_damage");
      entity.removeEffect("nausea");
      entity.removeEffect("blindness");
      entity.removeEffect("hunger");
      entity.removeEffect("weakness");
      entity.removeEffect("poison");
      entity.removeEffect("wither");
      entity.removeEffect("fatal_poison");
      entity.removeEffect("bad_omen");
      entity.removeEffect("levitation");
      entity.removeEffect("darkness");
      break;
    case "good":
      entity.removeEffect("speed");
      entity.removeEffect("haste");
      entity.removeEffect("strength");
      entity.removeEffect("instant_health");
      entity.removeEffect("regeneration");
      entity.removeEffect("jump_boost");
      entity.removeEffect("invisibility");
      entity.removeEffect("water_breathing");
      entity.removeEffect("health_boost");
      entity.removeEffect("night_vision");
      entity.removeEffect("saturation");
      entity.removeEffect("absorption");
      entity.removeEffect("village_hero");
      entity.removeEffect("conduit_power");
      entity.removeEffect("slow_falling");
      break;
    default:
      entity.removeEffect(effectType);
      break;
  }
}

/**
 * 生成一个随机数
 * @param max 随机数最大值，小数将被解析为整数
 * @param min 随机数最小值，小数将被解析为整数
 * @returns 一个范围内的随机数
 * @throws 当max<min时抛出RangeError
 * @author RawDiamondMC <RawDiamondMC@outlook.com>
 * @since v0.1.0
 */
export function rand(max: number, min?: number) {
  if (min == undefined) min = 0;
  max = parseInt(String(max));
  min = parseInt(String(min));
  if (max < min) {
    throw new RangeError(
      `rand() is used incorrectly ! Expect:any numbers higher than ${min}. Current: ${max}`,
    );
  }
  if (max == min) {
    return max;
  }
  const random: number = mc.system.currentTick + Math.random() * max;
  return parseInt(String(random / max)) + min;
}

/**
 * 获取1-10随机整数
 * @returns 1-10随机整数
 * @since v0.1.0
 */
export function getRandomChance() {
  let randomChance = Math.ceil(Math.random() * 10);
  console.warn("Random chance is " + randomChance);
  return randomChance;
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
    ?.getComponent("minecraft:equippable")
    ?.getEquipment(mc.EquipmentSlot.Mainhand);
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
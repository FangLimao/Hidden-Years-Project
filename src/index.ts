import * as mc from "@minecraft/server";
import * as hy from "./utils.js";
import * as hydata from "./data.js";
import * as hytext from "./text.js";

/** 清除铜食物食用次数 */
mc.system.runInterval(() => {
  const PLAYERS = mc.world.getPlayers();
  PLAYERS.forEach((players) => {
    players.setDynamicProperty("hy:copper_foods", 0);
    console.warn("[hy2]铜食物使用次数已归零");
  });
}, 18000);

/** 处理阅读物及任务书 */
hy.createQuestBook(hydata.HyQuest1st);
hy.createStoryForm("hy:story_book");
for (let i = 0; i <= 10; i++) {
  hy.createLetterForm(
    // @ts-ignore
    hytext.HyLetterTitle[i],
    // @ts-ignore
    hytext.HyLetterBody[i],
    `hy:letter_${i}`,
  );
}

/** 玩家生成时检测的事件，即是否给予任务书 */
mc.world.afterEvents.playerSpawn.subscribe((event) => {
  const PLAYER = event.player;
  if (!PLAYER.hasTag("hy:get_quest_book")) {
    hydata.HyRewardTypes.questBook1st.keepOnDeath = true;
    hydata.HyRewardTypes.questBook1st.lockMode = mc.ItemLockMode.inventory;
    PLAYER.dimension.spawnItem(
      hydata.HyRewardTypes.questBook1st,
      PLAYER.location,
    );
    PLAYER.addTag("hy:get_quest_book");
  }
});

/** 工具武器相关
 * 工具武器的耐久可以通过`hy:custom_tools`和`hy:custom_weapons`来监听 */
mc.world.afterEvents.playerBreakBlock.subscribe((event) => {
  const ENTITY = event.player;
  let ITEM = hy.getEquipmentItem(ENTITY);
  if (ITEM?.hasTag("hy:custom_tools")) {
    const NEW_ITEM = hy.consumeDurability(ITEM, 1, ENTITY);
    ENTITY?.getComponent("minecraft:equippable")?.setEquipment(
      mc.EquipmentSlot.Mainhand,
      NEW_ITEM,
    );
  } else if (ITEM?.hasTag("hy:custom_weapons")) {
    const NEW_ITEM = hy.consumeDurability(ITEM, 2, ENTITY);
    ENTITY?.getComponent("minecraft:equippable")?.setEquipment(
      mc.EquipmentSlot.Mainhand,
      NEW_ITEM,
    );
  }
  if (ITEM?.hasTag("hy:imitation_tools")) {
    hy.applyImitationDamage(ENTITY);
  }
});

mc.world.afterEvents.entityHitEntity.subscribe((event) => {
  const ENTITY = event.damagingEntity;
  let ITEM = hy.getEquipmentItem(event.damagingEntity);
  if (ITEM?.hasTag("hy:custom_weapons")) {
    const NEW_ITEM = hy.consumeDurability(ITEM, 1);
    ENTITY?.getComponent("minecraft:equippable")?.setEquipment(
      mc.EquipmentSlot.Mainhand,
      NEW_ITEM,
    );
  }
  if (ITEM?.hasTag("hy:custom_tools")) {
    const NEW_ITEM = hy.consumeDurability(ITEM, 2);
    ENTITY?.getComponent("minecraft:equippable")?.setEquipment(
      mc.EquipmentSlot.Mainhand,
      NEW_ITEM,
    );
  }
  if (ITEM?.hasTag("hy:imitation_tools")) {
    hy.applyImitationDamage(ENTITY);
  }
});

/** 范围伤害 */
mc.world.afterEvents.itemUse.subscribe((event) => {
  const PLAYER = event.source;
  const ITEM = event.itemStack;
  /** 破伤风伤害 */
  if (ITEM.hasTag("hy:tetanus_item")) {
    PLAYER.addTag("hy.tetanus_attacker");
    const TETANUS_OPINION: mc.EntityQueryOptions = {
      location: PLAYER.location,
      maxDistance: 4,
      excludeTags: ["hy.tetanus_attacker"],
      excludeFamilies: ["noaoe"],
    };
    hy.affectEntities(PLAYER.dimension, TETANUS_OPINION, "poison", 300);
    hy.affectEntities(PLAYER.dimension, TETANUS_OPINION, "nausea", 600, {
      amplifier: 1,
    });
    hy.affectEntities(PLAYER.dimension, TETANUS_OPINION, "wither", 6);
    PLAYER.removeTag("hy.tetanus_attacker");
  }
  /** 法器相关
   * 通过`hy:magic_explode`来使一个物品可以进行法术爆发/精通
   * 法术爆发/精通的实现
   * 法术爆发是指在限定范围内(12格)对所有生物造成限定伤害(10点)
   * 法术精通是指在更远的范围内(20格)对精通的生物造成限定伤害(8点) 并给予其虚弱15s
   * 法术精通与爆发同时进行 需要玩家有1级经验
   * 每次爆发消耗1耐久、15经验 并且有类型为`hy.magic_explode`的5秒冷却
   * 爆发开始后5秒内玩家不受任何原因的爆发伤害
   */
  if (ITEM.hasTag("hy:magic_explode")) {
    if (PLAYER.level > 1) {
      PLAYER.addTag("hy.magic_explode");
      const NEW_ITEM = hy.consumeDurability(ITEM, 1, PLAYER);
      hy.startCooldown(NEW_ITEM, PLAYER);
      PLAYER.getComponent("minecraft:equippable")?.setEquipment(
        mc.EquipmentSlot.Mainhand,
        NEW_ITEM,
      );
      PLAYER.addLevels(-1);
      const ALL_OPTION: mc.EntityQueryOptions = {
        location: PLAYER.location,
        maxDistance: 10,
        excludeTags: ["hy.magic_explode"],
        excludeFamilies: ["noaoe"],
      };
      hy.damageEntities(PLAYER.dimension, ALL_OPTION, 10);
      switch (ITEM.typeId) {
        case "hy:diamond_bone":
        case "hy:gold_bone":
        case "hy:iron_bone":
          const SKELETON_OPINION: mc.EntityQueryOptions = {
            location: PLAYER.location,
            maxDistance: 18,
            families: ["skeleton"],
          };
          hy.damageEntities(PLAYER.dimension, SKELETON_OPINION, 8);
          hy.affectEntities(
            PLAYER.dimension,
            SKELETON_OPINION,
            "weakness",
            300,
          );
          break;
        case "hy:flash_metal_boardsword":
          hy.damageEntities(PLAYER.dimension, ALL_OPTION, 8);
          hy.affectEntities(PLAYER.dimension, ALL_OPTION, "weakness", 300);
          break;
        case "hy:corrosion_boardsword":
          const UNDEAD_OPINION: mc.EntityQueryOptions = {
            location: PLAYER.location,
            maxDistance: 18,
            families: ["undead"],
          };
          hy.damageEntities(PLAYER.dimension, UNDEAD_OPINION, 8);
          hy.affectEntities(PLAYER.dimension, UNDEAD_OPINION, "weakness", 300);
          break;
        case "hy:emerald_boardsword":
          const ILLAGER_OPINION: mc.EntityQueryOptions = {
            location: PLAYER.location,
            maxDistance: 18,
            families: ["illager"],
          };
          hy.damageEntities(PLAYER.dimension, ILLAGER_OPINION, 8);
          hy.affectEntities(PLAYER.dimension, ILLAGER_OPINION, "weakness", 300);
          break;
        case "hy:flash_copper_boardsword":
          const ARTHROPOD_OPINION: mc.EntityQueryOptions = {
            location: PLAYER.location,
            maxDistance: 18,
            families: ["arthropod"],
          };
          hy.damageEntities(PLAYER.dimension, ARTHROPOD_OPINION, 8);
          hy.affectEntities(
            PLAYER.dimension,
            ARTHROPOD_OPINION,
            "weakness",
            300,
          );
          break;
        case "hy:amethyst_boardsword":
          const POULTRY_OPINION: mc.EntityQueryOptions = {
            location: PLAYER.location,
            maxDistance: 18,
            families: ["poultry"],
          };
          hy.damageEntities(PLAYER.dimension, POULTRY_OPINION, 8);
          hy.affectEntities(PLAYER.dimension, POULTRY_OPINION, "weakness", 300);
          break;
        case "hy:ruby_boardsword":
          const RUBY_OPINION: mc.EntityQueryOptions = {
            location: PLAYER.location,
            maxDistance: 18,
            families: ["ruby"],
          };
          hy.damageEntities(PLAYER.dimension, RUBY_OPINION, 8);
          hy.affectEntities(PLAYER.dimension, RUBY_OPINION, "weakness", 300);
          break;
        default:
          break;
      }
      mc.system.runTimeout(() => {
        PLAYER.removeTag("hy.magic_explode");
      }, 100);
    } else {
      PLAYER.sendMessage([{ translate: "hy.message.no_exp" }]);
    }
  }
});

/** 道具相关
 * 为物品添加`hy:single_use`设置为只能使用一次的物品 */
mc.world.afterEvents.itemUse.subscribe((event) => {
  const ITEM: mc.ItemStack = event.itemStack;
  const PLAYER: mc.Player = event.source;
  if (ITEM.hasTag("hy:single_use")) {
    PLAYER?.getComponent("minecraft:equippable")?.setEquipment(
      mc.EquipmentSlot.Mainhand,
      undefined,
    );
    /** 在这下面添加物品的使用效果 */
    switch (ITEM.typeId) {
      case "hy:ruby_bag":
        switch (hy.getRandomChance()) {
          case 1:
          case 2:
            PLAYER.dimension.spawnItem(
              hydata.HyRewardTypes.diamondBlock,
              PLAYER.location,
            );
            break;
          case 3:
          case 4:
          case 5:
            PLAYER.dimension.spawnItem(
              hydata.HyRewardTypes.goldBlock,
              PLAYER.location,
            );
            break;
          case 6:
            PLAYER.dimension.spawnItem(
              hydata.HyRewardTypes.scrap,
              PLAYER.location,
            );
            break;
          case 7:
            PLAYER.dimension.spawnItem(
              hydata.HyRewardTypes.template,
              PLAYER.location,
            );
            break;
          default:
            PLAYER.dimension.spawnItem(
              hydata.HyRewardTypes.apple,
              PLAYER.location,
            );
        }
        break;
      case "hy:experience_calamity_bag":
        PLAYER.dimension.spawnEntity("hy:king_of_ruby", PLAYER.location);
        break;
      case "hy:ruby_runes":
        PLAYER.addLevels(hy.getRandomChance());
        PLAYER.playSound("random.orb");
        PLAYER.addEffect("fire_resistance", 1200);
        PLAYER.addEffect("resistance", 1200);
        break;
      case "hy:copper_badge":
        PLAYER.addEffect("health_boost", 300, {
          amplifier: 2,
        });
        break;
      case "hy:diamond_badge":
        PLAYER.addEffect("health_boost", 900, {
          amplifier: 4,
        });
        break;
      case "hy:golden_badge":
        PLAYER.addEffect("health_boost", 600, {
          amplifier: 4,
        });
        break;
      default:
        break;
    }
  }
});

/** 道具相关
 * 为物品添加`hy:durability_use`设置为由耐久值控制使用次数的物品 */
mc.world.afterEvents.itemUse.subscribe((event) => {
  const ITEM: mc.ItemStack = event.itemStack;
  const PLAYER: mc.Player = event.source;
  if (ITEM.hasTag("hy:durability_use")) {
    const NEW_ITEM = hy.consumeDurability(ITEM, 1, PLAYER);
    PLAYER?.getComponent("minecraft:equippable")?.setEquipment(
      mc.EquipmentSlot.Mainhand,
      NEW_ITEM,
    );
    /** 在这下面添加物品的使用效果 */
    switch (ITEM.typeId) {
      case "hy:bandage":
        PLAYER.addEffect("regeneration", 1200);
        PLAYER.addEffect("resistance", 600);
        PLAYER.addEffect("instant_health", 5);
        PLAYER.playSound("use.cloth");
        break;
      case "hy:medicine_pack":
        PLAYER.addEffect("regeneration", 1200);
        PLAYER.addEffect("resistance", 600);
        PLAYER.addEffect("fire_resistance", 600);
        PLAYER.addEffect("instant_health", 10);
        PLAYER.playSound("use.cloth");
        break;
      case "hy:copper_horn":
        PLAYER.addTag("hy.horn_user");
        const HORN_OPINION: mc.EntityQueryOptions = {
          location: PLAYER.location,
          maxDistance: 20,
          excludeTags: ["hy.horn_user"],
          excludeFamilies: ["noaoe"],
        };
        if (PLAYER.isSneaking) {
          PLAYER.dimension.playSound("copper_horn.sneak", PLAYER.location);
          hy.affectEntities(PLAYER.dimension, HORN_OPINION, "slowness", 300, {
            amplifier: 2,
          });
          PLAYER.removeEffect("slowness");
          PLAYER.addEffect("speed", 300, {
            amplifier: 2,
          });
        } else {
          PLAYER.dimension.playSound("copper_horn.walk", PLAYER.location);
          hy.affectEntities(PLAYER.dimension, HORN_OPINION, "speed", 300, {
            amplifier: 2,
          });
          PLAYER.removeEffect("speed");
          PLAYER.addEffect("slowness", 300, {
            amplifier: 2,
          });
        }
        break;
      default:
        break;
    }
  }
});

/** 监听食物的食用 */
mc.world.afterEvents.itemCompleteUse.subscribe((event) => {
  const ITEM: mc.ItemStack = event.itemStack;
  const PLAYER: mc.Player = event.source;
  /** 用`hy:copper_foods`来标记一个物品为铜食物，并统计其食用次数
   * 铜食物食用12次后会中毒
   */
  if (ITEM.hasTag("hy:copper_foods")) {
    let eatFrequency = PLAYER.getDynamicProperty("hy:copper_foods") as number;
    if (eatFrequency === undefined)
      PLAYER.setDynamicProperty("hy:copper_foods", 0);
    PLAYER.setDynamicProperty("hy:copper_foods", eatFrequency++);
    if (eatFrequency > 12) {
      PLAYER.addEffect("poison", 100);
      PLAYER.setDynamicProperty("hy:copper_foods", 0);
    }
  }
  switch (ITEM.typeId) {
    case "hy:honey_candy":
      PLAYER.addEffect("saturation", 600);
      break;
    case "hy:syrup":
      PLAYER.addEffect("fire_resistance", 160);
      break;
    case "hy:chocolate_paste":
      PLAYER.addEffect("fire_resistance", 900);
      break;
    case "hy:milk_chocolate":
      hy.clearEffect(PLAYER, "all");
      break;
    case "hy:sweet_berry_chocolate":
      PLAYER.addEffect("instant_health", 1, {
        amplifier: 1,
      });
      break;
    case "hy:amethyst_chocolate":
      PLAYER.addLevels(2);
      break;
    case "hy:marshmallow":
      if (hy.getRandomChance() > 5) {
        PLAYER.addEffect("levitation", 100);
      }
      break;
    case "hy:sweet_berry_marshmallow":
      PLAYER.addEffect("instant_health", 1);
      break;
    case "hy:amethyst_marshmallow":
      PLAYER.addLevels(3);
      break;
    case "hy:medicine_1":
      PLAYER.removeEffect("nausea");
      PLAYER.removeEffect("hunger");
      PLAYER.addEffect("saturation", 400);
      break;
    case "hy:medicine_2":
      hy.clearEffect(PLAYER, "bad");
      break;
    case "hy:medicine_3":
      PLAYER.removeEffect("darkness");
      PLAYER.removeEffect("blindness");
      PLAYER.addEffect("night_vision", 400);
      break;
    case "hy:medicine_4":
      PLAYER.addEffect("darkness", 600);
      PLAYER.addEffect("blindness", 600);
      PLAYER.removeEffect("night_vision");
      break;
    case "hy:medicine_5":
      PLAYER.removeEffect("wither");
      PLAYER.removeEffect("poison");
      PLAYER.removeEffect("fatal_poison");
      PLAYER.addEffect("absorption", 400);
      break;
    case "hy:medicine_6":
      PLAYER.removeEffect("weakness");
      PLAYER.addEffect("strength", 400);
      break;
    case "hy:medicine_7":
      PLAYER.removeEffect("slowness");
      PLAYER.addEffect("speed", 600);
      break;
    case "hy:medicine_8":
      PLAYER.removeEffect("slowness");
      PLAYER.addEffect("jump_boost", 600);
      break;
    case "hy:medicine_9":
      PLAYER.addEffect("poison", 400);
      PLAYER.addEffect("slowness", 400);
      PLAYER.addEffect("weakness", 400);
      break;
    case "hy:medicine_10":
      PLAYER.kill();
      break;
    case "hy:medicine_11":
      hy.clearEffect(PLAYER, "good");
      break;
    case "hy:medicine_12":
      PLAYER.removeEffect("bad_omen");
      PLAYER.addEffect("village_hero", 3000);
      break;
    case "hy:medicine_13":
      PLAYER.removeEffect("mining_fatigue");
      PLAYER.addEffect("water_breathing", 200);
      break;
    case "hy:medicine_14":
      PLAYER.addEffect("fire_resistance", 400);
      break;
    case "hy:medicine_15":
      PLAYER.addEffect("health_boost", 6000);
      break;
    case "hy:ruby_apple":
      PLAYER.addExperience(3);
      mc.world.playSound("random.orb", PLAYER.location);
      break;
    case "hy:copper_apple":
      PLAYER.addEffect("absorption", 600);
      PLAYER.addEffect("fire_resistance", 200);
      break;
    case "hy:enchanted_copper_apple":
      PLAYER.addEffect("absorption", 1200);
      PLAYER.addEffect("fire_resistance", 1200);
      PLAYER.addEffect("speed", 200);
      break;
    case "hy:fuel_metal":
      mc.world.sendMessage([{ translate: "hy.message.fuel_metal" }]);
      PLAYER.addEffect("fatal_poison", 1200);
      break;
    case "hy:mineral_fuel_metal":
      PLAYER.dimension.spawnItem(
        hydata.HyRewardTypes.nightmareFuel,
        PLAYER.location,
      );
      PLAYER.addEffect("fatal_poison", 800, {
        amplifier: 1,
      });
      break;
    case "hy:fuel_metal_stick":
      PLAYER.applyDamage(2);
      break;
    case "hy:bark":
      PLAYER.sendMessage([{ translate: "hy.message.eat_bark" }]);
      break;
    default:
      break;
  }
});

/** 方块相关
 * 使用`hy:experience_ores`标签来标记一个方块为挖掘后给予经验的矿石
 * @todo 为方块数驱添加此类标签
 */
mc.world.afterEvents.playerBreakBlock.subscribe((event) => {
  const BLOCK = event.brokenBlockPermutation;
  const PLAYER = event.player;
  const ITEM = hy.getEquipmentItem as unknown as mc.ItemStack;
  if (BLOCK.hasTag("hy:experience_ores")) {
    PLAYER.dimension.spawnEntity("xp_orb", PLAYER.location);
  }
  /** 使用`hy:need_crowbar`标签来标记一个方块需要撬棍才能生成掉落物
   * @todo 为方块添加此类标签
   */
  if (BLOCK.hasTag("hy:need_crowbar") && ITEM.hasTag("minecraft:is_pickaxe")) {
    PLAYER.sendMessage([{ translate: "hy.message.need_crowbar" }]);
  }
  /** 使用`hy:suspicious_ores`标签来标记一个方块为可疑的矿石 */
  if (
    BLOCK.hasTag("hy:suspicious_ores") &&
    ITEM.hasTag("minecraft:is_pickaxe")
  ) {
    if (hy.getRandomChance() <= 8) {
      PLAYER.dimension.spawnEntity("silverfish", PLAYER.location);
      PLAYER.dimension.spawnEntity("silverfish", PLAYER.location);
    } else {
      PLAYER.dimension.createExplosion(PLAYER.location, 4, {
        causesFire: true,
        allowUnderwater: true,
      });
    }
  }
});

/** 实体相关 */
mc.world.afterEvents.entityDie.subscribe((event) => {
  const ENTITY = event.deadEntity;
  /** 红宝石之王死亡时的事件 */
  if (ENTITY.typeId === "hy:king_of_ruby") {
    mc.world.stopMusic();
    mc.world.sendMessage([{ translate: "hy.bossdead.ruby" }]);
  }
});

/** 实体击打实体时的事件 */
mc.world.afterEvents.entityHitEntity.subscribe((event) => {
  const ATTACKER = event.damagingEntity;
  const TARGET = event.hitEntity;
  const ITEM = hy.getEquipmentItem(ATTACKER);
  switch (ITEM?.typeId) {
    case "hy:ruby_boardsword":
      /** 红宝石阔剑会给予玩家经验值 */
      if (ATTACKER instanceof mc.Player) ATTACKER.addExperience(hy.rand(4, 0));
      break;
    default:
      break;
  }
  switch (ATTACKER.typeId) {
    case "hy:king_of_ruby":
      /** 红宝石之王攻击玩家时会剥夺玩家经验值 */
      if (TARGET instanceof mc.Player) TARGET.addExperience(-15);
      break;
    default:
      break;
  }
});

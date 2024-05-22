import * as mc from "@minecraft/server";
import * as hyApi from "../dependencies/hy2Utils.js";
import * as hyData from "../data/data.js";
import * as mcui from "@minecraft/server-ui";
import * as quests from "../data/quests.js";
import { QuestBook } from "sapi-ui-utils";
import * as sapi from "sapi-utils";

/**
 * 注册任务书
 */
export function questRegister() {
  const QUEST_BOOK1 = new QuestBook(
    "hy:quest_book1",
    { translate: "hy.quest.title2" },
    { translate: "hy.quest.body2" },
    [quests.COPPER_APPLE, quests.METAL_STAR, quests.COPPER_ESSENCE],
  );
  const QUEST_BOOK = new QuestBook(
    "hy:quest_book",
    { translate: "hy.quest.title1" },
    { translate: "hy.quest.body1" },
    [
      quests.BEGGING,
      quests.OVER_METAL_INGOT,
      quests.IRON_INGOT,
      quests.COPPER_INGOT,
      quests.IRON_HAMMER,
      quests.IRON_CROWBAR,
      quests.IRON_KNIFE,
      quests.IRON_DAGGER,
      quests.IRON_SWORD,
      quests.FUEL_METAL,
      quests.NIGHTMARE_FUEL_METAL,
      quests.STEEL_INGOT,
      quests.TOTEM,
      quests.OBSIDIAN,
      quests.GOLD_INGOT,
      quests.GHAST_TEAR,
      quests.NETHERITE_SCRAP,
      quests.LODESTONE,
      quests.RESPAWN_ANCHOR,
      quests.BLAZE_ROD,
      quests.NETHER_STAR,
      quests.ENDER_PEARL,
      quests.DRAGON_BREATH,
      quests.DRAGON_EGG,
      quests.RUBY,
      quests.RUBY_CHESTPLATE,
      quests.RUBY_BAG,
      quests.RUBY_RUNES,
    ],
  );
}

/**
 * 注册书籍
 */
export function bookRegister() {
  for (let i = 0; i <= 10; i++) {
    hyApi.createLetterForm(
      // @ts-ignore
      hyData.HyLetterTitle[i],
      // @ts-ignore
      hyData.HyLetterBody[i],
      `hy:letter_${i}`,
    );
  }
  mc.world.afterEvents.itemUse.subscribe((event) => {
    const PLAYER = event.source;
    if (event.itemStack.typeId === "hy:story_book") {
      const story = new mcui.ActionFormData()
        .title({ translate: "hy.item.story_book" })
        .body("这本书记载了一些模糊的上古旧事……\n请选择章节")
        .button({ translate: "hy.story.hs.title1" })
        .button({ translate: "hy.story.hs.title2" })
        .button({ translate: "hy.story.hs.title3" });
      story.show(PLAYER).then((response) => {
        switch (response.selection) {
          case 0:
            const storySection0 = new mcui.ActionFormData()
              .title({ translate: "hy.story.hs.title1" })
              .body(hyData.HyStoryBody.section0)
              .button({ translate: "gui.ok" });
            storySection0.show(PLAYER);
            break;
          case 1:
            const storySection1 = new mcui.ActionFormData()
              .title({ translate: "hy.story.hs.title2" })
              .body(hyData.HyStoryBody.section1)
              .button({ translate: "gui.ok" });
            storySection1.show(PLAYER);
            break;
          case 2:
            const storySection2 = new mcui.ActionFormData()
              .title({ translate: "hy.story.hs.title3" })
              .body(hyData.HyStoryBody.section2)
              .button({ translate: "gui.ok" });
            storySection2.show(PLAYER);
            break;
          default:
            break;
        }
      });
      if (!PLAYER.hasTag("hy:get_first_letter")) {
        PLAYER.dimension.spawnItem(
          hyData.HyRewardTypes.letter1st,
          PLAYER.location,
        );
        PLAYER.addTag("hy:get_first_letter");
      }
    }
  });
}

/**
 * 监听物品耐久事件
 */
export function itemDurabilityMonitor() {
  mc.world.afterEvents.playerBreakBlock.subscribe((event) => {
    const ENTITY = event.player;
    let ITEM = hyApi.getEquipmentItem(ENTITY);
    if (ITEM?.hasTag("hy:custom_tools")) {
      const NEW_ITEM = hyApi.consumeDurability(ITEM, 1, ENTITY);
      ENTITY?.getComponent("minecraft:equippable")?.setEquipment(
        mc.EquipmentSlot.Mainhand,
        NEW_ITEM,
      );
    } else if (ITEM?.hasTag("hy:custom_weapons")) {
      const NEW_ITEM = hyApi.consumeDurability(ITEM, 2, ENTITY);
      ENTITY?.getComponent("minecraft:equippable")?.setEquipment(
        mc.EquipmentSlot.Mainhand,
        NEW_ITEM,
      );
    }
    if (ITEM?.hasTag("hy:imitation_tools")) {
      hyApi.applyImitationDamage(ENTITY);
    }
  });

  mc.world.afterEvents.entityHitEntity.subscribe((event) => {
    const ENTITY = event.damagingEntity;
    let ITEM = hyApi.getEquipmentItem(event.damagingEntity);
    if (ITEM?.hasTag("hy:custom_weapons")) {
      const NEW_ITEM = hyApi.consumeDurability(ITEM, 1);
      ENTITY?.getComponent("minecraft:equippable")?.setEquipment(
        mc.EquipmentSlot.Mainhand,
        NEW_ITEM,
      );
    }
    if (ITEM?.hasTag("hy:custom_tools")) {
      const NEW_ITEM = hyApi.consumeDurability(ITEM, 2);
      ENTITY?.getComponent("minecraft:equippable")?.setEquipment(
        mc.EquipmentSlot.Mainhand,
        NEW_ITEM,
      );
    }
    if (ITEM?.hasTag("hy:imitation_tools")) {
      hyApi.applyImitationDamage(ENTITY);
    }
  });
}

/**
 * 监听物品使用事件
 */
export function itemUseMonitor() {
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
      hyApi.affectEntities(PLAYER.dimension, TETANUS_OPINION, "poison", 300);
      hyApi.affectEntities(PLAYER.dimension, TETANUS_OPINION, "nausea", 600, {
        amplifier: 1,
      });
      hyApi.affectEntities(PLAYER.dimension, TETANUS_OPINION, "wither", 6);
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
    if (
      ITEM.hasTag("hy:magic_explode") &&
      ITEM?.getComponent("cooldown").cooldownTicks !== 0
    ) {
      if (PLAYER.level > 1) {
        PLAYER.addTag("hy.magic_explode");
        const NEW_ITEM = hyApi.consumeDurability(ITEM, 1, PLAYER);
        hyApi.startCooldown(NEW_ITEM, PLAYER);
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
        hyApi.damageEntities(PLAYER.dimension, ALL_OPTION, 10);
        switch (ITEM.typeId) {
          case "hy:diamond_bone":
          case "hy:gold_bone":
          case "hy:iron_bone":
            const SKELETON_OPINION: mc.EntityQueryOptions = {
              location: PLAYER.location,
              maxDistance: 18,
              families: ["skeleton"],
            };
            hyApi.damageEntities(PLAYER.dimension, SKELETON_OPINION, 8);
            hyApi.affectEntities(
              PLAYER.dimension,
              SKELETON_OPINION,
              "weakness",
              300,
            );
            break;
          case "hy:flash_metal_boardsword":
            hyApi.damageEntities(PLAYER.dimension, ALL_OPTION, 8);
            hyApi.affectEntities(PLAYER.dimension, ALL_OPTION, "weakness", 300);
            break;
          case "hy:corrosion_boardsword":
            const UNDEAD_OPINION: mc.EntityQueryOptions = {
              location: PLAYER.location,
              maxDistance: 18,
              families: ["undead"],
            };
            hyApi.damageEntities(PLAYER.dimension, UNDEAD_OPINION, 8);
            hyApi.affectEntities(
              PLAYER.dimension,
              UNDEAD_OPINION,
              "weakness",
              300,
            );
            break;
          case "hy:emerald_boardsword":
            const ILLAGER_OPINION: mc.EntityQueryOptions = {
              location: PLAYER.location,
              maxDistance: 18,
              families: ["illager"],
            };
            hyApi.damageEntities(PLAYER.dimension, ILLAGER_OPINION, 8);
            hyApi.affectEntities(
              PLAYER.dimension,
              ILLAGER_OPINION,
              "weakness",
              300,
            );
            break;
          case "hy:flash_copper_boardsword":
            const ARTHROPOD_OPINION: mc.EntityQueryOptions = {
              location: PLAYER.location,
              maxDistance: 18,
              families: ["arthropod"],
            };
            hyApi.damageEntities(PLAYER.dimension, ARTHROPOD_OPINION, 8);
            hyApi.affectEntities(
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
            hyApi.damageEntities(PLAYER.dimension, POULTRY_OPINION, 8);
            hyApi.affectEntities(
              PLAYER.dimension,
              POULTRY_OPINION,
              "weakness",
              300,
            );
            break;
          case "hy:ruby_boardsword":
            const RUBY_OPINION: mc.EntityQueryOptions = {
              location: PLAYER.location,
              maxDistance: 18,
              families: ["ruby"],
            };
            hyApi.damageEntities(PLAYER.dimension, RUBY_OPINION, 8);
            hyApi.affectEntities(
              PLAYER.dimension,
              RUBY_OPINION,
              "weakness",
              300,
            );
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
          switch (sapi.randomInteger(10, 1)) {
            case 1:
            case 2:
              PLAYER.dimension.spawnItem(
                hyData.HyRewardTypes.diamondBlock,
                PLAYER.location,
              );
              break;
            case 3:
            case 4:
            case 5:
              PLAYER.dimension.spawnItem(
                hyData.HyRewardTypes.goldBlock,
                PLAYER.location,
              );
              break;
            case 6:
              PLAYER.dimension.spawnItem(
                hyData.HyRewardTypes.scrap,
                PLAYER.location,
              );
              break;
            case 7:
              PLAYER.dimension.spawnItem(
                hyData.HyRewardTypes.template,
                PLAYER.location,
              );
              break;
            default:
              PLAYER.dimension.spawnItem(
                hyData.HyRewardTypes.apple,
                PLAYER.location,
              );
          }
          break;
        case "hy:experience_calamity_bag":
          PLAYER.dimension.spawnEntity("hy:king_of_ruby", PLAYER.location);
          break;
        case "hy:ruby_runes":
          PLAYER.addLevels(sapi.randomInteger(10, 1));
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
      const NEW_ITEM = hyApi.consumeDurability(ITEM, 1, PLAYER);
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
            mc.world.playSound("copper_horn.sneak", PLAYER.location);
            hyApi.affectEntities(
              PLAYER.dimension,
              HORN_OPINION,
              "slowness",
              300,
              {
                amplifier: 2,
              },
            );
            PLAYER.removeEffect("slowness");
            PLAYER.addEffect("speed", 300, {
              amplifier: 2,
            });
          } else {
            mc.world.playSound("copper_horn.walk", PLAYER.location);
            hyApi.affectEntities(PLAYER.dimension, HORN_OPINION, "speed", 300, {
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
        sapi.clearEffect(PLAYER, "all");
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
        if (sapi.randomInteger(10, 1) > 5) {
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
        sapi.clearEffect(PLAYER, "bad");
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
        sapi.clearEffect(PLAYER, "good");
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
          hyData.HyRewardTypes.nightmareFuel,
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
}

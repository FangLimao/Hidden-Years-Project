import { world, EquipmentSlot, Player } from "@minecraft/server";
import { modItemData, mainQuest } from "@hy2/mod-data.js";
import * as hyapi from "@hy2/lib.js";
import "@hy2/event.js";
import "Tool.js";
import "Story.js";
//import "@hy2/travel-level.js";

hyapi.questUi(mainQuest);

const VERSION_CODE = 2105;
const LEAST_VERSION_CODE = world.getDynamicProperty("hy:version_code");

world.afterEvents.playerSpawn.subscribe((event) => {
  const PLAYER = event.player;
  if (VERSION_CODE !== LEAST_VERSION_CODE) {
    world.sendMessage([{ translate: "hy.update.index" }]);
    world.sendMessage([{ translate: "hy.update.version" }]);
    world.sendMessage([{ translate: "hy.update.log" }]);
    world.setDynamicProperty("hy:version_code", VERSION_CODE);
  }
  if (event.player.getDynamicProperty("hy:get:quest") !== true) {
    PLAYER.runCommandAsync("give @s hy:quest_book");
    PLAYER.setDynamicProperty("hy:get_quest", true);
  }
});

world.afterEvents.playerBreakBlock.subscribe((event) => {
  const BLOCK = event.brokenBlockPermutation;
  const PLAYER = event.player;
  const DIMENSION = PLAYER.dimension;
  if (BLOCK.hasTag("hy:suspicious_ores") === true) {
    let RANDOM_CHANCE = hyapi.getRandomChance();
    if (RANDOM_CHANCE <= 8) {
      DIMENSION.spawnEntity("silverfish", PLAYER.location);
      DIMENSION.spawnEntity("silverfish", PLAYER.location);
    } else {
      DIMENSION.createExplosion(PLAYER.location, 3, {
        allowUnderwater: false,
        breaksBlocks: true,
        causesFire: false,
      });
    }
  }
  if (BLOCK.hasTag("hy:custom_ores") === true) {
    PLAYER.addExperience(1);
    world.playSound("random.orb", PLAYER.location);
  }
});

// 法术爆发与法术精通
world.afterEvents.entityHitEntity.subscribe((event) => {
  const PLAYER = event.damagingEntity;
  if (!(PLAYER instanceof Player)) {
    return;
  }
  const ITEM = hyapi.getMainHandItem(PLAYER);
  if (ITEM?.typeId === "hy:ruby_boardsword") {
    PLAYER.addExperience(hyapi.getRandomChance());
  }
});

world.afterEvents.itemUse.subscribe((event) => {
  const PLAYER = event.source;
  const ITEM = event.itemStack;
  if (ITEM.hasTag("hy:magic_explode") === true) {
    if (PLAYER.level > 1) {
      PLAYER.addLevels(-1);
      PLAYER.runCommandAsync("function api/aoe/all");
      switch (ITEM.typeId) {
        case "hy:diamond_bone":
        case "hy:gold_bone":
        case "hy:iron_bone":
          PLAYER.runCommandAsync("function api/aoe/bone");
          break;
        case "hy:flash_metal_boardsword":
          PLAYER.runCommandAsync("function api/aoe/flash_metal");
          break;
        case "hy:corrosion_boardsword":
          PLAYER.runCommandAsync("function api/aoe/corrosion");
          break;
        case "hy:emerald_boardsword":
          PLAYER.runCommandAsync("function api/aoe/emerald");
          break;
        case "hy:flash_copper_boardsword":
          PLAYER.runCommandAsync("function api/aoe/flash_copper");
          break;
        case "hy:amethyst_boardsword":
          PLAYER.runCommandAsync("function api/aoe/amethyst");
          break;
        case "hy:ruby_boardsword":
          PLAYER.runCommandAsync("function api/aoe/ruby");
          break;
        default:
          break;
      }
    } else {
      PLAYER.sendMessage([{ translate: "hy.message.no_exp" }]);
    }
  }
});

world.afterEvents.itemUse.subscribe((event) => {
  const PLAYER = event.source;
  const DIMENSION = PLAYER.dimension;
  switch (event.itemStack.typeId) {
    case "hy:medicine_1":
      PLAYER.addEffect("darkness");
      PLAYER.removeEffect("blindness");
      PLAYER.removeEffect("night_vision");
      break;
    case "hy:ruby_bag":
      PLAYER.getComponent("minecraft:equippable")?.setEquipment(
        EquipmentSlot.Mainhand,
        undefined,
      );
      switch (hyapi.getRandomChance()) {
        case 1:
        case 2:
          DIMENSION.spawnItem(modItemData.diamondBlockReward, PLAYER.location);
          break;
        case 3:
        case 4:
        case 5:
          DIMENSION.spawnItem(modItemData.goldBlockReward, PLAYER.location);
          break;
        case 6:
          DIMENSION.spawnItem(modItemData.scrapReward, PLAYER.location);
          break;
        case 7:
          DIMENSION.spawnItem(modItemData.templateReward, PLAYER.location);
          break;
        default:
          DIMENSION.spawnItem(modItemData.appleReward, PLAYER.location);
      }
      break;
    case "hy:experience_calamity_bag":
      PLAYER?.getComponent("minecraft:equippable")?.setEquipment(
        EquipmentSlot.Mainhand,
        undefined,
      );
      DIMENSION.spawnEntity("hy:king_of_ruby", PLAYER.location);
      break;
    case "hy:ruby_runes":
      PLAYER.addLevels(hyapi.getRandomChance());
      world.playSound("random.orb", PLAYER.location);
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
    case "hy:bandage":
      PLAYER.runCommandAsync("function gameplay/items/medicines/bandage");
      break;
    case "hy:medicine_pack":
      PLAYER.runCommandAsync("function gameplay/items/medicines/medicine_pack");
      break;
    default:
      break;
  }
});

world.afterEvents.itemUseOn.subscribe((event) => {
  const PLAYER = event.source;
  if (event.itemStack.hasTag("hy:is_awl") === true) {
    PLAYER.dimension.spawnItem(modItemData.bark, PLAYER.location);
    world.playSound("use.wood", PLAYER.location);
  }
});

world.afterEvents.entityHitEntity.subscribe((event) => {
  const ITEM = hyapi.getMainHandItem(event.damagingEntity);
  const HIT_ENTITY = event.hitEntity;
  if (
    event.damagingEntity.typeId === "hy:king_of_ruby" &&
    HIT_ENTITY instanceof Player
  ) {
    HIT_ENTITY.addExperience(-15);
  }
  if (ITEM?.hasTag("hy:imitation_tools")) {
    hyapi.applyImitationDamage(event.damagingEntity);
  }
});

world.afterEvents.playerBreakBlock.subscribe((event) => {
  const ITEM = event.itemStackBeforeBreak;
  if (ITEM?.hasTag("hy:imitation_tools")) {
    hyapi.applyImitationDamage(event.player);
  }
});

world.afterEvents.entityDie.subscribe((event) => {
  if (event.deadEntity.typeId === "hy:king_of_ruby") {
    world.stopMusic();
    world.sendMessage([{ translate: "hy.bossdead.ruby" }]);
  }
});

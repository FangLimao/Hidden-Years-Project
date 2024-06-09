import * as mc from "@minecraft/server";
import * as lantern from "project-lantern";

/** 监听方块事件 */
export function blockMonitor() {
  mc.world.afterEvents.playerBreakBlock.subscribe((event) => {
    const BLOCK = event.brokenBlockPermutation;
    const PLAYER = event.player;
    const ITEM = lantern.getEquipmentItem(PLAYER);
    if (BLOCK.hasTag("hy:experience_ores")) {
      PLAYER.dimension.spawnEntity("xp_orb", PLAYER.location);
    }
    /** 使用`hy:need_crowbar`标签来标记一个方块需要撬棍才能生成掉落物 */
    if (
      BLOCK.hasTag("hy:need_crowbar") &&
      ITEM.hasTag("minecraft:is_pickaxe")
    ) {
      PLAYER.sendMessage([{ translate: "hy.message.need_crowbar" }]);
    }
    /** 使用`hy:suspicious_ores`标签来标记一个方块为可疑的矿石 */
    if (
      BLOCK.hasTag("hy:suspicious_ores") &&
      ITEM.hasTag("minecraft:is_pickaxe")
    ) {
      if (lantern.getRandomChance() <= 8) {
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
}

import * as mc from "@minecraft/server";
import * as hyApi from "./utils.js";
import * as hyData from "./data.js";

export function entitySpawnMonitor() {
  /** 玩家生成时检测的事件，即是否给予任务书 */
  mc.world.afterEvents.playerSpawn.subscribe((event) => {
    const PLAYER = event.player;
    if (!PLAYER.hasTag("hy:get_quest_book")) {
      hyData.HyRewardTypes.questBook1st.keepOnDeath = true;
      hyData.HyRewardTypes.questBook1st.lockMode = mc.ItemLockMode.inventory;
      PLAYER.dimension.spawnItem(
        hyData.HyRewardTypes.questBook1st,
        PLAYER.location,
      );
      PLAYER.addTag("hy:get_quest_book");
    }
  });
}

export function entityEventsMonitor() {
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
    const ITEM = hyApi.getEquipmentItem(ATTACKER);
    switch (ITEM?.typeId) {
      case "hy:ruby_boardsword":
        /** 红宝石阔剑会给予玩家经验值 */
        if (ATTACKER instanceof mc.Player)
          ATTACKER.addExperience(hyApi.rand(4, 0));
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
}

import { Player, world } from "@minecraft/server";

world.afterEvents.entityDie.subscribe((event) => {
  const DAMAGING_ENTITY = event.damageSource.damagingEntity;
  if (
    event.deadEntity.typeId === "hy:king_of_ruby" &&
    DAMAGING_ENTITY instanceof Player &&
    DAMAGING_ENTITY.getDynamicProperty("hy:unlock_tl") !== true
  ) {
    DAMAGING_ENTITY.setDynamicProperty("hy:unlock_tl", true);
    DAMAGING_ENTITY.sendMessage([{ translate: "hy.message.unlock_level" }]);
    DAMAGING_ENTITY.setDynamicProperty("hy:travel_level", 0);
  }
});

world.beforeEvents.chatSend.subscribe((event) => {
  const LEVEL = event.sender.getDynamicProperty("hy:level");
  switch (event.message) {
    case "?level":
      event.sender.sendMessage("你的等级为" + LEVEL);
      break;
    case "?level ui":
      break;
    default:
      break;
  }
});

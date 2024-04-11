import { world, EquipmentSlot } from "@minecraft/server";
import * as hyapi from "@hy2/lib.js";

world.afterEvents.playerBreakBlock.subscribe((event) => {
  const PLAYER = event.player;
  const ITEM = hyapi.getMainHandItem(PLAYER);
  if (ITEM?.hasTag("hy:custom_tools")) {
    PLAYER.getComponent("minecraft:equippable")?.setEquipment(
      EquipmentSlot.Mainhand,
      hyapi.consumeDurability(ITEM, 1, PLAYER),
    );
    return;
  }
  if (ITEM?.hasTag("hy:custom_weapons")) {
    PLAYER?.getComponent("minecraft:equippable")?.setEquipment(
      EquipmentSlot.Mainhand,
      hyapi.consumeDurability(ITEM, 2, PLAYER),
    );
  }
});

world.afterEvents.entityHitEntity.subscribe((event) => {
  const PLAYER = event.damagingEntity;
  const ITEM = hyapi.getMainHandItem(event.damagingEntity);
  if (ITEM?.hasTag("hy:custom_weapons")) {
    PLAYER?.getComponent("minecraft:equippable")?.setEquipment(
      EquipmentSlot.Mainhand,
      hyapi.consumeDurability(ITEM, 1, event.damagingEntity),
    );
  }
  if (ITEM?.hasTag("hy:custom_tools")) {
    PLAYER?.getComponent("minecraft:equippable")?.setEquipment(
      EquipmentSlot.Mainhand,
      hyapi.consumeDurability(ITEM, 2, event.damagingEntity),
    );
  }
});

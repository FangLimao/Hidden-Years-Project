import { blockMonitor } from "./server/blocks.js";
import { entityEventsMonitor, entitySpawnMonitor } from "./server/entities.js";
import {
  questRegister,
  itemUseMonitor,
  itemDurabilityMonitor,
} from "./server/items.js";
import { systemMonitor } from "./server/system.js";

systemMonitor();
blockMonitor();
entityEventsMonitor();
entitySpawnMonitor();
itemDurabilityMonitor();
itemUseMonitor();
questRegister();

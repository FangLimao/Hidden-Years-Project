import { blockMonitor } from "./server/blocks.js";
import { entityEventsMonitor, playerSpawnMonitor } from "./server/entities.js";
import {
  questRegister,
  bookRegister,
  itemUseMonitor,
  itemDurabilityMonitor,
} from "./server/items.js";
import { systemMonitor } from "./server/system.js";

systemMonitor();
blockMonitor();
entityEventsMonitor();
playerSpawnMonitor();
itemDurabilityMonitor();
itemUseMonitor();
questRegister();
bookRegister();

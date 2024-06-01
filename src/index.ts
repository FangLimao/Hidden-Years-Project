import { blockMonitor } from "./server/blocks.js";
import { EntityMonitor} from "./server/entities.js";
import {
  questRegister,
  bookRegister,
  itemUseMonitor,
  itemDurabilityMonitor,
} from "./server/items.js";
import { systemMonitor } from "./server/system.js";

systemMonitor();
blockMonitor();
EntityMonitor.entityEventsMonitor();
EntityMonitor.playerSpawnMonitor();
itemDurabilityMonitor();
itemUseMonitor();
questRegister();
bookRegister();

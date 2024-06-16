import { blockMonitor } from "./server/blocks";
import { entityEventsMonitor, playerSpawnMonitor } from "./server/entities";
import {
  questRegister,
  itemUseMonitor,
  itemDurabilityMonitor,
} from "./server/items";
import { bookRegister } from "./server/readings";
import { systemMonitor } from "./server/system";

systemMonitor();
blockMonitor();
entityEventsMonitor();
playerSpawnMonitor();
itemDurabilityMonitor();
itemUseMonitor();
questRegister();
bookRegister();

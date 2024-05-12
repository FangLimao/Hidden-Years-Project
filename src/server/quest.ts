import { ItemStack, Player, RawMessage, world } from "@minecraft/server";
import * as mc from "@minecraft/server";
import {
  MessageFormData,
  ActionFormData,
  ModalFormData,
  ActionFormResponse,
  MessageFormResponse,
} from "@minecraft/server-ui";
import * as hyApi from "./utils.js";

/**
 * 创建一本任务书
 */
export class QuestBook {
  /**
   * 任务书唯一的Id
   */
  readonly id: string;
  /**
   * 任务书的标题
   */
  title: string | RawMessage;
  /**
   * 任务书的描述
   */
  body: string | RawMessage;
  /**
   * 任务书的任务
   */
  private readonly quests: Quest[];
  constructor(
    id: string,
    title: string,
    body: string | RawMessage,
    quests: Quest[],
  ) {
    this.id = id;
    this.title = title;
    this.body = body;
    this.quests = quests;
  }
  display(player: Player): void {
    const mainForm: ActionFormData = new ActionFormData();
    mainForm.title(this.title);
    mainForm.body(this.body);
    this.quests.forEach((quest: Quest) => {
      mainForm.button(
        quest.title + (quest.isCompleted(player) ? " §2✔" : ""),
        quest.icon,
      );
    });
    mainForm.show(player).then((response: ActionFormResponse) => {
      if (response.canceled || response.selection === undefined) {
        return;
      }
      const quest: Quest = this.quests[response.selection];
      quest.display(player, this);
    });
  }
  /**
   * 添加一个任务
   * @param quest 要添加的任务
   * @param message 完成后要向世界发送的消息
   */
  addQuest(quest: Quest, message?: string | RawMessage): void {
    this.quests.push(quest);
    if (typeof message === "string") {
      world.sendMessage({ text: message });
      return;
    }
    if (message) {
      world.sendMessage(message);
      return;
    }
  }
  /**
   * 根据Id获取任务
   * @param id
   */
  getQuest(id: string): Quest | undefined {
    return this.quests.find((quest: Quest) => quest.id === id);
  }
  /**
   * 获取所有任务
   */
  getQuests(): Quest[] {
    return this.quests;
  }
  /**
   * 注册任务书
   */
  register(): void {
    mc.world.afterEvents.itemUse.subscribe((event) => {
      if (event.itemStack.typeId === this.id) this.display(event.source);
    });
  }
}

/**
 * Create a Quest (or Message).
 */
export class Quest {
  /**
   * The unique id of the Quest.
   */
  readonly id: string;
  /**
   * The title the Quest.
   */
  protected _title: string | RawMessage;
  /**
   * The content the Quest.
   */
  protected _body: string | RawMessage;
  /**
   * The type the Quest.
   */
  type: QuestTypes;
  /**
   * The condition to complete the quest / unlock the message.
   */
  condition: QuestCondition;
  /**
   * It will be called when the quest is completed by the player.
   */
  award?: QuestAward;
  /**
   * The icon of the Quest.
   * It should be the path from the root of the resource pack.
   * @example texture/gui/example_pic
   */
  icon?: string;
  private form: MessageFormData;
  constructor(
    id: string,
    title: string | RawMessage,
    body: string | RawMessage,
    type: QuestTypes,
    condition: QuestCondition,
    award: QuestAward,
    icon?: string,
  ) {
    this.id = id;
    this._title = title;
    this._body = body;
    this.type = type;
    this.icon = icon;
    this.condition = condition;
    this.award = award;
    this.form = new MessageFormData();
  }
  set body(content: string | RawMessage) {
    this._body = content;
    this.form.body(content);
  }
  get body() {
    return this._body;
  }
  set title(content: string | RawMessage) {
    this._title = content;
    this.form.title(content);
  }
  get title() {
    return this._title;
  }
  complete(player: Player): void {
    player.addTag(`hy-q:${this.id}`);
  }
  initForm(player: Player): void {
    if (this.isCompleted(player)) {
      this.form
        .body(
          `${this._body}\n\n§e需要物品: §r${this.condition.itemData.name}\n§e奖励物品: §r${this.award.itemData.name}\n§e状态: §r已完成`,
        )
        .button1({ translate: "gui.back" })
        .button2({ translate: "gui.quest_done" });
    } else {
      this.form
        .body(
          `${this._body}\n\n§e需要物品: §r${this.condition.itemData.name}\n§e奖励物品: §r${this.award.itemData.name} × ${this.award.itemData.item.amount} \n§e状态: §r未完成`,
        )
        .button1({ translate: "gui.back" })
        .button2({ translate: "gui.check" });
    }
  }
  /**
   * Display the form to a player.
   * @param player
   * @param book if specific, the book will be opened after canceled.
   */
  display(player: Player, book?: QuestBook): void {
    this.initForm(player);
    const CONTAINER = player.getComponent("minecraft:inventory")?.container;
    this.form.show(player).then((response) => {
      if (
        response.canceled ||
        response.selection === undefined ||
        response.selection === 0 ||
        this.isCompleted(player)
      ) {
        book?.display(player);
        return;
      } else if (response.selection === 1) {
        if (
          hyApi.getItemAmountInContainer(
            CONTAINER,
            this.condition.itemData.item.typeId,
          ) >= this.condition.itemData.item.amount
        ) {
          player.dimension.spawnItem(this.award.itemData.item, player.location);
          player.playSound(`random.levelup`);
          player.sendMessage(`你完成了 ${this.title}`);
          this.complete(player);
        } else {
          player.sendMessage(
            `材料不足，你需要${this.award.itemData.item.amount}个${this.condition.itemData.name}才能完成这个任务`,
          );
        }
      }
    });
  }
  /**
   * 检查玩家是否完成了任务
   * @param player
   */
  isCompleted(player: Player): boolean {
    return player.hasTag(`hy-q:${this.id}`);
  }
  /**
   * Check if the type is INFO
   */
  isMessage(): boolean {
    return this.type === QuestTypes.INFO;
  }
}

/**
 * The type of the quest.
 */
export enum QuestTypes {
  INFO,
  QUEST,
}

export interface QuestCondition {
  /**
   * Match only typeId and min amount.
   */
  itemData?: ItemData;
  /**
   * The specific level will be required to unlock the quest.
   */
  playerXpLevel?: number;
  /**
   * The specific point will be required to unlock the quest.
   */
  playerXpPoint?: number;
  /**
   * Your custom function to check condition.
   * the string (or RawMessage) will be displayed to the player as the quest can not be completed.
   * Return undefined if the quest can be completed.
   */
  custom?: (player: Player) => string | RawMessage | undefined;
}

export interface QuestAward {
  /**
   * Player will get these items when the quest is finished.
   */
  itemData?: ItemData;
  /**
   * The specific level will be given to the player.
   */
  playerXpLevel?: number;
  /**
   * The specific point will be given to the player.
   */
  playerXpPoint?: number;
  /**
   * Your custom function give award.
   */
  custom?: (player: Player) => void;
}

export interface ItemData {
  translateString?: string;
  name?: string;
  item: ItemStack;
}

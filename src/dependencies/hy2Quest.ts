/** hy2-quest Api
 * @version v0.1.0
 * @author FangLimao <mucigames@outlook.com>
 * @author RawDiamondMC <RawDiamondMC@outlook.com>
 * @license BSD-3
 */
import { ItemStack, Player, RawMessage, world } from "@minecraft/server";
import * as mc from "@minecraft/server";
import {
  MessageFormData,
  ActionFormData,
  ActionFormResponse,
} from "@minecraft/server-ui";
import * as hyApi from "./hy2Utils.js";

/**
 * 创建一本任务书
 */
export class QuestBook {
  /**
   * 任务书的Id
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
    title: string | RawMessage,
    body: string | RawMessage,
    quests: Quest[],
  ) {
    this.id = id;
    this.title = title;
    this.body = body;
    this.quests = quests;
    mc.world.afterEvents.itemUse.subscribe((event) => {
      if (event.itemStack.typeId === this.id) this.display(event.source);
    });
  }
  /**
   * 向玩家展示任务书
   * @param player 被展示的玩家
   */
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
   * @param message 添加完成后要向世界发送的消息
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
   * @param id 任务的Id
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
   * @deprecated 现在`constructor`方法已经包括物品的事件监听，无需再单独注册
   */
  register(): void {  
  }
}

/**
 * 创建一个任务
 */
export class Quest {
  /**
   * 任务的Id
   */
  readonly id: string;
  /**
   * 任务的标题
   */
  protected _title: string;
  /**
   * 任务的描述
   */
  protected _body: string;
  /**
   * 完成任务的条件
   * @todo 添加更多完成条件
   */
  condition: QuestCondition;
  /**
   * 完成任务后的奖励
   * @todo 添加更多种类的奖励
   */
  award: QuestAward;
  /**
   * 任务的图标，值应该为资源包内的图片路径
   * @example texture/gui/example_pic
   */
  icon?: string;
  /**
   * 任务的表单
   */
  private form: MessageFormData;
  constructor(
    id: string,
    title: string,
    body: string,
    condition: QuestCondition,
    award: QuestAward,
    icon?: string,
  ) {
    this.id = id;
    this._title = title;
    this._body = body;
    this.icon = icon;
    this.condition = condition;
    this.award = award;
    this.form = new MessageFormData();
  }
  /**
   * 使一个玩家完成任务
   * @param player 要完成任务的玩家
   */
  complete(player: Player): void {
    player.addTag(`hy-q:${this.id}`);
  }
  /**
   * 初始化任务表单
   * @param player 要被展示表单的玩家，表单的内容将随玩家自身是否完成任务而变化
   */
  initForm(player: Player): void {
    if (this.isCompleted(player)) {
      this.form
       .title(this.title)
       .body(
          `${this._body}\n\n§e需要物品: §r${this.condition.itemData.name}\n§e奖励物品: §r${this.award.itemData.name}\n§e状态: §r已完成`,
        )
        .button1({ translate: "gui.back" })
        .button2({ translate: "gui.quest_done" });
    } else {
      this.form
        .title(this.title)
        .body(
          `${this._body}\n\n§e需要物品: §r${this.condition.itemData.name}\n§e奖励物品: §r${this.award.itemData.name}\n§e状态: §r未完成`,
        )
        .button1({ translate: "gui.back" })
        .button2({ translate: "gui.check" });
    }
  }
  /**
   * 向玩家展示表单
   * @param player 要被展示表单的玩家
   * @param book 如果指定，任务书将在关闭表单后展示给玩家
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
            `材料不足，你需要${this.condition.itemData.item.amount}个${this.condition.itemData.name}才能完成这个任务`,
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
  set body(content: string) {
    this._body = content;
    this.form.body(content);
  }
  set title(content: string) {
    this._title = content;
    this.form.title(content);
  }
  get body() {
    return this._body;
  }
  get title() {
    return this._title;
  }
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

/**
 * 物品数据
 */
export interface ItemData {
  /**
   * 物品的本地化字符串
   */
  translateString?: string;
  /**
   * 物品的名称
   */
  name?: string;
  /**
   * 物品自身
   */
  item: ItemStack;
}

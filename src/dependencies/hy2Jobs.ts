import * as mc from "@minecraft/server";

export class Job {
  /**
   * 职业的Id
   */
  readonly id: string;
  /**
   * 是否为主职业
   */
  readonly isMainJob: boolean;
  /**
   * 循环给予状态效果
   */
  cycleGetEffect: cycleEffectType;
  hasJob(player: mc.Player): boolean {
    return player.hasTag(this.id);
  }
  giveJob(player: mc.Player): void {
    player.addTag(this.id);
  }
  /**
   * 自定义效果
   */
  custom?: () => void;
  /**
   * 注册职业
   */
  register(): void {
    this.custom();
    /** 循环给予状态效果 */
    if (this.cycleGetEffect !== undefined) {
      mc.system.runInterval(() => {
        mc.world.getAllPlayers().forEach((player) => {
          if (this.hasJob(player)) {
            player.addEffect(
              this.cycleGetEffect.typeId,
              6000,
              this.cycleGetEffect.options,
            );
          }
        });
      }, 6000);
    }
  }
}

/**
 * 循环给予状态效果的类型，其无需指定持续时间
 */
export interface cycleEffectType {
  typeId: string;
  options?: mc.EntityEffectOptions;
}

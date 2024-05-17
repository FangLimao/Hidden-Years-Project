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
  /**
   * 注册职业
   */
  register(): void {
    /** 循环给予状态效果 */
    if (this.cycleGetEffect !== undefined) {
      mc.system.runInterval(() => {
        mc.world.getAllPlayers().forEach((player) => {
          if (player.hasTag(this.id)) {
            player.addEffect(
              this.cycleGetEffect.typeId,
              6000,
              this.cycleGetEffect.options
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

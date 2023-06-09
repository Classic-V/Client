import alt from 'alt-client';
import game from 'natives';
import { Ped } from "../utils/interfaces/ped.mjs";
import { ScriptBase } from "../utils/models/baseModels/script.base.mjs";

class PedStreamer extends ScriptBase {
  private _peds: Ped[];

  constructor() {
    super('PedStreamer');

    this._peds = [];

    alt.onServer('Client:PedStreamer:AddPed', this.addObject.bind(this));
    alt.onServer('Client:PedStreamer:RemovePed', this.removeObject.bind(this));
    alt.onServer('Client:PedStreamer:SetPeds', this.setObjects.bind(this));
  }

  public async addObject(json: string): Promise<void> {
    const obj: Ped = JSON.parse(json);
    await this.spawnPed(obj);
  }

  public removeObject(id: number): void {
    const index = this._peds.findIndex(x => x.Id == id);
    if (index == -1) return;

    game.deletePed(this._peds[index].ScriptId);

    this._peds.splice(index, 1);
  }

  private setObjects(json: string): void {
    JSON.parse(json).forEach(async (obj: Ped) => {
      await this.spawnPed(obj);
    });
  }

  private setPedStats(scriptId: number, freezed: boolean): void {
    game.freezeEntityPosition(scriptId, freezed);
    game.setEntityAsMissionEntity(scriptId, true, false);
    game.freezeEntityPosition(scriptId, true);
    game.setPedCanRagdoll(scriptId, false);
    game.taskSetBlockingOfNonTemporaryEvents(scriptId, true);
    game.setBlockingOfNonTemporaryEvents(scriptId, true);
    game.setPedFleeAttributes(scriptId, 0, false);
    game.setPedCombatAttributes(scriptId, 17, true);
    game.setEntityInvincible(scriptId, true);
    game.setPedSeeingRange(scriptId, 0);
  }

  private async spawnPed(obj: Ped): Promise<void> {
    await this.loadModel(obj.Hash).then(() => {
      const ped = game.createPed(26, obj.Hash, obj.PosX, obj.PosY, obj.PosZ, obj.Heading, false, false);

      const ticks = 0;
      const interval = alt.setInterval(() => {
        if (ped > 0) {
          clearInterval(interval);
          this.createdPed(obj, ped);
          return;
        }

        if (ticks > 300) {
          clearInterval(interval);
          alt.log('Failed to create Ped: ' + obj.Id);
        }
      }, 10);
    }).catch((e) => alt.log(`[Ped Streamer] Failed to load Model!`));
  }

  private createdPed(obj: Ped, scriptId: number): void {
    this.setPedStats(scriptId, obj.Freezed);

    obj.ScriptId = scriptId;
    this._peds.push(obj);
  }

  private async loadModel(model: number): Promise<void> {
    await alt.Utils.requestModel(model);
  }
}

export default new PedStreamer();
import alt from 'alt-client';
import game from 'natives';
import browserModule from '../../modules/browser.module.mjs';
import playerModule from '../../modules/player.module.mjs';
import pedStreamer from '../../streamer/ped.streamer.mjs';
import { Ped } from '../../utils/interfaces/ped.mjs';
import { CreatorData } from '../../utils/interfaces/creator.data.mjs';
import { WindowBase } from "../../utils/models/baseModels/window.base.mjs";

class CreatorWindow extends WindowBase {
  private _camera: number | null;
  private _lastData: CreatorData | null;
  private _ped: number;

  constructor() {
    super('Creator');

    this._camera = null;
    this._lastData = null;
    this._ped = 0;

    alt.Utils.requestModel(0x705E61F2);
    alt.Utils.requestModel(0x9C9EFFD8);

    browserModule.on('Client:Creator:Rotate', this.rotate.bind(this));
    browserModule.on('Client:Creator:SetGender', this.changeGender.bind(this));
    browserModule.on('Client:Creator:Update', this.update2.bind(this));

    alt.onServer('Client:Creator:SetCustomization', this.update2.bind(this));
  }

  private async changeGender(gender: number): Promise<void> {
    let modelHash = game.getHashKey(gender == 1 ? 'mp_m_freemode_01' : 'mp_f_freemode_01');
    game.deletePed(this._ped);
    await alt.Utils.requestModel(modelHash);
    this._ped = game.createPed(26, (gender == 1 ? 0x705E61F2 : 0x9C9EFFD8), 402.8664, -996.4108, -100, 0, false, true);
    game.freezeEntityPosition(this._ped, true);
    game.setEntityHeading(this._ped, 180);
    game.taskSetBlockingOfNonTemporaryEvents(this._ped, true);

    this.update(this._lastData!);
  }

  private rotate(mod: number): void {
    game.setEntityHeading(alt.Player.local.scriptID, alt.Player.local.rot.z + ((mod * 3) * -1));
  }

  private update2(json: string, player: boolean = false): void {
    this.update(JSON.parse(json), player);
  }

  private update(data: CreatorData, player: boolean = false): void {
    const ped = (player ? alt.Player.local.scriptID : this._ped);
    alt.log('Ped: '+this._ped);

    this._lastData = data;

    game.setPedHeadBlendData(ped, parseFloat(data.Parents.Mother), parseFloat(data.Parents.Father), 0, parseFloat(data.Parents.Mother), parseInt(data.Parents.Father), 0, parseFloat(data.Parents.Similarity), parseFloat(data.Parents.SkinColor), 0, true);
    game.setPedComponentVariation(ped, 2, parseFloat(data.Hair.Hair), 0, 2);
    game.setPedHairTint(ped, parseFloat(data.Hair.HairColor), parseFloat(data.Hair.HairColor2));
    game.setPedHeadOverlay(ped, 1, parseFloat(data.Hair.Beard), parseFloat(data.Hair.BeardOpacity));
    game.setPedHeadOverlayTint(ped, 1, 1, parseFloat(data.Hair.BeardColor), parseFloat(data.Hair.BeardColor));
    game.setPedHeadOverlay(ped, 2, parseFloat(data.Eye.Eyebrow), 1);
    game.setPedHeadOverlayTint(ped, 2, 1, parseInt(data.Eye.EyebrowColor), parseInt(data.Eye.EyebrowColor));
    game.setHeadBlendEyeColor(ped, parseFloat(data.Eye.EyeColor));

    game.setPedMicroMorph(ped, 0, parseFloat(data.Face.NoseWidth));
    game.setPedMicroMorph(ped, 1, parseFloat(data.Face.NosePeak));
    game.setPedMicroMorph(ped, 2, parseFloat(data.Face.NoseLength));
    game.setPedMicroMorph(ped, 3, parseFloat(data.Face.NoseBridge));
    game.setPedMicroMorph(ped, 4, parseFloat(data.Face.NoseHeight));
    game.setPedMicroMorph(ped, 5, parseFloat(data.Face.NoseMovement));
    game.setPedMicroMorph(ped, 12, parseFloat(data.LipWidth));
    game.setPedMicroMorph(ped, 19, parseFloat(data.NeckWidth));
    game.setPedHeadOverlay(ped, 3, parseFloat(data.Age), 1);
    game.setPedHeadOverlay(ped, 4, parseFloat(data.MakeUp), parseFloat(data.MakeupOpacity));
    game.setPedHeadOverlay(ped, 5, parseFloat(data.Blush), parseFloat(data.BlushOpacity));
    game.setPedHeadOverlayTint(ped, 5, 2, parseFloat(data.BlushColor), parseFloat(data.BlushColor));
    game.setPedHeadOverlay(ped, 8, parseFloat(data.Lipstick), parseFloat(data.LipstickOpacity));
    game.setPedHeadOverlayTint(ped, 8, 2, parseFloat(data.LipstickColor), parseFloat(data.LipstickColor));
  }

  public onShow(state: boolean, data: string): void {
    if (state) {
      this._lastData = JSON.parse(data);
      this._camera = game.createCamWithParams('DEFAULT_SCRIPTED_CAMERA', 402.8664, -997.5515, -98.5, 0, 0, 0, 90, true, 2);
      game.pointCamAtCoord(this._camera, 402.8664, -996.4108, -98.5);
      game.setCamActive(this._camera, true);
      this.changeGender(parseInt(this._lastData!.Gender));
    } else {
      game.deletePed(this._ped);
      this._camera = null;
    }

    game.renderScriptCams(state, false, 0, true, false, 0);
    game.freezeEntityPosition(alt.Player.local.scriptID, state);
  }
}

export default new CreatorWindow();
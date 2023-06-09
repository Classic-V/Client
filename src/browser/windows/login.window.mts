import alt from 'alt-client';
import game from 'natives';

import { WindowBase } from "../../utils/models/baseModels/window.base.mjs";

class LoginWindow extends WindowBase {
  private _camera: number | null;

  constructor() {
    super('Login');

    this._camera = null;
  }

  public onShow(state: boolean, data: string): void {
    this._camera = state ? game.createCamWithParams('DEFAULT_SCRIPTED_CAMERA', 10, 1, 90, 0, 0, 240, 50, true, 2) : null;

    game.setTimecycleModifier(state ? 'hud_def_blur' : 'default');
    game.renderScriptCams(state, false, 0, true, false, 0);
    if(this._camera != null) game.setCamActive(this._camera, state);
  }
}

export default new LoginWindow();
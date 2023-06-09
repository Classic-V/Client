import alt from 'alt-client';
import browserModule from '../../modules/browser.module.mjs';
import { KeyCode } from '../../utils/enums/keys.mjs';

import { WindowBase } from "../../utils/models/baseModels/window.base.mjs";

class GangwarStatsWindow extends WindowBase {
  constructor() {
    super('GangwarStats');
    
    alt.on('keydown', this.onKeyDown.bind(this));
  }

  private onKeyDown(key: number): void {
    if(key != KeyCode.ESCAPE || !this.visible) return;

    browserModule.showComponent(this.name, false);
  }
}

export default new GangwarStatsWindow();
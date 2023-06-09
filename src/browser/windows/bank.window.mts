import alt from 'alt-client';
import browserModule from "../../modules/browser.module.mjs";
import { KeyCode } from "../../utils/enums/keys.mjs";
import { InteractionWindow } from "../../utils/models/baseModels/window.base.mjs";
import { ColshapeType } from '../../utils/enums/colshapeType.mjs';

class BankWindow extends InteractionWindow {
  constructor() {
    super('Bank', KeyCode.KEY_E, false, true, ColshapeType.BANK);

    alt.on('keydown', this.keydown.bind(this));
  }

  private keydown(key: number): void {
    if(!this.visible || key != KeyCode.ESCAPE) return;

    browserModule.showComponent('Bank', false);
  }
}

export default new BankWindow();
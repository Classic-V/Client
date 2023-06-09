import { KeyCode } from "../../utils/enums/keys.mjs";
import { ColshapeType } from "../../utils/enums/colshapeType.mjs";
import { InteractionWindow } from "../../utils/models/baseModels/window.base.mjs";
import browserModule from "../../modules/browser.module.mjs";

class FFAWindow extends InteractionWindow {
    private _canOpen: boolean;
    constructor(){
        super('FFA', KeyCode.KEY_E, false, true, ColshapeType.FFA)

        alt.on('keydown', this.keydown.bind(this)); 
    }

    private keydown(key: number): void {
        if(!this.visible || key != KeyCode.ESCAPE) return;

        browserModule.showComponent("FFA", false); 
    }
}

export default new FFAWindow(); 
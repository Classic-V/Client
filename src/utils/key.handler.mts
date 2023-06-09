import alt, { BaseObjectType } from 'alt-client';
import * as natives from 'natives';
import game from 'natives';
import adminModule from '../modules/admin.module.mjs';
import browserModule from '../modules/browser.module.mjs';
import playerModule from '../modules/player.module.mjs';
import { ColshapeType } from './enums/colshapeType.mjs';
import { KeyCode } from './enums/keys.mjs';

import { ScriptBase } from "./models/baseModels/script.base.mjs";
import { clearTasks, playAnim } from './animation.handler.mjs';

class KeyHandler extends ScriptBase {
  private _interactions: any;

  constructor() {
    super('KeyHandler');

    this._interactions = {};

    alt.onServer('Client:KeyHandler:SetInteraction', this.setInteraction.bind(this));
    alt.on('keydown', (key: number) => this.onKeyDown(key));
  }

  private setInteraction(key: string, interaction: string): void {
    this._interactions[key] = interaction;
  }

  private onKeyDown(key: number): void {
    if (!playerModule.alive || alt.Player.local.getStreamSyncedMeta('ROPED') || alt.Player.local.getStreamSyncedMeta('CUFFED')) return;

    switch (key) {
      case KeyCode.PERIOD:
        if (browserModule.isAnyComponentActive() || playerModule.isFarming || alt.Player.local.vehicle != null) return;

        this.triggerServer('Server:Inventory:Use', 2, 1);
        break;
      case KeyCode.COMMA:
        if (browserModule.isAnyComponentActive() || playerModule.isFarming || alt.Player.local.vehicle != null) return;

        this.triggerServer('Server:Inventory:Use', 1, 1);
        break;
      case KeyCode.KEY_E:
        if (browserModule.isAnyComponentActive('Progressbar') || alt.Player.local.vehicle != null) return;

        if (playerModule.isFarming) {
          this.triggerServer('Server:Farming:Stop');
          return;
        }

        switch (this._interactions['KEY_E']) {
          case 'INTERACTION':
            this.triggerServer('Server:Player:StopInteraction');
            break;
          case 'JUMPPOINT':
            this.triggerServer('Server:JumpPoint:Enter');
            break;
          case 'STORAGE':
            this.triggerServer('Server:Storage:Interact');
            break;
          case 'PROCESSOR':
            this.triggerServer('Server:Processor:Start');
            break;
          case 'TEAM':
            this.triggerServer('Server:Team:Interact');
            break;
          case 'GANGWAR':
            this.triggerServer('Server:Gangwar:Interact');
            break;
          case 'GANGWARSPAWN':
            this.triggerServer('Server:Gangwar:OpenMenu');
            break;
          case 'LABORATORY':
            this.triggerServer('Server:Team:ToggleLaboratory');
            break;
          case 'DEALER':
            this.triggerServer('Server:Dealer:Open');
            break;
          case 'FARMING':
            this.triggerServer('Server:Farming:Start');
            break;
          case 'VEHICLE_SHOP':
            this.triggerServer('Server:VehicleShop:Open');
            break;
          case 'SWAT_SHOP':
            this.triggerServer('Server:SWAT:OpenShop');
            break;
          case 'HOUSE':
            this.triggerServer("Server:House:Open");
            break;
          case 'WARDROBE':
            this.triggerServer("Server:Wardrobe:Open");
            break;
          case 'TRAINING':
            this.triggerServer("Server:TrainingStation:Start");
            break;
          case 'POST_JOB_POST_RETURN':
            this.triggerServer("Server:PostJob:Return");
            break;
          case 'POST_JOB_POST_JOIN':
            this.triggerServer("Server:PostJob:Open");
            break;
          case 'MONEY_TRANSPORT_JOB_JOIN':
            this.triggerServer("Server:MoneyTransportJob:Open");
            break;
          case 'MONEY_TRANSPORT_JOB_RETURN':
            this.triggerServer("Server:MoneyTransportJob:Return");
            break;
          case 'LIFEINVADER':
            this.triggerServer("Server:Lifeinvader:Open");
            break;
          case 'PIZZA_JOB_JOIN':
            this.triggerServer("Server:PizzaDeliveryJob:Open");
            break;
          case 'PIZZA_JOB_RETURN':
            this.triggerServer("Server:PizzaDeliveryJob:Return");
            break;
          case 'FEDERAL_LICENSE_OPEN':
            this.triggerServer("Server:Federal:OpenLicense");
            break;
          case 'SAD_OPEN_SHOP':
            this.triggerServer("Server:SAD:OpenShop");
            break;
        }
        break;
      case KeyCode.KEY_L:
        if (browserModule.isAnyComponentActive() || playerModule.isFarming) return;

        switch (this._interactions['KEY_L']) {
          case 'JUMPPOINT':
            this.triggerServer("Server:JumpPoint:Lock");
            break;
          case 'HOUSE':
            this.triggerServer("Server:House:Lock");
            break;
          case 'DOOR_LOCK':
            this.triggerServer("Server:Door:Lock");
            break;
          default:
            const lockPossible = (alt.Player.local.vehicle != null || alt.Vehicle.all.find(x => x.pos.distanceToSquared(alt.Player.local.pos) < 7) != null);
            if (lockPossible) this.triggerServer('Server:Vehicle:Lock');
            break;
        }
        break;
      case KeyCode.KEY_K:
        if (browserModule.isAnyComponentActive() || playerModule.isFarming) return;

        const lockPossible = (alt.Player.local.vehicle != null || alt.Vehicle.all.find(x => x.pos.distanceToSquared(alt.Player.local.pos) < 7) != null);
        if (lockPossible) this.triggerServer('Server:Vehicle:LockTrunk');
        break;
      case KeyCode.F1:
        alt.showCursor(!alt.isCursorVisible());
        browserModule.focus(alt.isCursorVisible());
        break;
      case KeyCode.KEY_J:
        if (browserModule.isAnyComponentActive() || alt.Player.local.vehicle == null || alt.Player.local.seat != 1 || !game.isVehicleSirenOn((alt.Player.local.vehicle as alt.Vehicle).scriptID)) return;
        this.triggerServer('Server:Vehicle:ToggleSirenState');
        break;
      case KeyCode.F6:
        if (browserModule.isAnyComponentActive()) return;
        this.triggerServer('Server:Admin:ToggleDuty');
        break;
      case KeyCode.F7:
        adminModule.noclip.toggle();
        break;
      case KeyCode.KEY_H:
        if (browserModule.isAnyComponentActive() || !playerModule.alive || playerModule.isFarming || alt.Player.local.vehicle != null) return;
        if (game.isEntityPlayingAnim(alt.Player.local, "missfbi5ig_21", "hand_up_scientist", 49)) clearTasks();
        else playAnim(16);
        break;
      // case KeyCode.F5:
      //   if (browserModule.isAnyComponentActive() || !playerModule.alive || playerModule.isFarming || alt.Player.local.vehicle != null) return;

      //   this.triggerServer("Server:AnimationMenu:Open");
      //   break;
    }
  }
}

export default new KeyHandler();
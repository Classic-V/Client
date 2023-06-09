import alt from 'alt-client';
import game from 'natives';
import browserModule from '../../modules/browser.module.mjs';
import playerModule from '../../modules/player.module.mjs';
import { KeyCode } from "../../utils/enums/keys.mjs";
import { WindowBase } from "../../utils/models/baseModels/window.base.mjs";
import { getEntity } from '../../utils/raycast.handler.mjs';

class XMenuWindow extends WindowBase {
  private _canOpen: boolean;

  constructor() {
    super('XMenu');

    this._canOpen = true;

    alt.on('keydown', this.keydown.bind(this));
    alt.on('keyup', this.keyup.bind(this));
  }

  private keyup(key: number): void {
    if(key != KeyCode.KEY_X) return;

    alt.setTimeout(() => {
      if(!this.visible) return;
      browserModule.showComponent('XMenu', false);
    }, 50);
  }

  private keydown(key: number): void {
    if(!this._canOpen || browserModule.isAnyComponentActive('XMenu') || !playerModule.alive || alt.Player.local.getStreamSyncedMeta('ROPED') || alt.Player.local.getStreamSyncedMeta('CUFFED') || key != KeyCode.KEY_X) return;

    this._canOpen = false;

    const {x, y} = alt.getScreenResolution();
    alt.setCursorPos({ x: x / 2, y: y / 2 });

    const items = this.getItems();
    if(items.length > 0) {
      browserModule.showComponent('XMenu', true, JSON.stringify(items));
    }

    alt.setTimeout(() => this._canOpen = true, 50);
  }

  private getItems(): XMenuItem[] {
    let items: XMenuItem[] = [];
    const veh = alt.Player.local.vehicle;

    if(veh != null) {
      items = [
        new XMenuItem('Motor an/aus', 'engine', 'Server:XMenu:ToggleEngine', [veh.id]),
        new XMenuItem('Türen auf/zu', 'lock', 'Server:XMenu:LockVehicle', [veh.id]),
        new XMenuItem('Kofferraum auf/zu', 'trunk', 'Server:XMenu:LockTrunk', [veh.id]),
        new XMenuItem('Rauswerfen', 'eject', 'Server:XMenu:Eject', [veh.id])
      ];
    } else {
      const targetEntity = getEntity();
      if(targetEntity == null) return [];

      if(game.isEntityAPed(targetEntity)) {
        const targetPlayer = alt.Player.streamedIn.find(x => x.scriptID == targetEntity);
        if(targetPlayer == null) return [];

        const cuffed = targetPlayer.getStreamSyncedMeta('CUFFED');
        const roped = targetPlayer.getStreamSyncedMeta('ROPED');
        const alive = targetPlayer.getStreamSyncedMeta('ALIVE');

        items.push(new XMenuItem('Geld geben', 'money', 'Server:XMenu:GiveMoney', [targetPlayer.id]));

        items.push(new XMenuItem('Ausweis zeigen', 'id', 'Server:XMenu:GiveId', [targetPlayer.id]));  
        if(cuffed || roped || !alive) items.push(new XMenuItem('Ausweis nehmen', 'id', 'Server:XMenu:TakeId', [targetPlayer.id]));

        items.push(new XMenuItem('Lizenzen zeigen', 'license', 'Server:XMenu:GiveLicense', [targetPlayer.id]));
        if(cuffed || roped || !alive) items.push(new XMenuItem('Lizenzen nehmen', 'license', 'Server:XMenu:TakeLicense', [targetPlayer.id]));

        if(!alive) items.push(new XMenuItem('Stabilisieren', 'heal', 'Server:XMenu:Stabilize', [targetPlayer.id]));

        items.push(new XMenuItem('Gegenstand geben', 'give', 'Server:Inventory:Open', [targetPlayer.id]));

        if(cuffed || roped || !alive) {
          items.push(new XMenuItem('Ins Fahrzeug ziehen', 'grab', 'Server:XMenu:Grab', [targetPlayer.id]));
          items.push(new XMenuItem('Durchsuchen', 'search', 'Server:XMenu:Search', [targetPlayer.id]));
        }

        if(!cuffed && alive) {
          if(!roped) items.push(new XMenuItem('Fesseln', 'rope', 'Server:XMenu:Rope', [targetPlayer.id, true]));
          else items.push(new XMenuItem('Entfesseln', 'rope', 'Server:XMenu:Rope', [targetPlayer.id, false]));
        }

        if(playerModule.team == 1 || playerModule.team == 2 || playerModule.team == 5) {
          if(!roped && alive) {
            if(!cuffed) items.push(new XMenuItem('Handschellen anlegen', 'handcuff', 'Server:XMenu:Cuff', [targetPlayer.id, true]));
            else items.push(new XMenuItem('Handschellen abnehmen', 'handcuff', 'Server:XMenu:Cuff', [targetPlayer.id, false]));
          }
        }

        if(playerModule.team == 3 && !alive) {
          items.push(new XMenuItem('Reanimieren', 'revive', 'Server:XMenu:Revive', [targetPlayer.id]));
        }
      }

      if(game.isEntityAVehicle(targetEntity)) {
        const targetVehicle = alt.Vehicle.streamedIn.find(x => x.scriptID == targetEntity);
        if(targetVehicle == null) return [];

        items = [
          new XMenuItem('Türen auf/zu', 'lock', 'Server:XMenu:LockVehicle', [targetVehicle.id]),
          new XMenuItem('Kofferraum auf/zu', 'trunk', 'Server:XMenu:LockTrunk', [targetVehicle.id]),
          new XMenuItem('Reparieren', 'wrench', 'Server:XMenu:Repair', [targetVehicle.id]),
          new XMenuItem('Tanken', 'fuel', 'Server:XMenu:OpenFuel', [targetVehicle.id]),
          new XMenuItem('Einparken', 'park', 'Server:XMenu:Park', [targetVehicle.id])
        ];
      }
    }

    return items;
  }
}

export default new XMenuWindow();

class XMenuItem {
  public Label: string;
  public Icon: string;
  public CallbackEvent: string;
  public CallbackArgs: any[];

  constructor(label: string, icon: string, event: string, args: any[]) {
    this.Label = label;
    this.Icon = icon;
    this.CallbackEvent = event;
    this.CallbackArgs = args;
  }
}
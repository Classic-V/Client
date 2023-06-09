import alt from 'alt-client';
import game from 'natives';

import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";
import { loadIPLs } from '../utils/ipl.mjs';
import { Colshape } from '../utils/models/colshape.model.mjs';
import { clearTasks, playAnim } from '../utils/animation.handler.mjs';
import { WeaponModel } from '../utils/models/weapon.model.mjs';
import browserModule from './browser.module.mjs';
import objectStreamer from '../streamer/object.streamer.mjs';

const weathers = [
  "CLEAR",
  "EXTRASUNNY",
  "CLOUDS",
  "OVERCAST",
  "RAIN",
  "CLEARING",
  "THUNDER",
  "SMOG",
  "FOGGY"
];

export default new class PlayerModule extends ModuleBase {
  public alive: boolean;
  public freezed: boolean;
  public isFarming: boolean;
  public colshape: Colshape | null;
  public weapons: WeaponModel[];
  public dimension: number;
  public team: number;
  public admin: number;

  constructor() {
    super('PlayerModule');

    this.alive = true;
    this.freezed = false;
    this.isFarming = false;
    this.colshape = null;
    this.weapons = [];
    this.dimension = 0;
    this.team = 0;
    this.admin = 0;

    this.setMaxStats();
    loadIPLs();
    this.setTime();

    alt.onServer('Client:PlayerModule:SetAlive', this.setAlive.bind(this));
    alt.onServer('Client:PlayerModule:SetAdmin', this.setAdmin.bind(this));
    alt.onServer('Client:PlayerModule:SetCuffed', this.setCuffed.bind(this));
    alt.onServer('Client:PlayerModule:SetTeam', this.setTeam.bind(this));
    alt.onServer('Client:PlayerModule:SetDimension', this.setDimension.bind(this));
    alt.onServer('Client:PlayerModule:Freeze', this.setPlayerFreezed.bind(this));
    alt.onServer('Client:PlayerModule:SetWeather', this.setWeather.bind(this));
    alt.onServer('Client:PlayerModule:SetFarming', this.setPlayerFarming.bind(this));
    alt.onServer('Client:PlayerModule:SetRunSpeedMultiplier', this.setRunSpeedMultiplier.bind(this));
    alt.onServer('Client:PlayerModule:SetWaypoint', this.setWaypoint.bind(this));
    alt.onServer('Client:PlayerModule:SetWeapons', this.setWeapons.bind(this));
    alt.onServer('Client:PlayerModule:AddWeapon', this.addWeapon.bind(this));
    alt.onServer('Client:PlayerModule:RemoveWeapon', this.removeWeapon.bind(this));
    alt.onServer('Client:PlayerModule:SetAmmo', this.setAmmo.bind(this));
    alt.onServer('Client:PlayerModule:AddAmmo', this.addAmmo.bind(this));
    alt.onServer('Client:PlayerModule:EnterColshape', this.enterColshape.bind(this));
    alt.onServer('Client:PlayerModule:ExitColshape', this.exitColshape.bind(this));
    alt.onServer('Client:PlayerModule:LoadIpl', this.loadIpl.bind(this));
    alt.onServer('Client:PlayerModule:UnloadIpl', this.unloadIpl.bind(this));

    browserModule.on('Client:PlayerModule:SetWaypoint', this.setWaypoint.bind(this));

    alt.everyTick(this.tick.bind(this));
    alt.setInterval(this.deathTick.bind(this), 800);
    alt.setInterval(this.minuteTick.bind(this), 60 * 1000);
    alt.setInterval(this.disableIdleCam.bind(this), 15000);
  }

  private disableIdleCam(): void {
    game.invalidateIdleCam();
    game.invalidateCinematicVehicleIdleMode();
  }

  private tick(): void {
    if(game.isPedUsingActionMode(alt.Player.local)) {
      game.setPedUsingActionMode(alt.Player.local, false, -1, "-1");
    }

    if(game.isPedArmed(alt.Player.local.scriptID, 6)) {
      game.disableControlAction(0, 140, true);
      game.disableControlAction(0, 141, true);
      game.disableControlAction(0, 142, true);
    }

    if(this.freezed) {
      game.disablePlayerFiring(alt.Player.local.scriptID, true);
      game.disableControlAction(0, 30, true); //Move LR
      game.disableControlAction(0, 31, true); //Move UD
      game.disableControlAction(0, 22, true); //Space
      game.disableControlAction(0, 23, true); //Veh Enter
      game.disableControlAction(0, 25, true); //Right Mouse
      game.disableControlAction(0, 44, true); //Q
      game.disableControlAction(2, 75, true); //Exit Vehicle
      game.disableControlAction(2, 140, true); //R
      game.disableControlAction(2, 141, true); //Left Mouse
    }

    game.disableControlAction(0, 36, true);
    game.disableControlAction(0, 345, true);
  }

  private setAdmin(rank: number): void {
    this.admin = rank;
  }

  private setCuffed(state: boolean): void {
    this.freezed = state;
    game.setEnableHandcuffs(alt.Player.local, state);
  }

  private setTeam(team: number): void {
    this.team = team;
  }

  private setDimension(dim: number): void {
    this.dimension = dim;
    objectStreamer.onDimensionChange(dim);
  }

  public setWeather(id: number): void {
    game.setWeatherTypeNow(weathers[id]);
  }

  public setPlayerFarming(state: boolean): void {
    this.isFarming = state;
  }

  public setPlayerFreezed(state: boolean): void {
    this.freezed = state;
  }

  private addWeapon(json: string): void {
    this.weapons.push(JSON.parse(json));
  }

  private removeWeapon(weapon: number): void {
    this.weapons.splice(this.weapons.findIndex(x => x.hash == weapon), 1);
    game.setPedAmmo(alt.Player.local.scriptID, weapon, 0, true);
  }

  private setWeapons(json: string): void {
    this.weapons = JSON.parse(json);
  }

  private setTime(): void {
    const now = new Date();
    game.setClockTime(now.getHours(), now.getMinutes(), 0);
  }

  private minuteTick(): void {
    var weapons: WeaponModel[] = [];
    this.weapons.forEach((x, i) => {
      let ammo = game.getAmmoInPedWeapon(alt.Player.local.scriptID, x.hash);
      ammo = (ammo < 0 ? 0 : ammo);
      if (ammo < x.ammo) {
        this.weapons[i].ammo = ammo;
        weapons.push(x);
      }
    });

    if (weapons.length < 1) return;

    this.triggerServer('Server:Player:UpdateAmmo', JSON.stringify(weapons));
  }

  private deathTick(): void {
    this.setTime();

    if (!this.alive) {
      const stabilized = alt.Player.local.getStreamSyncedMeta('STABILIZED') as boolean;

      if(alt.Player.local.vehicle == null) {
        if(stabilized) {
          if(!game.isEntityPlayingAnim(alt.Player.local, "combat@damage@rb_writhe", "rb_writhe_loop", 1)) playAnim(12);
        } else {
          if(!game.isEntityPlayingAnim(alt.Player.local, "missarmenian2", "corpse_search_exit_ped", 1)) playAnim(0);
        }
      } else {
        clearTasks();
      }
    }
  }

  private setAlive(state: boolean): void {
    this.alive = state;
    this.freezed = !state;
    game.setPlayerCanDoDriveBy(alt.Player.local.scriptID, state);

    if (!state) game.animpostfxPlay("DeathFailOut", 0, true);
    else game.animpostfxStopAll();
    browserModule.disableAllComponents();
    browserModule.showComponent('Death', !state);
  }

  private setRunSpeedMultiplier(multi: number): void {
    game.setRunSprintMultiplierForPlayer(alt.Player.local.scriptID, multi);
  }

  private setWaypoint(x: number, y: number): void {
    game.setNewWaypoint(x, y);
  }

  private setAmmo(ammo: number): void {
    const hash = alt.Player.local.currentWeapon;
    const index = this.weapons.findIndex(x => x.hash == hash);
    if(index != -1) this.weapons[index].ammo = ammo;
    game.setPedAmmo(alt.Player.local.scriptID, hash, ammo, true)
  }

  private addAmmo(ammo: number): void {
    const hash = alt.Player.local.currentWeapon;
    const index = this.weapons.findIndex(x => x.hash == hash);
    const currentAmmo = game.getAmmoInPedWeapon(alt.Player.local.scriptID, hash);
    const newAmmo = currentAmmo + ammo;
    if(index != -1) this.weapons[index].ammo = newAmmo;
    game.setPedAmmo(alt.Player.local.scriptID, hash, newAmmo, true);
  }

  public enterColshape(id: number, type: number): void {
    this.colshape = new Colshape(id, type);
  }

  public exitColshape(id: number, type: number): void {
    this.colshape = null;
  }

  private setMaxStats() {
    alt.setStat('stamina', 200);
    alt.setStat('strength', 100);
    alt.setStat('lung_capacity', 100);
    alt.setStat('wheelie_ability', 100);
    alt.setStat('flying_ability', 100);
    alt.setStat('shooting_ability', 200);
    alt.setStat('stealth_ability', 100);
  }

  private loadIpl(ipl: string) {
    alt.requestIpl(ipl);
  }

  private unloadIpl(ipl: string) {
    alt.removeIpl(ipl);
  }
}
import alt, { BaseObjectType } from 'alt-client';
import game from 'natives';
import { AnticheatComponent } from '../utils/models/anticheat.component.mjs';
import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";
import playerModule from './player.module.mjs';
import weaponData from '../utils/data/weaponData.mjs';
import adminModule from './admin.module.mjs';

type godmodePlayer = { player: number, date: Date };

const vehicleParachuteWhitelist: number[] = [
  0x381E10BD
];

const vehicleRocketboostWhitelist: number[] = [
  0x3AF76F4A,
  0xB5EF4C33
];

export default new class AnticheatModule extends ModuleBase {
  public static tpMaxDist: number = 15;
  public static tpVehicleMaxDist: number = 35;

  public active: boolean;
  public health: AnticheatComponent<number>;
  public godmode: AnticheatComponent<boolean>;
  public position: AnticheatComponent<alt.Vector3>;
  public fly: AnticheatComponent<boolean>;
  public magic: AnticheatComponent<null>;
  public godmodePlayers: godmodePlayer[];
  public lastShot: number;

  constructor() {
    super('AnticheatModule');

    this.active = true;
    this.health = new AnticheatComponent(200, 1200);
    this.godmode = new AnticheatComponent(false, 750);
    this.position = new AnticheatComponent(alt.Player.local.pos, 750);
    this.fly = new AnticheatComponent(false, 750);
    this.magic = new AnticheatComponent(null, 300);
    this.godmodePlayers = [];
    this.lastShot = new Date().getTime();

    alt.everyTick(this.tick.bind(this));

    alt.on('playerWeaponShoot', this.onWeaponShoot.bind(this));
    alt.on('weaponDamage', this.onWeaponDamage.bind(this));
    alt.on('enteredVehicle', this.enterVehicle.bind(this));
    alt.on('leftVehicle', this.extiVehicle.bind(this));

    alt.onServer('Client:AnticheatModule:SetHealth', this.setHealth.bind(this));
    alt.onServer('Client:AnticheatModule:SetGodmode', this.setGodmode.bind(this));
    alt.onServer('Client:AnticheatModule:SetPosition', this.setPosition.bind(this));
  }

  private enterVehicle(veh: alt.Vehicle, seat: number): void {
    this.position.reset(alt.Player.local.pos);
  }

  private extiVehicle(veh: alt.Vehicle, seat: number): void {
    this.position.reset(alt.Player.local.pos);
  }

  private setHealth(health: number): void {
    this.health.value = health;
    this.health.flags = 0;
  }

  public setGodmode(state: boolean): void {
    this.godmode.value = state;
    this.godmode.flags = 0;
  }

  public setPosition(pos: alt.Vector3): void {
    this.position.value = pos;
    this.position.flags = 0;
  }

  private tick(): void {
    if (!this.active) return;

    const player = alt.Player.local;

    if (this.health.active && (player.health + player.armour) > this.health.value) this.health.flag();
    else this.health.unflag();

    if (this.godmode.active && game.getPlayerInvincible(player) != this.godmode.value) this.godmode.flag();
    else this.godmode.unflag();

    if (this.position.active && (!game.isPedFalling(alt.Player.local) && !adminModule.noclip.active && this.position.value.distanceToSquared(player.pos) > (player.vehicle == null ? AnticheatModule.tpMaxDist : AnticheatModule.tpVehicleMaxDist))) this.position.flag();
    else { this.position.unflag(); this.position.value = player.pos; }

    this.checkFlags();

    if (game.isPedArmed(alt.Player.local.scriptID, 6)) {
      const weaponData = player.currentWeaponData;
      const data = (weaponData as any)[`${player.currentWeapon}`];
      if (data != null && weaponData != null) {
        // if (weaponData.recoilShakeAmplitude != data.recoilShakeAmplitude) this.cheatDetected(`RecoilShakeAmplitude`);
        // if (weaponData.recoilAccuracyMax != data.recoilAccuracyMax) this.cheatDetected(`RecoilAccuracyMax`);
        // if (weaponData.recoilAccuracyToAllowHeadshotPlayer != data.recoilAccuracyToAllowHeadshotPlayer) this.cheatDetected(`RecoilAccuracyToAllowHeadshotPlayer`);
        // if (weaponData.recoilRecoveryRate != data.recoilRecoveryRate) this.cheatDetected(`RecoilRecoveryRate`);
        // if (weaponData.animReloadRate != data.animReloadRate) this.cheatDetected(`AnimReloadRate`);
        // if (weaponData.vehicleReloadTime != data.vehicleReloadTime) this.cheatDetected(`VehicleReloadTime`);
        // if (weaponData.accuracySpread != data.accuracySpread) this.cheatDetected(`AccuracySpread`);
        // if (weaponData.range != data.range) this.cheatDetected(`Range`);
        // if (weaponData.timeBetweenShots != data.timeBetweenShots) this.cheatDetected(`TimeBetweenShots`);
        // if (weaponData.playerDamageModifier != data.playerDamageModifier) this.cheatDetected(`PlayerDamageModifier`);
      }

      player.weapons.forEach(x => {
        if (x == 2725352035) return;

        const weapon = playerModule.weapons.find(e => e.hash == x);
        if (weapon == null) {
          this.triggerServer('Server:Anticheat:Weapon', x);
          this.timeout();
          return;
        }

        const group = game.getWeapontypeGroup(x);
        if (group == 3566412244) return;

        const ammo = alt.Player.local.getWeaponAmmo(x);
        if (ammo > weapon.ammo) {
          this.triggerServer('Server:Anticheat:Ammo', x, ammo, weapon.ammo);
          this.timeout();
          return;
        }
      });
    }

    const now = new Date();
    alt.Player.streamedIn.forEach(x => {
      const entries = this.godmodePlayers.filter(e => e.player == x.id);
      if (entries.length < 1) return;

      const lastEntry = entries[entries.length - 1];
      if (now.getTime() - lastEntry.date.getTime() < 1500) return;

      for (let i = 0; i < entries.length; i++)
        this.godmodePlayers.splice(this.godmodePlayers.findIndex(j => j.player == x.id), 1);
    });

    if (alt.Player.local.vehicle != null) {
      const veh = alt.Player.local.vehicle;

      if (!vehicleParachuteWhitelist.includes(veh.model) && (game.isVehicleParachuteDeployed(veh.scriptID) || game.getVehicleCanDeployParachute(veh.scriptID) || game.getVehicleHasParachute(veh.scriptID))) {
        this.triggerServer('Server:Anticheat:VehicleParachute');
      }

      if (!vehicleRocketboostWhitelist.includes(veh.model) && game.isRocketBoostActive(veh.scriptID)) {
        this.triggerServer('Server:Anticheat:RocketBoost');
      }
    }
  }

  private checkFlags(): void {
    const player = alt.Player.local;
    
    if (this.health.flags > this.health.maxFlags) {
      this.triggerServer('Server:Anticheat:Healkey', this.health.value);
      this.timeout();
      this.health.reset(player.health + player.armour);
      return;
    }

    if (this.godmode.flags > this.godmode.maxFlags) {
      const godmode = game.getPlayerInvincible(player.scriptID);
      this.triggerServer('Server:Anticheat:Godmode', this.godmode.value);
      this.timeout();
      this.godmode.reset(godmode);
      return;
    }

    if (this.position.flags > this.position.maxFlags) {
      this.triggerServer('Server:Anticheat:Teleport', this.position.value);
      this.timeout();
      this.position.reset(player.pos);
      return;
    }
  }

  private onWeaponShoot(weapon: number, ammo: number, clip: number): void {
    const data = (weaponData as any)[`${weapon}`];
    const now = new Date().getTime();

    if(data != null) {
      if(now - this.lastShot < data.rapidFireMinTime) {
        alt.log('[ANTICHEAT] Rapidfire time: ' + (now - this.lastShot));
        alt.log('[ANTICHEAT] Rapidfire data: ' + data.rapidFireMinTime);
        // this.cheatDetected('Rapidfire');
      }
    }

    this.lastShot = now;

    if (alt.Player.local.vehicle != null) return;
  }

  private onWeaponDamage(target: alt.Entity, weaponHash: number, damage: number, offset: alt.Vector3, bodyPart: alt.BodyPart): boolean | void {
    const data = (weaponData as any)[`${weaponHash}`];

    if (data != null && damage > data.damage) {
      this.triggerServer('Server:Anticheat:DamageModifier', weaponHash, damage, data.damage);
      this.timeout();
    }

    if (target.type != BaseObjectType.Player) return;
    const targetPlayer = target as alt.Player;
    if(targetPlayer.getStreamSyncedMeta('GODMODE') || targetPlayer.health <= 100) return;

    const beforeHealth = targetPlayer.health;
    const beforeArmor = targetPlayer.armour;

    alt.setTimeout(() => {
      if ((targetPlayer.getStreamSyncedMeta('GODMODE') || targetPlayer.health <= 100) || (!targetPlayer.valid || (targetPlayer.health + targetPlayer.armour) <= (beforeHealth + beforeArmor - damage))) return;

      this.godmodePlayers.push({ player: targetPlayer.id, date: new Date() });

      if (this.godmodePlayers.filter(x => x.player == targetPlayer.id).length > 5) {
        this.triggerServer('Server:Anticheat:GodmodeTarget', targetPlayer, beforeHealth + beforeArmor - damage);
      }
    }, 450);
  }

  private timeout(duration: number = 500): void {
    this.active = false;
    alt.setTimeout(() => {
      this.active = true;
    }, duration);
  }
}
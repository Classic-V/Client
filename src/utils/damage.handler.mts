import alt from 'alt-client';
import weaponData from './data/weaponData.mjs';

const onWeaponChange = (oldWeapon: number, newWeapon: number) => {
  const data = alt.WeaponData.getForHash(newWeapon);
  const data2 = (weaponData as any)[`${newWeapon}`];
  if(data == null || data2 == null) return;
  
  data.damage = data2.damage;
  data.headshotDamageModifier = 0;
  data.playerDamageModifier = 1;
}

alt.on('playerWeaponChange', onWeaponChange);
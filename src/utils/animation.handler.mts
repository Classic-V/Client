import alt from 'alt-client';
import game from 'natives';

type animation = [string,string,number];

const animations: animation[] = [
  ["missarmenian2", "corpse_search_exit_ped", 1],                                    // 0  DEATH
  ["anim@heists@narcotics@funding@gang_idle", "gang_chatting_idle01", 1],            // 1  USEVEST
  ["anim@heists@money_grab@duffel", "enter", 2],                                     // 2  PACKVEST
  ["missheistdockssetup1ig_3@base", "welding_base_dockworker", 1],                   // 3  PACKGUN
  ["mp_common", "givetake2_a", 48],                                                  // 4  GIVEITEM
  ["amb@medic@standing@tendtodead@idle_a", "idle_a", 1],                             // 5  MEDIKIT
  ["amb@medic@standing@tendtodead@base", "base", 1],                                 // 6  PUT IN VEHICLE
  ["amb@world_human_const_drill@male@drill@base", "base", 1],                        // 7  DRILL
  ["amb@world_human_welding@male@idle_a", "idle_a", 1],                              // 8  WELDING
  ["mp_arresting", "arrested_spin_l_0", 50],                                         // 9  CUFFED
  ["mp_arresting", "arrested_spin_l_0", 50],                                         // 10 ROPED
  ["missmechanic", "work2_base", 1],                                                 // 11 REPAIR
  ["combat@damage@rb_writhe", "rb_writhe_loop", 1],                                  // 12 STABILIZED
  ["amb@prop_human_parking_meter@male@base", "base", 1],                             // 13 SEARCH
  ["amb@world_human_gardener_plant@male@base", "base", 1],                           // 14 HARVEST PLANT
  ["amb@code_human_in_bus_passenger_idles@female@tablet@idle_a", "idle_a", 1 << 0 | 1 << 4 | 1 << 5],      // 15 LAPTOP
  ["missfbi5ig_21", "hand_up_scientist", 49],                                        // 16 SURRENDER
  ["amb@world_human_stand_mobile@male@text@base", "base", 49],                       // 17 PHONE
];

export const playAnim = (type: number): void => {
  const [animDict, animName, flag] = animations[type];
  loadAnim(animDict).then(() => {
    game.taskPlayAnim(alt.Player.local.scriptID, animDict, animName, 8, -4, -1, flag, 0, false, false, false);
  });
}

export const playAnimTask = (animDict: string, animName: string, flag: number): void => {
  loadAnim(animDict).then(() => {
    game.taskPlayAnim(alt.Player.local.scriptID, animDict, animName, 8, -4, -1, flag, 0, false, false, false);
  });
}

export const playAnim2 = (dict: string, name: string, flag: number): void => {
  loadAnim(dict).then(() => {
    game.taskPlayAnim(alt.Player.local.scriptID, dict, name, 8, -4, -1, flag, 0, false, false, false);
  });
}

export const playAnimAtCoords = (type: number, pos: alt.Vector3, rot: alt.Vector3): void => {
  const [animDict, animName, flag] = animations[type];
  loadAnim(animDict).then(() => {
    game.taskPlayAnimAdvanced(alt.Player.local.scriptID, animDict, animName, pos.x, pos.y, pos.z, rot.x, rot.y, rot.z, 8, -4, -1, flag, 0, 0, 0);
  });
}

const loadAnim = async (animDict: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!game.hasAnimDictLoaded(animDict)) {
      game.requestAnimDict(animDict);
      let tryAmount = 0;
      const interval = alt.setInterval(() => {
        if (game.hasAnimDictLoaded(animDict)) {
          alt.clearInterval(interval);
          return resolve(true);
        }
        tryAmount++;
        if (tryAmount > 100) {
          alt.clearInterval(interval);
          return reject(false);
        }
      }, 50);
    }
    else return resolve(true);
  });
}

export const clearTasks = (): void => {
  game.clearPedTasks(alt.Player.local.scriptID);
}

alt.onServer('Client:Animation:Play', playAnim);
alt.onServer('Client:Animation:Play2', playAnim2);
alt.onServer('Client:Animation:PlayTask', playAnimTask);
alt.onServer('Client:Animation:PlayAtCoords', playAnimAtCoords);
alt.onServer('Client:Animation:ClearTasks', clearTasks);
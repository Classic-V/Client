import alt from "alt-client";
import { ModuleBase } from "../utils/models/baseModels/module.base.mjs";
import { NoclipModel } from "../utils/models/noclip.model.mjs";
import {
  doesBlipExist,
  getBlipInfoIdCoord,
  getFirstBlipInfoId,
  getGroundZFor3dCoord,
  getWaypointBlipEnumId,
} from "natives";

export default new (class AdminModule extends ModuleBase {
  public duty: boolean;
  public noclip: NoclipModel;

  constructor() {
    super("AdminModule");

    this.duty = false;
    this.noclip = new NoclipModel();

    alt.onServer("Client:AdminModule:SetDuty", (state: boolean) =>
      this.setDuty(state)
    );
    alt.onServer("Client:Admin:GetMarkerPosition:ForGoto", () => {
      var waypoint = getFirstBlipInfoId(8);

      if (doesBlipExist(waypoint)) {
        var { x, y, z } = getBlipInfoIdCoord(waypoint);

        this.triggerServer("Server:Admin:SendMarkerPosition:ForGoto", x, y, getGroundZFor3dCoord(x, y, z + 100, 1, undefined, undefined)[1]);
      }
    });
  }

  private setDuty(state: boolean): void {
    this.duty = state;

    this.noclip.disable();
  }
})();

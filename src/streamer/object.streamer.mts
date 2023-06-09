import alt from 'alt-client';
import game from 'natives';
import playerModule from '../modules/player.module.mjs';
import { Object } from "../utils/interfaces/object.mjs";
import { ScriptBase } from "../utils/models/baseModels/script.base.mjs";

class ObjectStreamer extends ScriptBase {
  private _objects: Object[];

  constructor() {
    super('ObjectStreamer');

    this._objects = [];

    alt.onServer('Client:ObjectStreamer:AddObject', this.addObject.bind(this));
    alt.onServer('Client:ObjectStreamer:RemoveObject', this.removeObject.bind(this));
    alt.onServer('Client:ObjectStreamer:SetObjects', this.setObjects.bind(this));
  }

  private async addObject(json: string): Promise<void> {
    const obj: Object = JSON.parse(json);
    
    await this.createObject(obj);
    this._objects.push(obj);
  }

  private removeObject(id: number): void {
    const index = this._objects.findIndex(x => x.Id == id);
    if(index == -1) return;

    this._objects[index].GameObject?.destroy();
    this._objects.splice(index, 1);
  }

  private setObjects(json: string): void {
    JSON.parse(json).forEach((obj: Object) => {
      this.createObject(obj);
      this._objects.push(obj);
    });
  }

  private createObject(obj: Object): void {
    if(obj.GameObject != null || playerModule.dimension != obj.Dimension) return;

    obj.GameObject = new alt.Object(
      obj.Hash,
      new alt.Vector3(obj.PosX, obj.PosY, obj.PosZ),
      new alt.Vector3(obj.RotX, obj.RotY, obj.RotZ),
      true,
      obj.Dynamic
    );

    obj.GameObject.positionFrozen = true;
  }

  public onDimensionChange(dimension: number): void {
    this._objects.forEach((x: Object, i: number): void => {
      if(x.Dimension == dimension) {
        this.createObject(x);
      } else {
        this._objects[i].GameObject?.destroy();
        this._objects[i].GameObject = null;
      }
    });
  }
}

export default new ObjectStreamer();
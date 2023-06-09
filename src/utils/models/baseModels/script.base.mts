import alt from 'alt-client';

export abstract class ScriptBase {
  private static _eventKey: string;

  public readonly name: string;

  protected constructor(name: string) {
    this.name = name;

    alt.log(`[Client] Script ${name} loaded!`);
  }

  public static setEventKey(key: string): void {
    ScriptBase._eventKey = key;
  }

  protected triggerServer(event: string, ...args: any[]): void {
    alt.emitServer(event, ScriptBase._eventKey, ...args);
    alt.logDebug(`[Client] Server event triggered (${event}, ${args})`);
  }
}

alt.onServer('Client:Script:SetEventKey', (key: string) => ScriptBase.setEventKey(key));
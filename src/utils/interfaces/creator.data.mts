import { EyeData } from "./creator/eye.data.mjs";
import { FaceData } from "./creator/face.data.mjs";
import { HairData } from "./creator/hair.data.mjs";
import { ParentsData } from "./creator/parents.data.mjs";

export interface CreatorData {
  Gender: string;
  Parents: ParentsData;
  Hair: HairData;
  Eye: EyeData;
  Face: FaceData;
  NeckWidth: string;
  LipWidth: string;
  Age: string;
  MakeUp: string;
  /* NEW */  MakeupColor: string;
  /* NEW */  MakeupOpacity: string;
  Blush: string;
  /* NEW */  BlushColor: string;
  /* NEW */  BlushOpacity: string;
  Lipstick: string;
  /* NEW */ LipstickColor: string;
  /* NEW */ LipstickOpacity: string;
}
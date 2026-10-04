import manifestJson from "../../../shared/editorial/media.json";
import type { CaseImage, ImageRole, Locale } from "./schema";

export interface EditorialPhoto {
  caseId: string; assetId: string; assetKind: string; roles: string[]; fileName: string;
  width: number; height: number; sha256: string; reviewState: string;
  isDocumentaryEvidence: boolean; isReconstruction: boolean;
  alt: Record<Locale,string>; caption: Record<Locale,string>; notDepicted?: Record<Locale,string>;
  rights: { sourcePage:string; sourceRevisionPage?:string; title?:string; author:string; credit:string; creditShort?:string; license?:string; licenseUrl?:string; shareAlikeRequired?:boolean; rightsAction?:string };
  derivative?: { modificationNotice:Record<Locale,string>; license:string; licenseUrl:string };
}
const manifest = manifestJson as { assets: EditorialPhoto[] };
const approvedKinds: Record<string,string> = {
  "john-snow-broad-street": "HISTORICAL_DOCUMENT_SCAN",
  "romanov-remains-dna": "HISTORICAL_PHOTOGRAPH",
  "antikythera-mechanism": "ACTUAL_ARTIFACT_PHOTOGRAPH",
  "princes-in-the-tower": "MODERN_LOCATION_PHOTOGRAPH",
  "hubble-tension": "ACTUAL_OBSERVATORY_PHOTOGRAPH",
};
export function editorialPhotoRecord(caseId:string,role:ImageRole="HERO"):EditorialPhoto|undefined {
  return manifest.assets.find(item => item.caseId===caseId && item.assetKind===approvedKinds[caseId] && (item.roles.includes(role) || (role === "HERO" && item.roles.includes("THUMBNAIL")))
    && item.reviewState===(caseId==="romanov-remains-dna"?"SOURCE_RECORD_CHECKED":"RIGHTS_AND_PIXELS_CHECKED"));
}
export function editorialPhoto(caseId:string,role:ImageRole="HERO"):CaseImage|undefined {
  const photo=editorialPhotoRecord(caseId,role);if(!photo)return undefined;
  return {id:photo.assetId,role,path:`/editorial-media/${photo.fileName}`,type:["HISTORICAL_PHOTOGRAPH","HISTORICAL_DOCUMENT_SCAN"].includes(photo.assetKind)?"HISTORICAL_MATERIAL":"EXTERNAL_REVIEWED_PHOTOGRAPH",alt:photo.alt,caption:photo.caption,provenance:{ko:photo.rights.credit,en:photo.rights.credit},reconstruction:false};
}
export const photoRecord = manifest.assets.find(item=>item.caseId==="romanov-remains-dna")!;
export const photoCaption = (locale:Locale) => photoRecord.caption[locale];

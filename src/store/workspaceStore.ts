import {create} from 'zustand';
import type {Side} from '../types/domain';
type ScrollTarget = {side:Side;page:number;rect?:{x:number;y:number;width:number;height:number};nonce:number};
interface WorkspaceState {
 contractId:string;versionId:string;activeDiffId:string|null;
 showDiffs:boolean; showContracts:boolean;syncScroll:boolean; showOnlyDiffs:boolean;scale:number;
 scrollTarget:ScrollTarget|null;
 setContract:(contractId:string,versionId:string)=>void;setVersion:(id:string)=>void;selectDiff:(id:string,targets:Partial<Record<Side,{page:number;rect:{x:number;y:number;width:number;height:number}}>>)=>void;
 setShowDiffs:(v:boolean)=>void;setShowContracts:(v:boolean)=>void;setSyncScroll:(v:boolean)=>void;setShowOnlyDiffs:(v:boolean)=>void;setScale:(v:number)=>void;
}
export const useWorkspaceStore=create<WorkspaceState>((set)=>({
 contractId:'contract-1',versionId:'contract-1-v2',activeDiffId:null,showDiffs:true,showContracts:true,syncScroll:true,showOnlyDiffs:false,scale:1,scrollTarget:null,
 setContract:(contractId,versionId)=>set({contractId,versionId,activeDiffId:null,scrollTarget:null}),
 setVersion:(versionId)=>set({versionId,activeDiffId:null,scrollTarget:null}),
 selectDiff:(id,targets)=>set({activeDiffId:id,scrollTarget:targets.after?{side:'after',...targets.after,nonce:Date.now()+Math.random()}:targets.before?{side:'before',...targets.before,nonce:Date.now()+Math.random()}:null}),
 setShowDiffs:showDiffs=>set({showDiffs}),setShowContracts:showContracts=>set({showContracts}),setSyncScroll:syncScroll=>set({syncScroll}),setShowOnlyDiffs:showOnlyDiffs=>set({showOnlyDiffs}),setScale:scale=>set({scale:Math.min(2,Math.max(.6,Number(scale.toFixed(2))))})
}));

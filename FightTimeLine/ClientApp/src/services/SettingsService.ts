import { Injectable } from "@angular/core"
import { IView, IFilter } from "../core/Models"
import { LocalStorageService } from "./LocalStorageService"

@Injectable()
export class SettingsService {
  private defaults: ISettings = {
    fflogsImport: {
      bossAttacksSource: FFLogsImportBossAttacksSource.Cast,
      sortOrderAfterImport: ["Tank", "Heal", "DD"],
      characterName: "",
      characterRegion: "",
      characterServer: ""
    },
    main: {
      defaultFilter: {
        abilities: {
          damage: true,
          healing: true,
          healingBuff: true,
          partyDamageBuff: true,
          partyDefence: true,
          pet: true,
          selfDamageBuff: true,
          selfDefence: true,
          unused: true,
          utility: true
        },
        attacks: {
          isAoe: true,
          isOther: true,
          isShareDamage: true,
          isTankBuster: true,
          isPhysical: true,
          isMagical: true,
          isUnaspected: true,
          keywords: []
        }
      },
      defaultView: {
        buffmap: false,
        compactView: false,
        highlightLoaded: false,
        ogcdAsPoints: false,
        showAbilityAvailablity: false,
        showDowntimesInPartyArea: false,
        verticalBossAttacks: false,
        colorfulDurations: false
      }
    },
    tableview: {},
    teamwork: {
      displayName: null
    },
    colors: {
      SelfShield: "#ff9900",
      Healing: "#4ac312",
      HealingBuff: "#4ac312",
      PartyDamageBuff: "#b90b47",
      PartyDefense: "#0e4aad",
      PartyShield: "#c6b011",
      SelfDamageBuff: "#e74b81",
      SelfDefense: "#4083f2",
      TargetDefense: "#4083f2",
      Utility:""
    }
  };
  private storageKey = "settings";

  constructor(private storage: LocalStorageService) {}

  public load(): ISettings {
    const cacheString = this.storage.getObject<ISettings>(this.storageKey);
    return { ...this.defaults, ...cacheString } as ISettings;
  }

  public save(settings: ISettings): void {
    this.storage.setObject(this.storageKey, settings);
  }
}

export interface ISettings {
  fflogsImport?: IFFlogsImportSettings;
  main?: IMainSettings;
  teamwork?: ITeamworkSettings;
  tableview?: ITableViewSettings;
  colors?: IColorsSettings;
}

export enum FFLogsImportBossAttacksSource {
  Cast = 'cast',
  Damage = 'damage'
}

export interface IMainSettings {
  defaultView?: IView,
  defaultFilter?: IFilter;
}

export interface ITableViewSettings {

}

export interface IColorsSettings {
  SelfDefense : string;
  PartyDefense : string;
  SelfShield : string;
  PartyShield : string;
  TargetDefense : string;
  SelfDamageBuff : string;
  PartyDamageBuff : string;
  Healing: string;
  Utility: string;
  HealingBuff: string;
}

export interface ITeamworkSettings {
  displayName?: string;
}

export interface IFFlogsImportSettings {
  bossAttacksSource?: FFLogsImportBossAttacksSource;
  sortOrderAfterImport?: string[];
  characterName;
  characterServer;
  characterRegion;
}

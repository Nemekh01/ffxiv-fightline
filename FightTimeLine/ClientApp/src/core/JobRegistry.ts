import { IJob, DamageType, IAbility, IDefenceAbility, IChangeBossTargetAbility, IAbilitySetting, Role, AbilityType, IStance } from "./Models"


interface IAbilities {
  [name: string]: IAbility
}

export class JobRegistry {

  private tankSharedAbilities: IAbilities = {
    Rampart: <IDefenceAbility>{ name: "Rampart", duration: 20, cooldown: 90, xivDbId: "7531", icon: this.getIcon("10_TankRole/7531_Rampart"), damageAffected: DamageType.All, goodForTankBusters: true, abilityType: AbilityType.SelfDefense },
    Reprisal: <IDefenceAbility>{ name: "Reprisal", duration: 5, cooldown: 60, xivDbId: "7535", icon: this.getIcon("10_TankRole/7535_Reprisal"), damageAffected: DamageType.All, abilityType: AbilityType.PartyDefense },
    Convalescence: <IDefenceAbility>{ name: "Convalescence", duration: 20, cooldown: 120, xivDbId: "7532", icon: this.getIcon("10_TankRole/7532_Convalescence"), damageAffected: DamageType.All, abilityType: AbilityType.HealingBuff },
    Awareness: <IDefenceAbility>{ name: "Awareness", duration: 25, cooldown: 120, xivDbId: "7534", icon: this.getIcon("10_TankRole/7534_Awareness"), damageAffected: DamageType.All, abilityType: AbilityType.SelfDefense },
    Anticipation: <IDefenceAbility>{ name: "Anticipation", duration: 20, cooldown: 60, xivDbId: "7536", icon: this.getIcon("10_TankRole/7536_Anticipation"), damageAffected: DamageType.All, abilityType: AbilityType.SelfDefense },
    Provoke: <IChangeBossTargetAbility>{
      name: "Provoke", duration: 0, cooldown: 40, xivDbId: "7533", icon: this.getIcon("10_TankRole/7533_Provoke"), changesBossTarget: true, abilityType: AbilityType.Utility, settings:
        [<IAbilitySetting>{
          name: "changesTarget",
          displayName: "Changes target",
          description: "Determines if ability changes boss target",
          type: "boolean",
          default: true
        }]
    },
    Ultimatum: <IChangeBossTargetAbility>{
      name: "Ultimatum", duration: 0, cooldown: 90, xivDbId: "7539", icon: this.getIcon("10_TankRole/7539_Ultimatum"), changesBossTarget: true, abilityType: AbilityType.Utility, settings:
        [<IAbilitySetting>{
          name: "changesTarget",
          displayName: "Changes target",
          description: "Determines if ability changes boss target",
          type: "boolean",
          default: true
        }]
    },
    Shirk: <IAbility>{ name: "Shirk", duration: 0, cooldown: 120, xivDbId: "7537", icon: this.getIcon("10_TankRole/7537_Shirk"), abilityType: AbilityType.Utility }
  };
  private meleeSharedAbilities: IAbilities = {
    Feint: <IAbility>{ name: "Feint", duration: 10, cooldown: 120, xivDbId: "7549", icon: this.getIcon("30_MeleeDPSRole/7549_Feint"), abilityType: AbilityType.PartyDefense },
  };
  private rangeSharedAbilities: IAbilities = {
    Palisade: <IAbility>{ name: "Palisade", duration: 10, cooldown: 150, xivDbId: "7550", icon: this.getIcon("40_RangeDPSRole/7550_Palisade"), abilityType: AbilityType.PartyDefense },
    Refresh: <IAbility>{ name: "Refresh", duration: 30, cooldown: 150, xivDbId: "7556", icon: this.getIcon("40_RangeDPSRole/7556_Refresh"), abilityType: AbilityType.Utility },
    Tactician: <IAbility>{ name: "Tactician", duration: 30, cooldown: 150, xivDbId: "7555", icon: this.getIcon("40_RangeDPSRole/7555_Tactician"), abilityType: AbilityType.Utility },
  };
  private casterSharedAbilities: IAbilities = {
    Addle: <IAbility>{ name: "Addle", duration: 10, cooldown: 90, xivDbId: "7560", icon: this.getIcon("50_MagicDPSRole/7560_Addle"), abilityType: AbilityType.PartyDefense },
    Apocatastasis: <IAbility>{ name: "Apocatastasis", duration: 10, cooldown: 90, xivDbId: "7563", icon: this.getIcon("50_MagicDPSRole/7563_Apocatastasis"), abilityType: AbilityType.PartyDefense },
    LucidDreaming: <IAbility>{ name: "Lucid Dreaming", duration: 21, cooldown: 120, xivDbId: "7562", icon: this.getIcon("90_Others/7562_Lucid Dreaming"), abilityType: AbilityType.Utility },
    Swiftcast: <IAbility>{ name: "Swiftcast", duration: 0, cooldown: 60, icon: this.getIcon("90_Others/7561_Swiftcast"), xivDbId: "7561", abilityType: AbilityType.Utility },
    Surecast: <IAbility>{ name: "Surecast", duration: 5, cooldown: 30, xivDbId: "7559", icon: this.getIcon("90_Others/7559_Surecast"), abilityType: AbilityType.Utility },
    ManaShift: <IAbility>{ name: "Mana Shift", duration: 0, cooldown: 120, xivDbId: "7565", icon: this.getIcon("50_MagicDPSRole/7565_Mana Shift"), abilityType: AbilityType.Utility },
  };
  private healerSharedAbilities: IAbilities = {
    ClericStance: <IAbility>{ name: "Cleric Stance", duration: 15, cooldown: 90, xivDbId: "7567", icon: this.getIcon("20_HealerRole/7567_Cleric Stance"), abilityType: AbilityType.SelfDamageBuff },
    Largesse: <IAbility>{ name: "Largesse", duration: 20, cooldown: 90, xivDbId: "7570", icon: this.getIcon("20_HealerRole/7570_Largesse"), abilityType: AbilityType.HealingBuff },
    EyeforanEye: <IAbility>{ name: "Eye for an Eye", duration: 20, cooldown: 180, xivDbId: "7569", icon: this.getIcon("20_HealerRole/7569_Eye For An Eye"), abilityType: AbilityType.PartyDefense },
    LucidDreaming: <IAbility>{ name: "Lucid Dreaming", duration: 21, cooldown: 120, xivDbId: "7562", icon: this.getIcon("90_Others/7562_Lucid Dreaming"), abilityType: AbilityType.Utility },
    Swiftcast: <IAbility>{ name: "Swiftcast", duration: 0, cooldown: 60, icon: this.getIcon("90_Others/7561_Swiftcast"), xivDbId: "7561", abilityType: AbilityType.Utility },
    Surecast: <IAbility>{ name: "Surecast", duration: 5, cooldown: 30, xivDbId: "7559", icon: this.getIcon("90_Others/7559_Surecast"), abilityType: AbilityType.Utility },
  };

  private medicine: IAbilities = {
    Mind: <IAbility>{ name: "Medicine", detectByBuff:"1000049", duration: 30, cooldown: 270, xivDbId: "22451", icon: this.getIcon("Medicine/22451_Mind", ".jpg"), abilityType: AbilityType.SelfDamageBuff, nameToMatch: "Medicated", xivDbType: "item" },
    Intelligence: <IAbility>{ name: "Medicine", detectByBuff: "1000049", duration: 40, cooldown: 270, xivDbId: "22450", icon: this.getIcon("Medicine/22450_Intelligence", ".jpg"), abilityType: AbilityType.SelfDamageBuff, nameToMatch: "Medicated", xivDbType: "item" },
    Dexterity: <IAbility>{ name: "Medicine", detectByBuff: "1000049", duration: 40, cooldown: 270, xivDbId: "22448", icon: this.getIcon("Medicine/22448_Dexterity", ".jpg"), abilityType: AbilityType.SelfDamageBuff, nameToMatch: "Medicated", xivDbType: "item" },
    Strength: <IAbility>{ name: "Medicine", detectByBuff: "1000049", duration: 40, cooldown: 270, xivDbId: "22447", icon: this.getIcon("Medicine/22447_Strength", ".jpg"), abilityType: AbilityType.SelfDamageBuff, nameToMatch: "Medicated", xivDbType: "item" },

  };
  private jobs = new Array<IJob>(
    {
      name: "DRK", role: Role.Tank, canBeTargetForBoss: true, icon: this.getIcon("JobIcons/Dark_Knight_Icon_10"), abilities: [
        <IAbility>{ name: "Blood Weapon", duration: 15, cooldown: 40, xivDbId: "3625", icon: this.getIcon("13_DarkKnight/3625_Blood Weapon"), abilityType: AbilityType.SelfDamageBuff },
        <IAbility>{ name: "Dark Passenger", duration: 0, cooldown: 60, xivDbId: "3633", icon: this.getIcon("13_DarkKnight/3633_Dark Passenger"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Salted Earth", duration: 21, cooldown: 45, xivDbId: "3639", icon: this.getIcon("13_DarkKnight/3639_Salted Earth"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Plunge", duration: 0, cooldown: 30, xivDbId: "3640", icon: this.getIcon("13_DarkKnight/3640_Plunge"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Carve and Spit", duration: 0, cooldown: 60, xivDbId: "3643", icon: this.getIcon("13_DarkKnight/3643_Carve And Spit"), abilityType: AbilityType.Damage },

        <IDefenceAbility>{ name: "Shadow Wall", duration: 10, cooldown: 120, xivDbId: "3636", icon: this.getIcon("13_DarkKnight/3636_Shadow Wall"), damageAffected: DamageType.All, goodForTankBusters: true, abilityType: AbilityType.SelfDefense },
        <IDefenceAbility>{ name: "Dark Mind", duration: 10, cooldown: 60, xivDbId: "3634", icon: this.getIcon("13_DarkKnight/3634_Dark Mind"), damageAffected: DamageType.Magical, goodForTankBusters: true, abilityType: AbilityType.SelfDefense },
        <IDefenceAbility>{ name: "Living Dead", duration: 10, cooldown: 300, xivDbId: "3638", icon: this.getIcon("13_DarkKnight/3638_Living Dead"), damageAffected: DamageType.All, extendDurationOnNextAbility: 10, isUltimateSave: true, abilityType: AbilityType.SelfDefense },
        <IDefenceAbility>{ name: "The Blackest Night", duration: 7, cooldown: 15, xivDbId: "7393", icon: this.getIcon("13_DarkKnight/7393_The Blackest Night"), damageAffected: DamageType.All, goodForTankBusters: false, abilityType: AbilityType.SelfDefense },

        <IAbility>{ name: "Delirium", duration: 0, cooldown: 80, xivDbId: "7390", icon: this.getIcon("13_DarkKnight/7390_Delirium"), abilityType: AbilityType.Utility },
        <IAbility>{ name: "Sole Survivor", duration: 15, cooldown: 120, xivDbId: "8778", icon: this.getIcon("13_DarkKnight/8778_Sole Survivor"), abilityType: AbilityType.Utility },
        ...this.getAbilitiesFrom(this.tankSharedAbilities),
        this.medicine["Strength"]
      ].sort(this.abilitySortFn),
      stances: [
        {
          ability: { name: "Grit", duration: 0, cooldown: 10, icon: this.getIcon("13_DarkKnight/3629_Grit"), abilityType: AbilityType.Utility, xivDbId: "1000743" },
        }
      ]
    },
    {
      name: "WAR", role: Role.Tank, canBeTargetForBoss: true, icon: this.getIcon("JobIcons/Warrior_Icon_10"), abilities: [
        <IAbility>{ name: "Unchained", duration: 20, cooldown: 90, xivDbId: "50", icon: this.getIcon("12_Warrior/0050_Unchained"), abilityType: AbilityType.SelfDamageBuff },
        <IAbility>{ name: "Infuriate", duration: 0, cooldown: 60, xivDbId: "52", icon: this.getIcon("12_Warrior/0052_Infuriate"), abilityType: AbilityType.Utility },
        <IAbility>{ name: "Inner Release", duration: 10, cooldown: 90, xivDbId: "7389", icon: this.getIcon("12_Warrior/7389_Inner Release"), abilityType: AbilityType.SelfDamageBuff },

        <IAbility>{ name: "Onslaught", duration: 0, cooldown: 15, xivDbId: "7386", icon: this.getIcon("12_Warrior/7386_Onslaught"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Upheaval", duration: 0, cooldown: 30, xivDbId: "7387", icon: this.getIcon("12_Warrior/7387_Upheaval"), abilityType: AbilityType.Damage },

        <IDefenceAbility>{ name: "Vengeance", duration: 15, cooldown: 120, xivDbId: "44", icon: this.getIcon("12_Warrior/0044_Vengeance"), damageAffected: DamageType.All, goodForTankBusters: true, relatedAbilities: { affectedBy: ["Shake It Off"], parentOnly: true }, abilityType: AbilityType.SelfDefense },
        <IDefenceAbility>{ name: "Holmgang", duration: 6, cooldown: 180, xivDbId: "43", icon: this.getIcon("12_Warrior/0043_Holmgang"), damageAffected: DamageType.All, isUltimateSave: true, abilityType: AbilityType.SelfDefense },
        <IDefenceAbility>{
          name: "Shake It Off", duration: 15, cooldown: 90, xivDbId: "7388", icon: this.getIcon("12_Warrior/7388_Shake It Off"), damageAffected: DamageType.All, abilityType: AbilityType.PartyDefense, relatedAbilities:
          {
            affects: ["Thrill of Battle", "Vengence", "Raw Intuition"],
            parentOnly: true
          }
        },
        <IDefenceAbility>{ name: "Thrill of Battle", duration: 20, cooldown: 120, xivDbId: "40", icon: this.getIcon("12_Warrior/0040_Thrill Of Battle"), damageAffected: DamageType.None, abilityType: AbilityType.SelfDefense, relatedAbilities: { affectedBy: ["Shake It Off"], parentOnly: true } },
        <IDefenceAbility>{ name: "Raw Intuition", duration: 20, cooldown: 90, xivDbId: "3551", icon: this.getIcon("12_Warrior/3551_Raw Intuition"), damageAffected: DamageType.All, abilityType: AbilityType.SelfDefense, relatedAbilities: { affectedBy: ["Shake It Off"], parentOnly: true } },
        <IAbility>{ name: "Equilibrium", duration: 0, cooldown: 60, xivDbId: "3552", icon: this.getIcon("12_Warrior/3552_Equilibrium"), abilityType: AbilityType.Utility },
        ...this.getAbilitiesFrom(this.tankSharedAbilities),
        this.medicine["Strength"]
      ].sort(this.abilitySortFn),
      stances: [
        {
          ability: { name: "Defiance", duration: 0, cooldown: 10, icon: this.getIcon("12_Warrior/0048_Defiance"), abilityType: AbilityType.Utility, xivDbId: "1000091" },
        },
        {
          ability: { name: "Deliverance", duration: 0, cooldown: 10, icon: this.getIcon("12_Warrior/3548_Deliverance"), abilityType: AbilityType.Utility, xivDbId: "1000729" },
        }
      ]
    },
    {
      name: "PLD", role: Role.Tank, canBeTargetForBoss: true, icon: this.getIcon("JobIcons/Paladin_Icon_10"), abilities: [
        <IAbility>{ name: "Tempered Will", duration: 10, cooldown: 180, xivDbId: "19", icon: this.getIcon("11_Paladin/0019_Tempered Will"), abilityType: AbilityType.Utility },
        <IAbility>{ name: "Fight or Flight", duration: 25, cooldown: 60, xivDbId: "20", icon: this.getIcon("11_Paladin/0020_Fight Or Flight"), abilityType: AbilityType.SelfDamageBuff },
        <IAbility>{ name: "Circle of Scorn", duration: 15, cooldown: 25, xivDbId: "23", icon: this.getIcon("11_Paladin/0023_Circle Of Scorn"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Spirits Within", duration: 0, cooldown: 30, xivDbId: "29", icon: this.getIcon("11_Paladin/0029_Spirits Within"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Shield Swipe", duration: 0, cooldown: 15, xivDbId: "25", icon: this.getIcon("11_Paladin/0025_Shield Swipe"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Requiescat", duration: 12, cooldown: 60, xivDbId: "7383", icon: this.getIcon("11_Paladin/7383_Requiescat"), abilityType: AbilityType.SelfDamageBuff | AbilityType.Damage },
        <IDefenceAbility>{ name: "Sentinel", duration: 10, cooldown: 180, xivDbId: "17", icon: this.getIcon("11_Paladin/0017_Sentinel"), damageAffected: DamageType.All, goodForTankBusters: true, abilityType: AbilityType.SelfDefense },
        <IDefenceAbility>{ name: "Hallowed Ground", duration: 10, cooldown: 420, xivDbId: "30", icon: this.getIcon("11_Paladin/0030_Hallowed Ground"), damageAffected: DamageType.All, isUltimateSave: true, abilityType: AbilityType.SelfDefense },
        <IDefenceAbility>{ name: "Divine Veil", duration: 30, cooldown: 120, xivDbId: "3540", icon: this.getIcon("11_Paladin/3540_Divine Veil"), damageAffected: DamageType.All, abilityType: AbilityType.PartyDefense },
        <IDefenceAbility>{ name: "Passage Of Arms", duration: 18, cooldown: 120, xivDbId: "7385", icon: this.getIcon("11_Paladin/7385_Passage Of Arms"), damageAffected: DamageType.All, abilityType: AbilityType.PartyDefense },
        <IDefenceAbility>{ name: "Bulwark", duration: 15, cooldown: 180, xivDbId: "22", icon: this.getIcon("11_Paladin/0022_Bulwark"), damageAffected: DamageType.All, abilityType: AbilityType.SelfDefense },
        <IDefenceAbility>{ name: "Cover", duration: 12, cooldown: 120, xivDbId: "27", icon: this.getIcon("11_Paladin/0027_Cover"), damageAffected: DamageType.All, goodForTankBusters: true, abilityType: AbilityType.PartyDefense },
        <IDefenceAbility>{ name: "Sheltron", duration: 10, cooldown: 10, xivDbId: "3542", icon: this.getIcon("11_Paladin/3542_Sheltron"), damageAffected: DamageType.All, goodForTankBusters: true, abilityType: AbilityType.SelfDefense },
        <IDefenceAbility>{ name: "Intervention", duration: 6, cooldown: 10, xivDbId: "7382", icon: this.getIcon("11_Paladin/7382_Intervention"), damageAffected: DamageType.All, goodForTankBusters: true, abilityType: AbilityType.PartyDefense },
        ...this.getAbilitiesFrom(this.tankSharedAbilities),
        this.medicine["Strength"]
      ].sort(this.abilitySortFn),
      stances: [
        {
          ability: { name: "Sword Oath", duration: 0, cooldown: 10, icon: this.getIcon("11_Paladin/0026_Sword Oath"), abilityType: AbilityType.Utility, xivDbId:"1000381" },
        },
        {
          ability: { name: "Shield Oath", duration: 0, cooldown: 10, icon: this.getIcon("11_Paladin/0028_Shield Oath"), abilityType: AbilityType.Utility, xivDbId: "1000079" },
        }
      ]
    },
    {
      name: "WHM", role: Role.Healer, canBeTargetForBoss: false, icon: this.getIcon("JobIcons/White_Mage_Icon_10"), abilities: [
        <IAbility>{ name: "Assize", duration: 0, cooldown: 45, xivDbId: "3571", icon: this.getIcon("21_WhiteMage/9620_Assize"), abilityType: AbilityType.Healing },
        <IAbility>{ name: "Tetragrammaton", duration: 0, cooldown: 60, xivDbId: "3570", icon: this.getIcon("21_WhiteMage/3570_Tetragrammaton"), abilityType: AbilityType.Healing },
        <IAbility>{ name: "Divine Benison", duration: 0, cooldown: 30, xivDbId: "9621", icon: this.getIcon("21_WhiteMage/9621_Divine Benison"), abilityType: AbilityType.Healing },
        <IAbility>{ name: "Benediction", duration: 0, cooldown: 180, xivDbId: "140", icon: this.getIcon("21_WhiteMage/0140_Benediction"), abilityType: AbilityType.Healing },
        <IAbility>{ name: "Asylum", duration: 24, cooldown: 90, xivDbId: "3569", icon: this.getIcon("21_WhiteMage/3569_Asylum"), abilityType: AbilityType.Healing },

        <IAbility>{ name: "Thin Air", duration: 12, cooldown: 120, xivDbId: "7430", icon: this.getIcon("21_WhiteMage/7430_Thin Air"), abilityType: AbilityType.Utility },
        <IAbility>{ name: "Presence of Mind", duration: 15, cooldown: 150, xivDbId: "136", icon: this.getIcon("21_WhiteMage/0136_Presence Of Mind"), abilityType: AbilityType.Utility },
        ...this.getAbilitiesFrom(this.healerSharedAbilities),
        this.medicine["Mind"]
      ].sort(this.abilitySortFn)
    },
    {
      name: "SCH", role: Role.Healer, canHavePet: true, pets: [{ name: "Selene", icon: this.getIcon("62_PetsFairy/0806_Embrace") }, { name: "Eos", icon: this.getIcon("62_PetsFairy/0802_Embrace") }], defaultPet: "Selene", canBeTargetForBoss: false, icon: this.getIcon("JobIcons/Scholar_Icon_10"), abilities: [
        <IAbility>{ name: "Chain Stratagem", duration: 15, cooldown: 120, xivDbId: "7436", icon: this.getIcon("62_PetsFairy/7436_Chain Stratagem"), abilityType: AbilityType.PartyDamageBuff },
        <IAbility>{ name: "Shadow Flare", duration: 15, cooldown: 60, xivDbId: "179", icon: this.getIcon("52_Summoner/0179_Shadow Flare"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Rouse", duration: 20, cooldown: 60, xivDbId: "176", icon: this.getIcon("52_Summoner/0176_Rouse"), abilityType: AbilityType.SelfDamageBuff | AbilityType.HealingBuff },
        <IAbility>{ name: "Sacred Soil", duration: 15, cooldown: 30, xivDbId: "188", icon: this.getIcon("62_PetsFairy/0188_Sacred Soil"), abilityType: AbilityType.SelfDefense | AbilityType.PartyDefense },

        <IAbility>{ name: "Indomitability", duration: 0, cooldown: 30, xivDbId: "3583", icon: this.getIcon("62_PetsFairy/3583_Indomitability"), abilityType: AbilityType.Healing },
        <IAbility>{ name: "Dissipation", duration: 30, cooldown: 180, xivDbId: "3587", icon: this.getIcon("62_PetsFairy/3587_Dissipation"), abilityType: AbilityType.Healing },
        <IAbility>{ name: "Excogitation", duration: 0, cooldown: 45, xivDbId: "7434", icon: this.getIcon("62_PetsFairy/7434_Excogitation"), abilityType: AbilityType.Healing },
        <IAbility>{ name: "Lustrate", duration: 0, cooldown: 1, xivDbId: "0189", icon: this.getIcon("62_PetsFairy/0189_Lustrate"), abilityType: AbilityType.Healing },

        <IAbility>{ name: "Aetherflow", duration: 0, cooldown: 60, icon: this.getIcon("62_PetsFairy/8908_Aetherflow"), xivDbId: "166", abilityType: AbilityType.Utility },
        <IAbility>{ name: "Deployment Tactics", duration: 0, cooldown: 120, xivDbId: "3585", icon: this.getIcon("62_PetsFairy/3585_Deployment Tactics"), abilityType: AbilityType.Utility },

        <IAbility>{ name: "Whispering Dawn", duration: 21, cooldown: 60, xivDbId: "803", icon: this.getIcon("62_PetsFairy/0803_Whispering Dawn"), pet: "Eos", abilityType: AbilityType.Pet },
        <IAbility>{ name: "Fey Covenant", duration: 20, cooldown: 120, xivDbId: "804", icon: this.getIcon("62_PetsFairy/0804_Fey Covenant"), pet: "Eos", abilityType: AbilityType.Pet },
        <IAbility>{ name: "Fey Illumination", duration: 20, cooldown: 120, xivDbId: "805", icon: this.getIcon("62_PetsFairy/0805_Fey Illumination"), pet: "Eos", abilityType: AbilityType.Pet },

        <IAbility>{ name: "Silent Dusk", duration: 0, cooldown: 40, xivDbId: "807", icon: this.getIcon("62_PetsFairy/0807_Silent Dusk"), pet: "Selene", abilityType: AbilityType.Pet },
        <IAbility>{ name: "Fey Caress", duration: 0, cooldown: 60, xivDbId: "810", icon: this.getIcon("62_PetsFairy/0810_Fey Caress"), pet: "Selene", abilityType: AbilityType.Pet },
        <IAbility>{ name: "Fey Wind", duration: 30, cooldown: 60, xivDbId: "811", icon: this.getIcon("62_PetsFairy/0811_Fey Wind"), pet: "Selene", abilityType: AbilityType.Pet },

        ...this.getAbilitiesFrom(this.healerSharedAbilities),
        this.medicine["Mind"]
      ].sort(this.abilitySortFn)
    },
    {
      name: "AST", role: Role.Healer, canBeTargetForBoss: false, icon: this.getIcon("JobIcons/Astrologian_Icon_10"), abilities: [
        <IAbility>{ name: "Lightspeed", duration: 10, cooldown: 120, xivDbId: "3606", icon: this.getIcon("23_Astrologian/3606_Lightspeed"), abilityType: AbilityType.Utility },
        <IAbility>{ name: "Synastry", duration: 20, cooldown: 90, xivDbId: "3612", icon: this.getIcon("23_Astrologian/3612_Synastry"), abilityType: AbilityType.Healing },
        <IAbility>{ name: "Time Dilation", duration: 0, cooldown: 90, xivDbId: "3611", icon: this.getIcon("23_Astrologian/3611_Time Dilation"), abilityType: AbilityType.Healing },
        <IAbility>{ name: "Earthly Star", duration: 20, cooldown: 60, xivDbId: "7439", icon: this.getIcon("23_Astrologian/7439_Earthly Star"), abilityType: AbilityType.Healing },
        <IAbility>{ name: "Essential Dignity", duration: 0, cooldown: 40, xivDbId: "3614", icon: this.getIcon("23_Astrologian/3614_Essential Dignity"), abilityType: AbilityType.Healing },

        <IAbility>{ name: "Celestial Opposition", duration: 0, cooldown: 120, xivDbId: "3616", icon: this.getIcon("23_Astrologian/3616_Celestial Opposition"), abilityType: AbilityType.Utility },
        <IAbility>{ name: "Sleeve Draw", duration: 0, cooldown: 120, xivDbId: "7448", icon: this.getIcon("23_Astrologian/7448_Sleeve Draw"), abilityType: AbilityType.Utility },
        <IAbility>{ name: "Collective Unconscious", duration: 18, cooldown: 90, xivDbId: "3613", icon: this.getIcon("23_Astrologian/3613_Collective Unconscious"), abilityType: AbilityType.Utility },
        ...this.getAbilitiesFrom(this.healerSharedAbilities),
        this.medicine["Mind"]
      ].sort(this.abilitySortFn)
    },
    {
      name: "DRG", role: Role.Healer, canBeTargetForBoss: false, icon: this.getIcon("JobIcons/Dragoon_Icon_10"), abilities: [
        <IAbility>{ name: "Blood for Blood", duration: 20, cooldown: 80, xivDbId: "85", icon: this.getIcon("32_Dragoon/0085_Blood For Blood"), abilityType: AbilityType.SelfDamageBuff },
        <IAbility>{ name: "Life Surge", duration: 10, cooldown: 50, xivDbId: "83", icon: this.getIcon("32_Dragoon/0083_Life Surge"), abilityType: AbilityType.SelfDamageBuff },
        <IAbility>{
          name: "Dragon Sight", detectByBuff:"1001454", duration: 20, cooldown: 120, xivDbId: "10032", icon: this.getIcon("32_Dragoon/10032_Dragon Sight"), abilityType: AbilityType.PartyDamageBuff | AbilityType.SelfDamageBuff, settings: [
            <IAbilitySetting>{
                name: "target",
                displayName: "Target",
                description: "Determines target of ability",
                type: "partyMember",
                default: true
              }
            ]
        },
        <IAbility>{ name: "Battle Litany", duration: 20, cooldown: 180, xivDbId: "3557", icon: this.getIcon("32_Dragoon/3557_Battle Litany"), abilityType: AbilityType.PartyDamageBuff },
        <IAbility>{ name: "Dragonfire Dive", duration: 0, cooldown: 120, xivDbId: "96", icon: this.getIcon("32_Dragoon/0096_Dragonfire Dive"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Geirskogul", duration: 0, cooldown: 30, xivDbId: "3555", icon: this.getIcon("32_Dragoon/3555_Geirskogul"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Jump", duration: 0, cooldown: 30, xivDbId: "0092", icon: this.getIcon("32_Dragoon/0092_Jump"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Spineshatter Dive", duration: 0, cooldown: 30, xivDbId: "8802", icon: this.getIcon("32_Dragoon/8802_Spineshatter Dive"), abilityType: AbilityType.Damage },
        ...this.getAbilitiesFrom(this.meleeSharedAbilities),
        this.medicine["Strength"]
      ].sort(this.abilitySortFn)
    },
    {
      name: "NIN", role: Role.Melee, canBeTargetForBoss: false, icon: this.getIcon("JobIcons/Ninja_Icon_10"), abilities: [
        <IAbility>{ name: "Trick Attack", duration: 10, cooldown: 60, xivDbId: "2258", icon: this.getIcon("33_Ninja/2258_Trick Attack"), abilityType: AbilityType.PartyDamageBuff },
        <IAbility>{ name: "Ten Chi Jin", duration: 10, cooldown: 100, xivDbId: "7403", icon: this.getIcon("33_Ninja/7403_Ten Chi Jin"), abilityType: AbilityType.SelfDamageBuff },
        <IAbility>{ name: "Duality", duration: 10, cooldown: 90, xivDbId: "3567", icon: this.getIcon("33_Ninja/3567_Duality"), abilityType: AbilityType.SelfDamageBuff },

        <IAbility>{ name: "Mug", duration: 0, cooldown: 90, xivDbId: "2248", icon: this.getIcon("33_Ninja/8813_Mug"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Jugulate", duration: 0, cooldown: 30, xivDbId: "2256", icon: this.getIcon("33_Ninja/2256_Jugulate"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Dream Within a Dream", duration: 0, cooldown: 60, xivDbId: "3566", icon: this.getIcon("33_Ninja/3566_Dream Within A Dream"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Bhavacakra", duration: 0, cooldown: 50, xivDbId: "7402", icon: this.getIcon("33_Ninja/8815_Bhavacakra"), abilityType: AbilityType.Damage },

        <IAbility>{ name: "Shadewalker", duration: 15, cooldown: 120, xivDbId: "3564", icon: this.getIcon("33_Ninja/3564_Shadewalker"), abilityType: AbilityType.Utility },
        <IAbility>{ name: "Smoke Screen", duration: 20, cooldown: 180, xivDbId: "3565", icon: this.getIcon("33_Ninja/3565_Smoke Screen"), abilityType: AbilityType.Utility },

        ...this.getAbilitiesFrom(this.meleeSharedAbilities),
        this.medicine["Dexterity"]
      ].sort(this.abilitySortFn)
    },
    {
      name: "MNK", role: Role.Melee, canBeTargetForBoss: false, icon: this.getIcon("JobIcons/Monk_Icon_10"), abilities: [
        <IAbility>{ name: "Elixir Field", duration: 0, cooldown: 30, xivDbId: "3545", icon: this.getIcon("31_Monk/3545_Elixir Field"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Howling Fist", duration: 0, cooldown: 60, xivDbId: "67", icon: this.getIcon("31_Monk/0067_Howling Fist"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Steel Peak", duration: 0, cooldown: 40, xivDbId: "64", icon: this.getIcon("31_Monk/0064_Steel Peak"), abilityType: AbilityType.Damage },

        <IAbility>{ name: "Internal Release", duration: 15, cooldown: 60, xivDbId: "59", icon: this.getIcon("31_Monk/0059_Internal Release"), abilityType: AbilityType.SelfDamageBuff },
        <IAbility>{ name: "Perfect Balance", duration: 10, cooldown: 60, xivDbId: "69", icon: this.getIcon("31_Monk/0069_Perfect Balance"), abilityType: AbilityType.SelfDamageBuff },
        <IAbility>{ name: "Brotherhood", duration: 15, cooldown: 90, xivDbId: "7396", icon: this.getIcon("31_Monk/7396_Brotherhood"), abilityType: AbilityType.PartyDamageBuff },
        <IAbility>{ name: "Mantra", duration: 15, cooldown: 90, xivDbId: "65", icon: this.getIcon("31_Monk/0065_Mantra"), abilityType: AbilityType.HealingBuff },
        ...this.getAbilitiesFrom(this.meleeSharedAbilities),
        this.medicine["Strength"]
      ].sort(this.abilitySortFn)
    },
    {
      name: "SAM", role: Role.Melee, canBeTargetForBoss: false, icon: this.getIcon("JobIcons/Samurai_Icon_10"), abilities: [
        <IAbility>{ name: "Meditate", duration: 15, cooldown: 60, xivDbId: "7497", icon: this.getIcon("34_Samurai/7497_Meditate"), abilityType: AbilityType.Utility },
        ...this.getAbilitiesFrom(this.meleeSharedAbilities),
        this.medicine["Strength"]
      ].sort(this.abilitySortFn)
    },
    {
      name: "BRD", role: Role.Range, canBeTargetForBoss: false, icon: this.getIcon("JobIcons/Bard_Icon_10"), abilities: [
        <IAbility>{ name: "Barrage", duration: 10, cooldown: 80, xivDbId: "107", icon: this.getIcon("41_Bard/0107_Barrage"), abilityType: AbilityType.SelfDamageBuff },
        <IAbility>{ name: "Raging Strikes", duration: 20, cooldown: 80, xivDbId: "101", icon: this.getIcon("41_Bard/0101_Raging Strikes"), abilityType: AbilityType.SelfDamageBuff },
        <IAbility>{ name: "Battle Voice", duration: 20, cooldown: 180, xivDbId: "118", icon: this.getIcon("41_Bard/0118_Battle Voice"), abilityType: AbilityType.PartyDamageBuff },
        <IAbility>{ name: "Troubadour", duration: 30, cooldown: 180, xivDbId: "7405", icon: this.getIcon("41_Bard/7405_Troubadour"), abilityType: AbilityType.PartyDefense },
        <IAbility>{ name: "Nature's Minne", duration: 15, cooldown: 45, xivDbId: "7408", icon: this.getIcon("41_Bard/7408_Natures Minne"), abilityType: AbilityType.HealingBuff },
        <IAbility>{
          name: "Mage's Ballad", duration: 30, cooldown: 80, xivDbId: "114", icon: this.getIcon("41_Bard/0114_Mages Ballad"), abilityType: AbilityType.PartyDamageBuff | AbilityType.Damage, relatedAbilities:
          {
            affects: ["Army's Paeon", "The Wanderer's Minuet"],
            affectedBy: ["Army's Paeon", "The Wanderer's Minuet"],
            parentOnly: true
          }
        },
        <IAbility>{
          name: "Army's Paeon", duration: 30, cooldown: 80, xivDbId: "116", icon: this.getIcon("41_Bard/8844_Armys Paeon"), abilityType: AbilityType.PartyDamageBuff | AbilityType.Damage, relatedAbilities:
          {
            affects: ["Mage's Ballad", "The Wanderer's Minuet"],
            affectedBy: ["Mage's Ballad", "The Wanderer's Minuet"],
            parentOnly: true
          }
        },
        <IAbility>{
          name: "The Wanderer's Minuet", duration: 30, cooldown: 80, xivDbId: "3559", icon: this.getIcon("41_Bard/8843_The Wanderers Minuet"), abilityType: AbilityType.PartyDamageBuff | AbilityType.Damage, relatedAbilities:
          {
            affects: ["Mage's Ballad", "Army's Paeon"],
            affectedBy: ["Mage's Ballad", "Army's Paeon"],
            parentOnly: true
          }
        },
        <IAbility>{ name: "Sidewinder", duration: 0, cooldown: 60, xivDbId: "3562", icon: this.getIcon("41_Bard/8841_Sidewinder"), abilityType: AbilityType.Damage },
        ...this.getAbilitiesFrom(this.rangeSharedAbilities),
        this.medicine["Dexterity"]
      ].sort(this.abilitySortFn)
    },
    {
      name: "MCH", role: Role.Range, canBeTargetForBoss: false, icon: this.getIcon("JobIcons/Machinist_Icon_10"), abilities: [
        <IAbility>{ name: "Wildfire", duration: 10, cooldown: 60, xivDbId: "2878", icon: this.getIcon("42_Machinist/2878_Wildfire"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Gauss Round", duration: 0, cooldown: 15, xivDbId: "2874", icon: this.getIcon("42_Machinist/2874_Gauss Round"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Ricochet", duration: 0, cooldown: 60, xivDbId: "2890", icon: this.getIcon("42_Machinist/2890_Ricochet"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Rook Overdrive", duration: 0, cooldown: 120, xivDbId: "7415", icon: this.getIcon("42_Machinist/7415_Rook Overdrive"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Flamethrower", duration: 10, cooldown: 60, xivDbId: "7418", icon: this.getIcon("42_Machinist/7418_Flamethrower"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Reassemble", duration: 20, cooldown: 60, xivDbId: "2876", icon: this.getIcon("42_Machinist/2876_Reassemble"), abilityType: AbilityType.SelfDamageBuff },
        <IAbility>{ name: "Hypercharge", duration: 28, cooldown: 120, xivDbId: "2885", icon: this.getIcon("42_Machinist/2885_Hypercharge"), abilityType: AbilityType.PartyDamageBuff },
        <IAbility>{ name: "Dismantle", duration: 5, cooldown: 60, xivDbId: "2887", icon: this.getIcon("42_Machinist/2887_Dismantle"), abilityType: AbilityType.PartyDefense },
        <IAbility>{ name: "Reload", duration: 0, cooldown: 30, xivDbId: "2867", icon: this.getIcon("42_Machinist/2867_Reload"), abilityType: AbilityType.Utility },
        <IAbility>{ name: "Quick Reload", duration: 0, cooldown: 15, xivDbId: "2879", icon: this.getIcon("42_Machinist/2879_Quick Reload"), abilityType: AbilityType.Utility },
        <IAbility>{ name: "Barrel Stabilizer", duration: 0, cooldown: 60, xivDbId: "7414", icon: this.getIcon("42_Machinist/7414_Barrel Stabilizer"), abilityType: AbilityType.Utility },
        ...this.getAbilitiesFrom(this.rangeSharedAbilities),
        this.medicine["Dexterity"]
      ].sort(this.abilitySortFn)
    },
    {
      name: "RDM", role: Role.Caster, canBeTargetForBoss: false, icon: this.getIcon("JobIcons/Red_Mage_Icon_10"), abilities: [
        <IAbility>{ name: "Embolden", duration: 20, cooldown: 120, xivDbId: "7520", icon: this.getIcon("53_RedMage/7520_Embolden"), abilityType: AbilityType.PartyDamageBuff },
        <IAbility>{ name: "Fleche", duration: 0, cooldown: 25, xivDbId: "7517", icon: this.getIcon("53_RedMage/7517_Fleche"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Contre Sixte", duration: 0, cooldown: 45, xivDbId: "7519", icon: this.getIcon("53_RedMage/7519_Contre Sixte"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Manafication", duration: 0, cooldown: 120, xivDbId: "7521", icon: this.getIcon("53_RedMage/7521_Manafication"), abilityType: AbilityType.Damage },
        ...this.getAbilitiesFrom(this.casterSharedAbilities),
        this.medicine["Intelligence"]
      ]
    },
    {
      name: "SMN", role: Role.Caster, canHavePet: true, pets: [
        {
          name: "Garuda-Egi", icon: this.getIcon("61_PetsEgi/0792_Wind Blade")
        },
        {
          name: "Ifrit-Egi", icon: this.getIcon("61_PetsEgi/0798_Burning Strike")
        },
        {
          name: "Titan-Egi", icon: this.getIcon("61_PetsEgi/0787_Rock Buster")
        }], defaultPet: "Ifrit-Egi", canBeTargetForBoss: false, icon: this.getIcon("JobIcons/Summoner_Icon_10"), abilities: [
        <IAbility>{ name: "Rouse", duration: 20, cooldown: 60, xivDbId: "176", icon: this.getIcon("52_Summoner/0176_Rouse"), abilityType: AbilityType.SelfDamageBuff },
        <IAbility>{ name: "Shadow Flare", duration: 15, cooldown: 60, xivDbId: "179", icon: this.getIcon("52_Summoner/0179_Shadow Flare"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Enkindle", duration: 0, cooldown: 180, xivDbId: "184", icon: this.getIcon("61_PetsEgi/0184_Enkindle"), abilityType: AbilityType.Damage },
        <IAbility>{ name: "Aetherpact", duration: 15, cooldown: 120, xivDbId: "7423", icon: this.getIcon("61_PetsEgi/7423_Aetherpact"), abilityType: AbilityType.PartyDamageBuff },

        <IAbility>{ name: "Shockwave", duration: 0, cooldown: 90, xivDbId: "793", icon: this.getIcon("61_PetsEgi/0793_Shockwave"), pet: "Garuda-Egi", abilityType: AbilityType.Pet },
        <IAbility>{ name: "Aerial Slash", duration: 0, cooldown: 30, xivDbId: "794", icon: this.getIcon("61_PetsEgi/0794_Aerial Slash"), pet: "Garuda-Egi", abilityType: AbilityType.Pet },
        <IAbility>{ name: "Contagion", duration: 15, cooldown: 60, xivDbId: "795", icon: this.getIcon("61_PetsEgi/0795_Contagion"), pet: "Garuda-Egi", abilityType: AbilityType.Pet },

        <IAbility>{ name: "Crimson Cyclone", duration: 0, cooldown: 40, xivDbId: "797", icon: this.getIcon("61_PetsEgi/0797_Crimson Cyclone"), pet: "Ifrit-Egi", abilityType: AbilityType.Pet },
        <IAbility>{ name: "Radiant Shield", duration: 20, cooldown: 60, xivDbId: "799", icon: this.getIcon("61_PetsEgi/0799_Radiant Shield"), pet: "Ifrit-Egi", abilityType: AbilityType.Pet },
        <IAbility>{ name: "Flaming Crush", duration: 0, cooldown: 30, xivDbId: "800", icon: this.getIcon("61_PetsEgi/0800_Flaming Crush"), pet: "Ifrit-Egi", abilityType: AbilityType.Pet },

        <IAbility>{ name: "Mountain Buster", duration: 0, cooldown: 15, xivDbId: "788", icon: this.getIcon("61_PetsEgi/0788_Mountain Buster"), pet: "Titan-Egi", abilityType: AbilityType.Pet },
        <IAbility>{ name: "Earthen Ward", duration: 20, cooldown: 120, xivDbId: "789", icon: this.getIcon("61_PetsEgi/0789_Earthen Ward"), pet: "Titan-Egi", abilityType: AbilityType.Pet },
        <IAbility>{ name: "Landslide", duration: 0, cooldown: 40, xivDbId: "790", icon: this.getIcon("61_PetsEgi/0790_Landslide"), pet: "Titan-Egi", abilityType: AbilityType.Pet },

        ...this.getAbilitiesFrom(this.casterSharedAbilities),
        this.medicine["Intelligence"]
      ].sort(this.abilitySortFn)
    },
    {
      name: "BLM", role: Role.Caster, canBeTargetForBoss: false, icon: this.getIcon("JobIcons/Black_Mage_Icon_10"), abilities: [
        <IAbility>{ name: "Manaward", duration: 20, cooldown: 120, xivDbId: "157", icon: this.getIcon("51_BlackMage/0157_Manaward"), abilityType: AbilityType.SelfDefense },
        <IAbility>{ name: "Transpose", duration: 0, cooldown: 8, xivDbId: "149", icon: this.getIcon("51_BlackMage/0149_Transpose"), abilityType: AbilityType.Utility },
        <IAbility>{ name: "Convert", duration: 0, cooldown: 180, xivDbId: "158", icon: this.getIcon("51_BlackMage/0158_Convert"), abilityType: AbilityType.Utility },
        <IAbility>{ name: "Ley Lines", duration: 30, cooldown: 90, xivDbId: "3573", icon: this.getIcon("51_BlackMage/3573_Ley Lines"), abilityType: AbilityType.SelfDamageBuff },
        <IAbility>{ name: "Enochian", duration: 30, cooldown: 30, xivDbId: "3575", icon: this.getIcon("51_BlackMage/3575_Enochian"), abilityType: AbilityType.SelfDamageBuff },
        <IAbility>{ name: "Triplecast", duration: 15, cooldown: 60, xivDbId: "7421", icon: this.getIcon("51_BlackMage/7421_Triplecast"), abilityType: AbilityType.Utility },
        ...this.getAbilitiesFrom(this.casterSharedAbilities),
        this.medicine["Intelligence"]
      ].sort(this.abilitySortFn)
    });

  private abilitySortFn(a1: IAbility, a2: IAbility): number {
    const st: AbilityType[] = [
      AbilityType.PartyDefense, AbilityType.SelfDefense, AbilityType.PartyDamageBuff, AbilityType.SelfDamageBuff, AbilityType.Utility, AbilityType.Damage, AbilityType.Healing, AbilityType.HealingBuff, AbilityType.Pet
    ];

    const ar1 = st.map((it, i) => it & a1.abilityType ? i + 1 : 0).find((it) => it > 0);
    const ar2 = st.map((it, i) => it & a2.abilityType ? i + 1 : 0).find((it) => it > 0);

    return ar1 - ar2;
  }

  private getIcon(id?: string, ext?: string): string {
    return "/assets/images/" + id + (ext || ".png");
  }

  private getAbilitiesFrom(arr: IAbilities): IAbility[] {
    return Object.keys(arr).map((it: string) => arr[it]);
  }

  public getJobs(): IJob[] {

    //console.log(pathToImages.keys());
    //console.log(pathToImages(pathToImages.keys()[0]));
    //pathToImages<string>("./10_TankRole/5731_Rampart.png")
    return this.jobs;
  }

  getJob(jobName: string): IJob {
    const job = this.jobs.find((j: IJob) => j.name === jobName) as IJob;
    return job;
  }

  getAbilityForJob(jobName: string, abilityName: string): IAbility {
    const job = this.getJob(jobName);
    return job.abilities.find((a: IAbility) => a.name === abilityName || a.nameToMatch === abilityName) as IAbility;
  }

  getStanecAbilityForJob(jobName: string, abilityName: string): IAbility {
    const job = this.getJob(jobName);
    return job.stances.find((a: IStance) => a.ability.name === abilityName || a.ability.nameToMatch === abilityName).ability as IAbility;
  }

  
  
}

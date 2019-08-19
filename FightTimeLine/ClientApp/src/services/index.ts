import { IAuthenticationService } from "./authentication.service-interface"
import { authenticationServiceProvider, authenticationServiceToken } from "./authentication.service-provider"
import { IFightService } from "./fight.service-interface"
import { fightServiceToken, fightServiceProvider } from "./fight.service-provider"
import { DialogService } from "./DialogService"
import { FFLogsStorageService } from "./FFLogsStorageService"
import { RecentActivityService } from "./RecentActivitiesService"
import { SettingsService } from "./SettingsService"
import { SpreadSheetsService } from "./SpreadSheetsService"
import { UserService } from "./UserService"
import { ScreenNotificationsService } from "./ScreenNotificationsService"
import { LocalStorageService } from "./LocalStorageService"
import { DispatcherService } from "./dispatcher.service"
import { FightHubService, IConnectToSessionHandlers, IStartSessionHandlers } from "./FightHubService"
import * as Gameserviceprovider from "./game.service-provider";

export {
  IAuthenticationService,
  DialogService,
  FFLogsStorageService,
  IFightService,
  RecentActivityService,
  SettingsService,
  SpreadSheetsService,
  UserService,
  ScreenNotificationsService,
  LocalStorageService,
  DispatcherService,
  IConnectToSessionHandlers,
  IStartSessionHandlers,
  authenticationServiceProvider,
  authenticationServiceToken,
  fightServiceProvider,
  fightServiceToken,
  FightHubService
}

export const ServicesModuleComponents =
  [
    DialogService,
    FFLogsStorageService,
    RecentActivityService,
    SettingsService,
    SpreadSheetsService,
    UserService,
    ScreenNotificationsService,
    LocalStorageService,
    DispatcherService,
    FightHubService,
    authenticationServiceProvider,
    fightServiceProvider,
    Gameserviceprovider.gameServiceProvider
  ];


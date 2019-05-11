import { IAuthenticationService } from "./authentication.service-interface"
import { authenticationServiceProvider, authenticationServiceToken } from "./authentication.service-provider"
import { IFightService } from "./fight.service-interface"
import { fightServiceToken, fightServiceProvider } from "./fight.service-provider"
import { DialogService } from "./DialogService"
import { FFLogsService } from "./FFLogsService"
import { FFLogsStorageService } from "./FFLogsStorageService"
import { RecentActivityService } from "./RecentActivitiesService"
import { SettingsService } from "./SettingsService"
import { SpreadSheetsService } from "./SpreadSheetsService"
import { TeamWorkService, IConnectToSessionHandlers, IStartSessionHandlers } from "./TeamWorkService"
import { UserService } from "./UserService"
import { ScreenNotificationsService } from "./ScreenNotificationsService"
import { LocalStorageService } from "./LocalStorageService"
import { DispatcherService } from "./dispatcher.service"

export {
  IAuthenticationService,
  DialogService,
  FFLogsService,
  FFLogsStorageService,
  IFightService,
  RecentActivityService,
  SettingsService,
  SpreadSheetsService,
  TeamWorkService,
  UserService,
  ScreenNotificationsService,
  LocalStorageService,
  DispatcherService,
  IConnectToSessionHandlers,
  IStartSessionHandlers,
  authenticationServiceProvider,
  authenticationServiceToken,
  fightServiceProvider,
  fightServiceToken
}

export const ServicesModuleComponents =
  [
    DialogService,
    FFLogsService,
    FFLogsStorageService,
    RecentActivityService,
    SettingsService,
    SpreadSheetsService,
    TeamWorkService,
    UserService,
    ScreenNotificationsService,
    LocalStorageService,
    DispatcherService,
    authenticationServiceProvider,
    fightServiceProvider
  ];


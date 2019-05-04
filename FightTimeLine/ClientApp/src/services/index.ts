import { IAuthenticationService } from "./authentication.service-interface"
import { AuthenticationService } from "./authentication.service"
import { authenticationServiceProvider, authenticationServiceToken } from "./authentication.service-provider"
import { DialogService } from "./DialogService"
import { FFLogsService } from "./FFLogsService"
import { FFLogsStorageService } from "./FFLogsStorageService"
import { FightsService } from "./FightService"
import { RecentActivityService } from "./RecentActivitiesService"
import { SettingsService } from "./SettingsService"
import { SpreadSheetsService } from "./SpreadSheetsService"
import { TeamWorkService, IConnectToSessionHandlers, IStartSessionHandlers } from "./TeamWorkService"
import { UserService } from "./UserService"
import { ScreenNotificationsService } from "./ScreenNotificationsService"
import { LocalStorageService } from "./LocalStorageService"
import { DispatcherService } from "./dispatcher.service"

export {
  AuthenticationService,
  IAuthenticationService,
  DialogService,
  FFLogsService,
  FFLogsStorageService,
  FightsService,
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
  authenticationServiceToken
}

export const ServicesModuleComponents =
  [
    DialogService,
    FFLogsService,
    FFLogsStorageService,
    FightsService,
    RecentActivityService,
    SettingsService,
    SpreadSheetsService,
    TeamWorkService,
    UserService,
    ScreenNotificationsService,
    LocalStorageService,
    DispatcherService,
    authenticationServiceProvider
  ];


import { AuthenticationService } from "./AuthenticationService"
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
  IStartSessionHandlers
}

export const ServicesModuleComponents =
  [
    AuthenticationService,
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
    DispatcherService
  ];


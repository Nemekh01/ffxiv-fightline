import { Injectable, Output, EventEmitter } from "@angular/core";
import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from "@aspnet/signalr"
import * as M from "../core/Models"


@Injectable()
export class FightHubService {

  private hubConnection: HubConnection;
  private connectedUsers: M.IHubUser[] = [];

  public get connected(): boolean {
    return this.hubConnection && this.hubConnection.state === HubConnectionState.Connected;
  }

  public get users(): M.IHubUser[] {
    return this.connectedUsers;
  }

  @Output("connectedChanged") connectedChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output("usersChanged") usersChanged: EventEmitter<any> = new EventEmitter<any>();

  sendCommand(fight: string, username: string, data: any) {
    if (this.connected) {
      this.hubConnection.invoke("command", fight, username, JSON.stringify(data));
    }
  }

  private createConnection(): HubConnection {
    this.hubConnection = new HubConnectionBuilder()
      .configureLogging(LogLevel.Information)
      .withUrl("/fighthub")
      .build();
    return this.hubConnection;
  }

  disconnect(fight: string): void {
    if (this.connected) {
      this.hubConnection.invoke("disconnect", fight).then(value => {
        this.hubConnection.stop().then(() => {
          this.connectedChanged.emit(false);
          this.connectedUsers = [];
          this.usersChanged.emit();
        });
      });
    }
  }

  startSession(fight: string, username: string, handlers: IStartSessionHandlers): Promise<string> {
    const connection = this.createConnection();
    this.attachHandlers(connection, handlers);

    return new Promise((resolve, reject) => {
      connection.start()
        .then((res) => {
          this.connectedChanged.emit(true);
          this.hubConnection
            .invoke("startSession", fight, username)
            .then((result) => {
              console.log(result);
              resolve(result);
            });
        })
        .catch((err) => {
          this.connectedChanged.emit(false);
          console.error(err);
          reject(err);
        });
    });
  }

  connect(fight: string, username: string, handlers: IConnectToSessionHandlers): Promise<any> {
    if (fight) {
      const connection = this.createConnection();
      this.attachHandlers(connection, handlers);

      return new Promise<any>((resolve, reject) => {
        connection.start()
          .then(() => {
            this.connectedChanged.emit(true);
            this.hubConnection.invoke("connect", fight, username)
              .then(() => {
                console.log("connected");
                resolve();
              })
              .catch((err) => {
                console.error(err);
                reject(err);
              });
          })
          .catch(err => {
            this.connectedChanged.emit(false);
            reject(err);
          });
      });

    }
    return Promise.reject();
  }

  attachHandlers(connection: HubConnection, handlers: ISessionHandlers): void {
    connection.on("connected",
      (data: M.IHubUser) => {
        this.connectedUsers.push(data);
        this.usersChanged.emit();
        if (handlers && handlers.onConnected)
          handlers.onConnected(data);
      });
    connection.on("disconnected",
      (data: M.IHubUser) => {
        this.connectedUsers.splice(this.connectedUsers.findIndex((it => it.id === data.id) as any), 1);
        this.usersChanged.emit();
        if (handlers && handlers.onDisconnected)
          handlers.onDisconnected(data);
      });
    connection.on("command",
      (data:M.IHubCommand) => {
        if (handlers && handlers.onCommand)
          handlers.onCommand(data);
      });
    connection.on("activeUsers",
      (data:M.IHubUser[]) => {
        if (handlers && handlers.onActiveUsers)
          handlers.onActiveUsers(data);
        this.connectedUsers = data;
        this.usersChanged.emit();
      });
  }
}

export interface IStartSessionHandlers extends ISessionHandlers {
  onSync?: () => any;
}

export interface IConnectToSessionHandlers extends ISessionHandlers {
  onDataSync?: (data: any) => void;
}

interface ISessionHandlers {
  onCommand?: (data: M.IHubCommand) => void;
  onConnected?: (data: M.IHubUser) => void;
  onDisconnected?: (data: M.IHubUser) => void;
  onActiveUsers?: (data: M.IHubUser[]) => void;
}

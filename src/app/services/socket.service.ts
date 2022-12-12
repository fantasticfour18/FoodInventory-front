import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket: any;
  constructor() {
  }

  /*
  setupSocketConnection() {
    this.socket = io(environment.socketURL);
  }*/

  /*
  emit(eventName: any, data: any) {
    this.socket.emit(eventName, data);
  }*/

  removeAllListeners() {
    this.socket.removeAllListeners();
    this.socket.disconnect();
  }

  joinRoom = () => {
    this.socket = io(environment.socketURL, {transports: ["websocket"]});
    this.socket.emit('joinRoom', environment.restaurant);
  }

  leaveRoom = () => {
    this.socket = io(environment.socketURL, {transports: ["websocket"]});
    this.socket.emit('leaveRoom', environment.restaurant);
  }

  joinOrderStatus = (orderNumber: any) => {
    this.socket = io(environment.socketURL, {transports: ["websocket"]});
    this.socket.emit('onOrderStatusEnter', orderNumber);
  }

  leaveOrderStatus = (orderNumber: any) => {
    this.socket = io(environment.socketURL, {transports: ["websocket"]});
    this.socket.emit('onOrderStatusLeave', orderNumber);
  }

  on(eventName: any): Observable<any> {
    const subject = new Subject();

    this.socket.on(eventName, (data: any) => {
      subject.next([data]);
    });

    return subject.asObservable();
  }

}

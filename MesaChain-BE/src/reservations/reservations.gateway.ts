import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Inject, forwardRef } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { ReservationsService } from "./reservations.service";
import { UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";

@WebSocketGateway({ cors: true })
export class ReservationsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => ReservationsService))
    private readonly reservationsService: ReservationsService,
    private readonly jwtService: JwtService
  ) { }

  // Called by service when status changes
  broadcastStatusUpdate(
    reservationId: string,
    status:
      | "PENDING"
      | "CONFIRMED"
      | "IN_PREPARATION"
      | "READY"
      | "DELIVERED"
      | "COMPLETED"
      | "CANCELLED"
  ) {
    this.server
      .to(`reservation_${reservationId}`)
      .emit("statusUpdate", { reservationId, status });
  }

  // Clients join a room for their reservation
  @SubscribeMessage("joinReservation")
  async handleJoinReservation(
    @MessageBody() data: { reservationId: string },
    @ConnectedSocket() client: Socket
  ) {
    // Extract and verify JWT from socket handshake
    const user = await this.validateSocketUser(client);

    // Verify user owns this reservation or is staff/admin
    const reservation = await this.reservationsService.findOne(
      data.reservationId
    );
    if (!reservation) {
      throw new WsException("Reservation not found");
    }
    if (
      reservation.userId !== user.id &&
      !["STAFF", "ADMIN"].includes(user.role)
    ) {
      throw new WsException("Unauthorized");
    }

    client.join(`reservation_${data.reservationId}`);
  }

  // Staff can join a room for all active orders
  @SubscribeMessage("joinStaff")
  async handleJoinStaff(@ConnectedSocket() client: Socket) {
    const user = await this.validateSocketUser(client);

    if (!["STAFF", "ADMIN"].includes(user.role)) {
      throw new WsException("Unauthorized");
    }
    client.join("staff");
  }

  // Broadcast to staff
  broadcastToStaff(event: string, payload: any) {
    this.server.to("staff").emit(event, payload);
  }

  private async validateSocketUser(client: Socket) {
    try {
      // Extract token from socket handshake auth or query
      const token =
        client.handshake.auth?.token || client.handshake.query?.token;
      if (!token) {
        throw new WsException("No authentication token provided");
      }

      // Verify JWT and return user (you'll need to inject JwtService)
      // This is a simplified example - adapt to your auth implementation
      const payload = this.jwtService.verify(token);
      const user = await this.reservationsService.findUserById(payload.sub);

      if (!user) {
        throw new WsException("Invalid user");
      }

      return user;
    } catch (error) {
      throw new WsException("Authentication failed");
    }
  }
}

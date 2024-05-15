import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { GoogleService } from './api.service';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

@Controller('google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) { }

  //Retorna el link con que se hace el endPoint con la api de google
  @Get('auth/url')
  async getAuthUrl() {
    return { url: await this.googleService.getAuthUrl() };
  }

  @Get('user-info')
  async getUserInfo() {
    return await this.googleService.getUserInfo();
  }



  //Retorna la informacion del usuario
  @Get('auth/callback/google')
  async authCallback(@Query('code') code: string) {
    const { data, tokens } = await this.googleService.getAccessToken(code);
    const message = `
    <html>
    <head>
      <title>Sesión iniciada correctamente</title>
    </head>
    <body>
      <h1>Sesión iniciada correctamente</h1>
      <p>Bienvenido, ahora puedes acceder a todas las funciones disponibles.</p>
      <script>
          window.close();
      </script>
    </body>
  </html>
    `;
    return message;
  }

  //Crea el evento 
  //conferenceDataVersion meet-1 no meet-0
  @Post('create-event')
  async createEvent(@Body() body: {
    date: string, dateTime: string, attendees: string[], conferenceDataVersion: string
  }) { 
    console.log('adsfasdfasdfasdfasdfasdfas')
    console.log(body)
    const { date, dateTime, attendees, conferenceDataVersion } = body;
    return this.googleService.createEvent(date, dateTime, attendees, conferenceDataVersion);
  }

  //elimnar evento
  @Post('delete-event')
  async deleteEvent(@Body() body: { eventId: string }) {
    const { eventId } = body;
    return this.googleService.deleteEvent(eventId);
  }

  //cerrar sesion
  @Get('logout')
  async logout() {
    await this.googleService.revokeAccess();
    return { message: 'Logout successful' };
  }
  //verificar sesion activa
  @Get('check-session')
  async checkSession() {
    const isSessionActive = await this.googleService.isSessionActive();
    if (isSessionActive) {
      console.log('There is an active session.');
    } else {
      console.log('There is no active session.');
    }
    return { isSessionActive };
  }
}
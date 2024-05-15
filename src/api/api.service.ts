import { Injectable } from '@nestjs/common'; 
import { google } from 'googleapis'; 
import { v4 } from 'uuid'

@Injectable() 
export class GoogleService {
 
  private readonly auth = new google.auth.OAuth2(
    process.env.CLIENTIDGOOGLE,
    process.env.CLIENTSECRETGOOGLE,
    process.env.REDIRECTURL
  );

  async getAuthUrl() {
    const scopes = ['email', 'profile', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'];
    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  }

  async getUserInfo() {
    const oauth2 = google.oauth2({ version: 'v2', auth: this.auth });
    const { data } = await oauth2.userinfo.get();
    return data;
}


  async getAccessToken(code: string) {
    const { tokens } = await this.auth.getToken(code);
    this.auth.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: this.auth });
    const { data } = await oauth2.userinfo.get();

    const { access_token, id_token, refresh_token } = tokens;
    // return { access_token, id_token, refresh_token, name: data.name, picture: data.picture };
    return { data, tokens };
  }
   
  async createEvent(date: string, dateTime: string, attendees: string[], conferenceDataVersion: string) {
    
    const calendar = google.calendar({ version: 'v3', auth: this.auth });
    let startDateTime = date + 'T' + dateTime; //format: AAAA-MM-DDThh:mm:ss
    let [hours, minutes] = dateTime.split(':').map(Number);
    let endHours = minutes + 20 === 60 ? hours + 1 < 10 ? '0' + (hours + 1).toString() : (hours + 1).toString() : hours.toString();
    let endMinutes = minutes + 20 === 60 ? '00' : (minutes + 20).toString();
    let endDateTime = date + 'T' + endHours + ':' + endMinutes + ':00';
    let eventSummary = conferenceDataVersion == '0' ? ' - Presencial' : ' - Remota';
     



    const event = {
      colorId: '10',
      summary: 'Asesoria PPI' + eventSummary,
      description: 'Asesoria PPI',
      start: {
        dateTime: startDateTime,
        timeZone: 'America/Bogota',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'America/Bogota',
      },
      conferenceData: {
        createRequest: {
          conferenceSolutionKey: { type: 'hangoutsMeet' },
          requestId: v4(),
        },
      },
      attendees: attendees.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'popup', minutes: 15 },
        ],
      },
    };
 

    const calendarResponse = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: conferenceDataVersion.toString() === '1' ? 1 : 0,
    });

    const eventId = calendarResponse.data.id;
    const htmlLink = calendarResponse.data.htmlLink;
    const meetLink = calendarResponse.data.hangoutLink; 
    return { eventId, htmlLink, meetLink };
  }


  async deleteEvent(eventId: string) {
    const calendar = google.calendar({ version: 'v3', auth: this.auth });

    // Get the event to retrieve attendees
    const event = await calendar.events.get({
      calendarId: 'primary',
      eventId: eventId,
    });

    // Delete the event
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      sendNotifications: true, // Send notifications to attendees
      sendUpdates: 'all', // Send updates to all attendees
    });
    return { message: 'Evento eliminado y notificaciones enviadas.' };
  }

  async revokeAccess() {
    await this.auth.revokeCredentials();
  }

  async isSessionActive() {
    return !!this.auth.credentials.access_token;
  }
}
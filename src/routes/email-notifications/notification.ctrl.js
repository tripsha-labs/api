/**
 * @name - Email notification Controller
 * @description - This will handle all business logic for email notification
 */
import { google } from 'googleapis';
import { ERROR_KEYS } from '../../constants';
import { AppSettingModel, UserModel, ConversationModel } from '../../models';
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const credentials = {
  client_id:
    '695052621194-6pjir0t4dk8g8cob0348evgfiqicl8c4.apps.googleusercontent.com',
  project_id: 'tripsha',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_secret: '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',
  redirect_uris: ['http://localhost'],
};
export class EmailNotificationController {
  static async getSyncUrl() {
    const { client_id, client_secret, redirect_uris } = credentials;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    return { authUrl: authUrl };
  }
  static async setToken(params) {
    const { code } = params || {};
    const { client_id, client_secret, redirect_uris } = credentials;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );
    try {
      const token = await oAuth2Client.getToken(code);
      await AppSettingModel.addOrUpdate(
        { name: 'EmailSyncToken' },
        { data: token.tokens }
      );
      return 'success';
    } catch (err) {
      return err.response.data;
    }
  }
  static async _getCurrentHistoryId(gmail) {
    const history = await AppSettingModel.get({ name: 'SyncHistoryId' });
    if (history && history.data && history.data.historyId) {
      return history.data.historyId;
    } else {
      const profile = await gmail.users.getProfile({
        userId: 'me',
      });
      await AppSettingModel.addOrUpdate(
        { name: 'SyncHistoryId' },
        { data: profile.data }
      );
      return profile.data.historyId;
    }
  }
  static extractEmails(text) {
    return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
  }
  static decodeBase64(base64) {
    //  const base64 = 'QmFzZTY0IEVuY29kaW5nIGluIE5vZGUuanM=';
    const buff = Buffer.from(base64, 'base64');
    return buff.toString('utf-8');
  }
  static async getMessage(gmail, id) {
    return new Promise(async (resolve, reject) => {
      const query = {
        format: 'full',
        userId: 'me',
        id: id,
      };
      const message = await gmail.users.messages.get(query);
      const finalMessage = {};
      if (message.data.payload.body && message.data.payload.body.data)
        finalMessage['message'] = EmailNotificationController.decodeBase64(
          message.data.payload.body.data
        );
      message.data.payload.headers.map(header => {
        if (header.name == 'From') {
          finalMessage['email'] = EmailNotificationController.extractEmails(
            header.value
          )[0];
        }
        return header;
      });
      if (finalMessage['email']) {
        const user = UserModel.get({ email: finalMessage['email'] });
        if (user) {
          // Build message
        }
      }
      return resolve(finalMessage);
    });
  }
  static async _getEmails(gmail, historyId, pageToken = null) {
    const query = {
      userId: 'me',
      historyTypes: 'messageAdded',
      startHistoryId: historyId,
    };
    if (pageToken) query['pageToken'] = pageToken;
    const emails = await gmail.users.history.list(query);
    const promises = [];
    emails.data.history.map(history => {
      history.messages.map(async message => {
        promises.push(
          EmailNotificationController.getMessage(gmail, message.id)
        );
        return message;
      });
      return history;
    });
    const result = await Promise.all(promises);
    console.log('Completed sync');

    // if (emails && emails.data && emails.data.historyId) {
    //   await AppSettingModel.addOrUpdate(
    //     { name: 'SyncHistoryId' },
    //     { data: { historyId: emails.data.historyId } }
    //   );
    // }
  }
  static async getEmails() {
    const { client_id, client_secret, redirect_uris } = credentials;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );
    try {
      const token = await AppSettingModel.get({
        name: 'EmailSyncToken',
      });
      oAuth2Client.setCredentials(token.data);
      const newToken = await oAuth2Client.refreshAccessToken();
      await AppSettingModel.addOrUpdate(
        { name: 'EmailSyncToken' },
        { data: newToken.credentials }
      );
      oAuth2Client.setCredentials(newToken.credentials);
      const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
      const historyId = await EmailNotificationController._getCurrentHistoryId(
        gmail
      );
      await EmailNotificationController._getEmails(gmail, historyId);
      return 'success';
    } catch (err) {
      console.log(err);
      return err;
    }
  }
}

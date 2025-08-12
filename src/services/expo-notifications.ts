
// src/services/push/expo.ts
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

type SendArgs = {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

export async function sendExpo({ tokens, title, body, data }: SendArgs) {
  const messages: ExpoPushMessage[] = tokens
    .filter(Expo.isExpoPushToken)
    .map((to) => ({ to, sound: 'default', title, body, data }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets: any[] = [];

  for (const chunk of chunks) {
    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...ticketChunk);
  }

  // (optional) later: fetch receipts & prune invalid tokens
  return tickets;
}

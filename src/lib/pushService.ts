/**
 * GNF Esports Expo Push Notification Dispatcher
 * Sends real-time native push notifications to Android / iOS devices even when app is closed.
 */

export interface ExpoPushMessage {
  to: string | string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: "default" | null;
  channelId?: string;
  priority?: "default" | "normal" | "high";
  badge?: number;
}

export async function sendExpoPushNotification(message: ExpoPushMessage): Promise<boolean> {
  const recipients = Array.isArray(message.to) ? message.to : [message.to];
  const validTokens = recipients.filter(
    (t) => typeof t === "string" && (t.startsWith("ExponentPushToken[") || t.startsWith("ExpoPushToken["))
  );

  if (validTokens.length === 0) {
    return false;
  }

  const payload = validTokens.map((token) => ({
    to: token,
    title: message.title,
    body: message.body,
    data: message.data || {},
    sound: message.sound || "default",
    channelId: message.channelId || "gnf_tournament_alerts",
    priority: message.priority || "high",
  }));

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return Boolean(data);
  } catch (error) {
    console.warn("Expo push notification dispatch notice:", error);
    return false;
  }
}

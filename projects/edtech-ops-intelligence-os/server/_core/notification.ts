/*
 * Owner notifications.
 *
 * The hosted notification service this previously called is gone. Rather than
 * pretend to deliver, this writes to the server log and reports honestly
 * whether a real transport is configured, so `system.notifyOwner` never claims
 * a delivery that did not happen.
 *
 * To deliver for real, set OWNER_WEBHOOK_URL to any endpoint accepting a JSON
 * POST — Slack, Discord, or your own handler.
 */

export type OwnerNotification = {
  title: string;
  content: string;
};

const webhookUrl = process.env.OWNER_WEBHOOK_URL ?? "";

export async function notifyOwner(notification: OwnerNotification): Promise<boolean> {
  if (!webhookUrl) {
    console.info(
      `[Notify] ${notification.title}: ${notification.content} ` +
        `(no OWNER_WEBHOOK_URL configured — not delivered)`
    );
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(notification),
    });

    if (!response.ok) {
      console.error(`[Notify] Webhook returned ${response.status} ${response.statusText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Notify] Webhook request failed", error);
    return false;
  }
}

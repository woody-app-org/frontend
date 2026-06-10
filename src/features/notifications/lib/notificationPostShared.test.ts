import { describe, expect, it } from "vitest";
import { notificationSummaryFromItem } from "./notificationCopy";
import { getNotificationTargetRoute } from "./notificationNavigation";
import type { NotificationItem } from "../services/notifications.service";

function samplePostSharedNotification(overrides: Partial<NotificationItem> = {}): NotificationItem {
  return {
    id: "1",
    type: "post_shared",
    targetType: "post",
    targetId: 10,
    metadata: { postId: 10, postPublicId: "pst_abc123" },
    createdAt: new Date(0).toISOString(),
    actor: { id: "5", displayName: "Camila", username: "camila" },
    ...overrides,
  };
}

describe("post_shared notification", () => {
  it("renders friendly summary text", () => {
    const summary = notificationSummaryFromItem(samplePostSharedNotification());
    expect(summary).toBe("Camila repostou sua publicação no stories");
  });

  it("navigates to the actor's profile (where the story can be viewed)", () => {
    const route = getNotificationTargetRoute(samplePostSharedNotification());
    expect(route).toBe("/profile/camila");
  });

  it("still resolves a profile route when only the actor id is present", () => {
    const route = getNotificationTargetRoute(
      samplePostSharedNotification({ actor: { id: "5", displayName: "Camila", username: "" }, metadata: {} })
    );
    expect(route).toBe("/profile/5");
  });

  it("does not break summary when actor is missing", () => {
    const summary = notificationSummaryFromItem(
      samplePostSharedNotification({ actor: null })
    );
    expect(summary).toBe("Alguém repostou sua publicação no stories");
  });
});

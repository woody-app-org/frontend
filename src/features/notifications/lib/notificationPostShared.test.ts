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
    expect(summary).toBe("Camila compartilhou sua publicação");
  });

  it("navigates to post public id route", () => {
    const route = getNotificationTargetRoute(samplePostSharedNotification());
    expect(route).toBe("/posts/pst_abc123");
  });

  it("still resolves route when only postId is present", () => {
    const route = getNotificationTargetRoute(
      samplePostSharedNotification({ metadata: { postId: 10 }, targetId: 10 })
    );
    expect(route).toBe("/posts/10");
  });

  it("does not break summary when actor is missing", () => {
    const summary = notificationSummaryFromItem(
      samplePostSharedNotification({ actor: null })
    );
    expect(summary).toBe("Alguém compartilhou sua publicação");
  });

  it("returns null route when post metadata is missing", () => {
    const route = getNotificationTargetRoute(
      samplePostSharedNotification({ metadata: {}, targetId: null, targetType: "none" })
    );
    expect(route).toBeNull();
  });
});

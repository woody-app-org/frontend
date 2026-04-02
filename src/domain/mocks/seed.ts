import { buildPlatformSeed } from "./seed-data";
import type { Community, JoinRequest, Membership, User } from "../types";

const built = buildPlatformSeed();

/**
 * Fonte única de verdade para mocks de usuárias, comunidades, participações e posts.
 */
export const SEED_USERS: User[] = built.users;
export const SEED_COMMUNITIES: Community[] = built.communities;
export const SEED_MEMBERSHIPS: Membership[] = built.memberships;
export const SEED_JOIN_REQUESTS: JoinRequest[] = built.joinRequests;
export const SEED_FOLLOWS = built.follows;
export const SEED_POSTS = built.posts;
export const SEED_POST_COMMENTS = built.postComments;

export type SeedPost = (typeof SEED_POSTS)[number];
export type SeedComment = (typeof SEED_POST_COMMENTS)[number];
export type { SeedFollow } from "./seed-data";

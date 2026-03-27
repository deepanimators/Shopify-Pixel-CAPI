import { createHash } from "node:crypto";

import type { UserContext, ResolvedIdentity } from "../events/types.js";

export class IdentityResolver {
  resolve(user: UserContext): ResolvedIdentity {
    const matchedOn: string[] = [];
    const fragments: string[] = [];

    if (user.customerId) {
      matchedOn.push("customerId");
      fragments.push(`customer:${user.customerId}`);
    }

    if (user.email) {
      matchedOn.push("email");
      fragments.push(`email:${user.email.trim().toLowerCase()}`);
    }

    if (user.phone) {
      matchedOn.push("phone");
      fragments.push(`phone:${user.phone.trim()}`);
    }

    if (user.externalId) {
      matchedOn.push("externalId");
      fragments.push(`external:${user.externalId}`);
    }

    if (fragments.length === 0 && user.anonymousId) {
      matchedOn.push("anonymousId");
      fragments.push(`anon:${user.anonymousId}`);
    }

    const seed = fragments.length > 0 ? fragments.join("|") : "unresolved";
    const identityKey = createHash("sha256").update(seed).digest("hex");

    return {
      identityKey,
      matchedOn
    };
  }
}

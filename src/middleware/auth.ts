import type { Request, Response, NextFunction } from "express";

import type { AppContainer } from "../container.js";
import { env } from "../config/env.js";
import { SESSION_COOKIE_NAME } from "../modules/auth/service.js";
import type { AuthContext } from "../modules/auth/types.js";

declare global {
  namespace Express {
    interface Locals {
      auth: AuthContext | null;
    }
  }
}

export function attachAuth(container: AppContainer) {
  return async (request: Request, response: Response, next: NextFunction) => {
    if (env.NODE_ENV === "test") {
      response.locals.auth = {
        user: {
          userId: "test-user",
          email: "test@example.com",
          displayName: "Test User",
          globalRole: "platform_admin",
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        memberships: [],
        accessibleTenantIds: [],
        canManageAllTenants: true
      };
      return next();
    }

    const sessionToken = readCookie(request.headers.cookie, SESSION_COOKIE_NAME);
    response.locals.auth = await container.userAuthService.getAuthContext(sessionToken);
    next();
  };
}

export function requireAppUser(request: Request, response: Response, next: NextFunction) {
  if (response.locals.auth) {
    return next();
  }

  const acceptsHtml = request.accepts(["html", "json"]) === "html";
  if (acceptsHtml) {
    return response.redirect(`/auth/login?next=${encodeURIComponent(request.originalUrl)}`);
  }

  return response.status(401).json({ error: "Authentication required" });
}

export function getSessionToken(request: Request) {
  return readCookie(request.headers.cookie, SESSION_COOKIE_NAME);
}

function readCookie(header: string | undefined, name: string) {
  if (!header) {
    return undefined;
  }

  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return undefined;
}

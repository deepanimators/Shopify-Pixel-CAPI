import { Router, type Response } from "express";
import { z } from "zod";

import type { AppContainer } from "../container.js";
import { env } from "../config/env.js";
import { getSessionToken } from "../middleware/auth.js";
import { renderLoginPage } from "../modules/auth/pages.js";
import { SESSION_COOKIE_NAME } from "../modules/auth/service.js";

const credentialsSchema = z.object({
  displayName: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email(),
  password: z.string().min(8).max(120)
});

export function createAuthRouter(container: AppContainer) {
  const router = Router();

  router.get("/login", (request, response) => {
    response.type("html").send(
      renderLoginPage({
        title: "Sign in",
        action: "/auth/login",
        subtitle: "Access the Shopify tracking control plane and merchant workspaces.",
        submitLabel: "Sign in",
        error: request.query.error ? String(request.query.error) : undefined
      })
    );
  });

  router.post("/login", async (request, response) => {
    const parsed = credentialsSchema.omit({ displayName: true }).safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).type("html").send(
        renderLoginPage({
          title: "Sign in",
          action: "/auth/login",
          subtitle: "Access the Shopify tracking control plane and merchant workspaces.",
          submitLabel: "Sign in",
          error: "Enter a valid email and password."
        })
      );
    }

    try {
      const result = await container.userAuthService.login(parsed.data.email, parsed.data.password);
      setSessionCookie(response, result.session.sessionToken);
      const next = typeof request.query.next === "string" ? request.query.next : "/app";
      return response.redirect(next);
    } catch (error) {
      return response.status(401).type("html").send(
        renderLoginPage({
          title: "Sign in",
          action: "/auth/login",
          subtitle: "Access the Shopify tracking control plane and merchant workspaces.",
          submitLabel: "Sign in",
          error: error instanceof Error ? error.message : "Unable to sign in"
        })
      );
    }
  });

  router.get("/register", (request, response) => {
    response.type("html").send(
      renderLoginPage({
        title: "Create account",
        action: "/auth/register",
        subtitle: "Create a secure operator account for the hosted tracking backend.",
        submitLabel: "Create account",
        error: request.query.error ? String(request.query.error) : undefined
      })
    );
  });

  router.post("/register", async (request, response) => {
    const parsed = credentialsSchema.safeParse(request.body);
    if (!parsed.success || !parsed.data.displayName) {
      return response.status(400).type("html").send(
        renderLoginPage({
          title: "Create account",
          action: "/auth/register",
          subtitle: "Create a secure operator account for the hosted tracking backend.",
          submitLabel: "Create account",
          error: "Enter a display name, valid email, and password with at least 8 characters."
        })
      );
    }

    try {
      const result = await container.userAuthService.register({
        displayName: parsed.data.displayName,
        email: parsed.data.email,
        password: parsed.data.password
      });
      setSessionCookie(response, result.session.sessionToken);
      return response.redirect("/app");
    } catch (error) {
      return response.status(400).type("html").send(
        renderLoginPage({
          title: "Create account",
          action: "/auth/register",
          subtitle: "Create a secure operator account for the hosted tracking backend.",
          submitLabel: "Create account",
          error: error instanceof Error ? error.message : "Unable to register"
        })
      );
    }
  });

  router.post("/logout", async (request, response) => {
    await container.userAuthService.logout(getSessionToken(request));
    clearSessionCookie(response);
    response.redirect("/auth/login");
  });

  router.get("/session", async (request, response) => {
    const context = await container.userAuthService.getAuthContext(getSessionToken(request));
    if (!context) {
      return response.status(401).json({ error: "Not authenticated" });
    }

    return response.json(context);
  });

  router.get("/install", (request, response) => {
    const shop = String(request.query.shop ?? "");

    try {
      const result = container.shopifyAuthService.createInstallStart(shop);
      response.redirect(result.installUrl);
    } catch (error) {
      response.status(400).json({
        error: error instanceof Error ? error.message : "Unable to start install"
      });
    }
  });

  router.get("/callback", async (request, response) => {
    try {
      const url = new URL(request.originalUrl, env.SHOPIFY_APP_URL);
      const result = await container.shopifyAuthService.handleCallback(url.searchParams);
      const authContext = await container.userAuthService.getAuthContext(getSessionToken(request));
      if (authContext) {
        await container.userAuthService.assignTenantRole(
          authContext.user.userId,
          result.tenantId,
          "tenant_owner"
        );
      }
      response.redirect(`/app?tenant=${encodeURIComponent(result.tenantId)}&shop=${encodeURIComponent(result.shop)}`);
    } catch (error) {
      response.status(401).json({
        error: error instanceof Error ? error.message : "OAuth callback failed"
      });
    }
  });

  return router;
}

function setSessionCookie(response: Response, sessionToken: string) {
  response.setHeader("Set-Cookie", `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
}

function clearSessionCookie(response: Response) {
  response.setHeader("Set-Cookie", `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

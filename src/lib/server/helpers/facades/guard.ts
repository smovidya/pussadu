import { error } from "@sveltejs/kit";
import type { createAuth } from "../../auth";
import { LocalRequest, Locals } from "./request-event";

interface GaurdOptions {
  /**
   * @default all roles
   */
  roles?: string[];
  /**
   * @default false
   */
  allowBanned?: boolean;
}

/**
 * Will throw if the user is not logged in 
 */
function loggedIn(options?: GaurdOptions) {
  const user = Locals.user;

  if (!user) {
    error(401, "Unauthorized");
  }

  if (user.banned && !options?.allowBanned) {
    error(403, "Forbidden");
  }

  const roles = [...(options?.roles ?? []), "admin"];
  if (options?.roles && !roles.some(r => user.role?.includes(r))) {
    error(403, "Forbidden");
  }

  return user;
}

type PermissionCheckFn = ReturnType<typeof createAuth>["api"]["userHasPermission"];
type Body = Parameters<PermissionCheckFn>["0"]["body"];
/**
 * Will throw if the user dont have the specified permission
 */
async function allows(body: Body) {
  const { headers } = LocalRequest;

  const { success } = await Locals.auth.api.userHasPermission({
    headers,
    body
  });

  if (!success) {
    // TODO: i assume that some permission are allowed for non logged in user
    if (!Locals.user) {
      error(401, "Unauthorized");
    }

    error(403, "Forbidden");
  }
}

/**
 * Shorthand for `Guard.loggedIn({ roles: "admin" })`
 */
function admin() {
  return loggedIn({ roles: ["admin"] });
}

export const Guard = {
  allows,
  loggedIn,
  admin
};

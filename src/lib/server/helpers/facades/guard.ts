import { error } from "@sveltejs/kit";
import type { createAuth } from "../../auth";
import { LocalRequest, Locals } from "./request-event";

interface GaurdOptions {
  // default to all roles
  roles?: string[];
  // default to false
  allowBanned?: boolean;
}

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
async function allows(body: Body) {
  const { headers } = LocalRequest;

  const { success } = await Locals.auth.api.userHasPermission({
    headers,
    body: {
      ...body
    }
  });

  if (!success) {
    error(403, "Forbidden");
  }
}

function admin() {
  return loggedIn({ roles: ["admin"] });
}

export const Guard = {
  allows,
  loggedIn,
  admin
};

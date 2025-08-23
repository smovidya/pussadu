import { getRequestEvent } from "$app/server";
import { createFacade } from "../facade";

const options = { key: () => getRequestEvent() };

export const Locals = createFacade(() => getRequestEvent().locals, options);
// export const Db = createFacade(() => getRequestEvent().locals.db, options);
export const Cookies = createFacade(() => getRequestEvent().cookies, options);
// hope this one work
export const LocalRequest = createFacade(() => getRequestEvent().request, options);
export const Params = createFacade(() => getRequestEvent().params, options);


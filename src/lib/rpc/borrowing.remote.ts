import { command, query } from '$app/server';
import { Guard } from '$lib/server/helpers/facades/guard';
import { Locals } from '$lib/server/helpers/facades/request-event';
import * as borrowing from '$lib/server/models/borrowing.model';

export const requestToBorrow = command(borrowing.BorrowingRequest.omit('ouid'), async (request) => {
  const { ouid } = Guard.loggedIn();

  await borrowing.requestToBorrow(Locals.db, {
    ...request,
    ouid
  });
});

export const listBorrowed = query(async () => {
  const { ouid } = Guard.loggedIn();
  return await borrowing.listBorrowedByUser(Locals.db, ouid);
});

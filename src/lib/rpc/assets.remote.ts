import { command } from '$app/server';
import { type } from 'arktype';

export const requestToBorrow = command(type({}), () => {});

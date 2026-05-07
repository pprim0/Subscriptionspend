import { createClient } from "@subscriptionspend/contracts/client";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export const api = createClient(`${apiUrl}/rpc`);

"use server";

import { getPublicState, type PublicState } from "@/lib/public-state";

export async function fetchPublicState(): Promise<PublicState> {
  return getPublicState();
}

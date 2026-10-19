import { createTccGetHandler } from "@/lib/auth/tcc-route-handler";

export async function GET(
  request: Request,
  context: { params: Promise<{ tccId: string }> },
) {
  return createTccGetHandler()(request, context);
}

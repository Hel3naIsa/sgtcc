import { createDocumentGetHandler } from "@/lib/auth/document-route-handler";

export async function GET(
  request: Request,
  context: { params: Promise<{ documentId: string }> },
) {
  return createDocumentGetHandler()(request, context);
}

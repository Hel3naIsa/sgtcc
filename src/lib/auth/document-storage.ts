import { adminStorage } from "@/lib/firebase/admin";
import { AuthServiceUnavailableError } from "@/lib/auth/errors";

const SIGNED_URL_TTL_MS = 5 * 60 * 1000;

function decodePath(path: string): string {
  return decodeURIComponent(path).replace(/^\/+/, "");
}

export function getFirebaseStoragePath(
  fileUrl: string,
  expectedBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
): string {
  if (fileUrl.startsWith("gs://")) {
    const withoutScheme = fileUrl.slice("gs://".length);
    const separator = withoutScheme.indexOf("/");
    const bucket = separator === -1 ? withoutScheme : withoutScheme.slice(0, separator);
    const path = separator === -1 ? "" : withoutScheme.slice(separator + 1);

    if (expectedBucket && bucket !== expectedBucket) {
      throw new AuthServiceUnavailableError("O arquivo pertence a outro bucket.");
    }
    if (!path) throw new AuthServiceUnavailableError("Caminho do arquivo não configurado.");
    return decodePath(path);
  }

  let parsed: URL;
  try {
    parsed = new URL(fileUrl);
  } catch {
    throw new AuthServiceUnavailableError("URL de armazenamento inválida.");
  }

  if (parsed.hostname === "firebasestorage.googleapis.com") {
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length >= 5 && segments[0] === "v0" && segments[1] === "b" && segments[3] === "o") {
      const bucket = segments[2];
      if (expectedBucket && bucket !== expectedBucket) {
        throw new AuthServiceUnavailableError("O arquivo pertence a outro bucket.");
      }
      const encodedPath = segments.slice(4).join("/");
      if (!encodedPath) throw new AuthServiceUnavailableError("Caminho do arquivo não configurado.");
      return decodePath(encodedPath);
    }
  }

  if (parsed.hostname === "storage.googleapis.com") {
    const segments = parsed.pathname.split("/").filter(Boolean);
    const bucket = segments.shift();
    if (expectedBucket && bucket !== expectedBucket) {
      throw new AuthServiceUnavailableError("O arquivo pertence a outro bucket.");
    }
    if (!segments.length) throw new AuthServiceUnavailableError("Caminho do arquivo não configurado.");
    return decodePath(segments.join("/"));
  }

  throw new AuthServiceUnavailableError(
    "O documento não está armazenado em um bucket Firebase protegido.",
  );
}

export async function createSignedDocumentUrl(fileUrl: string): Promise<{
  url: string;
  expiresAt: string;
}> {
  if (!adminStorage) {
    throw new AuthServiceUnavailableError("Firebase Storage Admin não está configurado.");
  }

  const path = getFirebaseStoragePath(fileUrl);
  const expiresAt = new Date(Date.now() + SIGNED_URL_TTL_MS);
  const [url] = await adminStorage.bucket().file(path).getSignedUrl({
    action: "read",
    expires: expiresAt,
  });

  return { url, expiresAt: expiresAt.toISOString() };
}

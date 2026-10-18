export interface InstitutionalSsoConfig {
  providerId: string;
  allowedEmailDomain?: string;
}

function clean(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

export function getServerSsoConfig(): InstitutionalSsoConfig | null {
  const providerId =
    clean(process.env.FIREBASE_AUTH_PROVIDER_ID) ??
    clean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_PROVIDER_ID);

  if (!providerId) {
    return null;
  }

  return {
    providerId,
    allowedEmailDomain: (
      clean(process.env.FIREBASE_INSTITUTIONAL_EMAIL_DOMAIN) ??
      clean(process.env.NEXT_PUBLIC_FIREBASE_INSTITUTIONAL_EMAIL_DOMAIN)
    )?.toLowerCase(),
  };
}

export function getClientSsoConfig(): InstitutionalSsoConfig | null {
  const providerId = clean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_PROVIDER_ID);

  if (!providerId) {
    return null;
  }

  return {
    providerId,
    allowedEmailDomain: clean(
      process.env.NEXT_PUBLIC_FIREBASE_INSTITUTIONAL_EMAIL_DOMAIN,
    )?.toLowerCase(),
  };
}

export function isInstitutionalEmail(
  email: string | undefined,
  config: InstitutionalSsoConfig,
): boolean {
  if (!email) {
    return false;
  }

  if (!config.allowedEmailDomain) {
    return true;
  }

  return email.toLowerCase().endsWith(`@${config.allowedEmailDomain}`);
}

import { requireEnvBool, requireEnvPresent } from "@/lib/env";

export type RegistrationConfig = {
  inviteRequired: boolean;
  contactEmail: string;
};

export function getRegistrationConfig(): RegistrationConfig {
  const inviteRequired = requireEnvBool("REGISTRATION_INVITE_REQUIRED");
  const contactEmail = requireEnvPresent("REGISTRATION_CONTACT_EMAIL");
  if (inviteRequired && !contactEmail) {
    throw new Error("REGISTRATION_INVITE_REQUIRED=true 時必須設定 REGISTRATION_CONTACT_EMAIL");
  }
  return { inviteRequired, contactEmail };
}

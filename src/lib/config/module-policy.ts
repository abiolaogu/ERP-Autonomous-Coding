import { env, type AuthPolicy } from "@/lib/config/env";

export const modulePolicy = {
  name: "ERP-Autonomous-Coding",
  slug: "autonomous-coding",
  authPolicy: env.authPolicy as AuthPolicy,
  notes: "",
  altUrls: "",
};

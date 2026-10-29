// Shared by the server action and the form. Lives apart from the action file
// because a "use server" module may export only async functions.

export type ContactField =
  | "name"
  | "email"
  | "phone"
  | "buildingName"
  | "location"
  | "unitCount";

export type ContactState = {
  status: "idle" | "error" | "sent";
  /** Per-field messages, shown beside the field and again in the summary. */
  errors: Partial<Record<ContactField, string>>;
  /** A failure that is not about one field, e.g. Convex being unreachable. */
  formError?: string;
  /** Echoed back so a failed submit does not wipe what the person typed. */
  values: Record<string, string>;
};

export const initialContactState: ContactState = {
  status: "idle",
  errors: {},
  values: {},
};

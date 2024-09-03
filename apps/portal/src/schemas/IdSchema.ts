import { z } from "zod";

export const IdSchema = z.object({
  school_id: z
    .string()
    .min(1, "ID Number is required")
    .regex(/^\d{4}-\d{4}$/, "Incorrect ID Number format, ex: 1234-5678"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .regex(
      /^[a-zA-Z.\s]+$/,
      "First name can only contain letters, spaces, and dots"
    ),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .regex(
      /^[a-zA-Z.\s]+$/,
      "Last name can only contain letters, spaces, and dots"
    ),
  department: z.string().length(1, "Department can't be empty"),
  profilePhoto: z
    .instanceof(File)
    .refine((file) => file.size <= 5000000, `Max file size is 5MB.`)
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Only .jpg, .png and .webp formats are supported."
    ),
});

import { email, z } from "zod";

export const CounsellorValidation = z.object({
  fullname: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(50, "Full name is too long")
    .trim(),

  email: z.email(),

  contact_number: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),

  Password: z.string().min(6, "Password must be at least 6 characters"),

  dob: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date of birth",
  }),

  gender: z.enum(["Male", "Female", "Prefer Not To Say"], {
    errorMap: () => ({ message: "Invalid gender value" }),
  }),

  timezone: z.string().min(2, "Timezone is required"),

  languages: z.string().min(2, "Preferred language is required"),

  counselling_type: z.string(),

  specialties: z.string().min(1, "spaciality is important"),

  bio: z.string().min(2, "bio is important"),

  years_experience: z.string().min(1, "year experince is important"),

  languages: z.string().min(1, "languages is important"),

  hourly_rate: z.string(),

  availability: z.string(),

  session_type: z.enum(["Video Session", "Voice Session", "Chat Session"], {
    errorMap: () => ({ message: "Invalid session type" }),
  }),
});

export const CounsellorLoginValiation = z.object({
  email: z.email(),
  Password: z.string(),
});

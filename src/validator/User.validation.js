import { z } from "zod";


export const SignupValidation = z.object({
    fullname:z.
            string().
            min(3, "Full name must be at least 3 characters").
            max(50, "Full name is too long").
            trim(),
    email : z.email(),
    phone_number : z.string().regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
    Password : z.string(),
})


export const LoginValidation = z.object({
    email : z.email(),
    Password : z.string(),
})
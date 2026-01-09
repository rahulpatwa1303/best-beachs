"use server"

import { db } from "@/db"
import { subscribers } from "@/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { Resend } from "resend"
import { WelcomeEmail } from "@/components/emails/WelcomeEmail"

const resend = new Resend(process.env.RESEND_API_KEY)

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
})

export async function subscribe(formData: FormData) {
  const email = formData.get("email") as string
  console.log(">>> SUBSCRIBE ACTION CALLED with email:", email)

  // Validate email
  const result = subscribeSchema.safeParse({ email })
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  try {
    // Check if already subscribed
    const existing = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email))
      .limit(1)

    if (existing.length > 0) {
      return { success: true, message: "You're already subscribed!" }
    }

    // Insert new subscriber
    await db.insert(subscribers).values({ email })

    // Send welcome email
    console.log("--- STARTING EMAIL SENDING PROCESS ---")
    if (process.env.RESEND_API_KEY) {
      console.log("RESEND_API_KEY is present. Sending email to:", email)
      try {
        const data = await resend.emails.send({
          from: "BeachSeeker <onboarding@resend.dev>",
          to: email,
          subject: "Welcome to Paradise! 🏖️",
          react: <WelcomeEmail email={email} />,
        })
        console.log("Resend API response SUCCESS:", data)
      } catch (error) {
        console.error("Resend API error FAILED:", error)
      }
    } else {
      console.error("CRITICAL ERROR: RESEND_API_KEY is missing from .env file!")
    }
    console.log("--- EMAIL SENDING PROCESS FINISHED ---")

    return { success: true, message: "Thanks for joining! We'll keep you posted on new paradises." }
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return { error: "Something went wrong. Please try again later." }
  }
}

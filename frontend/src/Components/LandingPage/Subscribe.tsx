import { Button, TextInput } from "@mantine/core"
import { useState } from "react"
import { errorNotification, successNotification } from "../../Services/NotificationService"
import AnimatedSection from "../AnimatedSection"

const Subscribe = () => {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubscribe = () => {
    const trimmedEmail = email.trim().toLowerCase()
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)

    if (!trimmedEmail) {
      errorNotification("Email required", "Enter your email address to subscribe.")
      return
    }

    if (!validEmail) {
      errorNotification("Invalid email", "Enter a valid email address.")
      return
    }

    setSubmitting(true)

    const subscribers = JSON.parse(localStorage.getItem("jobnexusSubscribers") || "[]") as string[]

    if (subscribers.includes(trimmedEmail)) {
      setSubmitting(false)
      errorNotification("Already subscribed", "This email is already subscribed to job news.")
      return
    }

    localStorage.setItem("jobnexusSubscribers", JSON.stringify([...subscribers, trimmedEmail]))
    setEmail("")
    setSubmitting(false)
    successNotification("Subscribed", "You will receive the latest JobNexus updates.")
  }

  return (
    <AnimatedSection animation="fade-in-bottom" className="site-container mb-14 flex flex-col sm:flex-row site-grid-gap items-center bg-mine-shaft-900 px-4 py-6 sm:px-6 sm:py-4 lg:px-8 rounded-xl justify-center sm:justify-around">
      <div className="text-2xl sm:text-3xl md:text-4xl w-full sm:w-2/5 text-center font-semibold text-mine-shaft-100">Never Wants to Miss Any <span className="text-bright-sun-400">Job News</span></div>
        <div className="flex flex-col sm:flex-row gap-4 rounded-xl bg-mine-shaft-700 px-3 py-2 items-center w-full sm:w-auto"> 
            <TextInput
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSubscribe()
            }}
            className="w-full sm:w-auto [&_input]:text-mine-shaft-100! font-semibold"
            variant="unstyled"
            placeholder="Your@gmail.com"
            size="md"
            />
            <Button loading={submitting} onClick={handleSubscribe} className="rounded-lg w-full sm:w-auto" size="md" color="brightSun.4" variant="filled">Subscribe</Button>
        </div>
    </AnimatedSection>
  )
}

export default Subscribe

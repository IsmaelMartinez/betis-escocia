import { redirect } from "next/navigation";

export default function GDPRPage() {
  // GDPR page hidden - we don't store user data
  redirect("/");
}

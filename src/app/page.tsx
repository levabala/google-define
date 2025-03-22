import { redirect, RedirectType } from "next/navigation";

export default function MainWrapper() {
    redirect("/vocabulary", RedirectType.replace);
}

import { redirect, RedirectType } from "next/navigation";

export default function MainWrapper() {
    console.log('------- root page with redirect');
    redirect("/vocabulary", RedirectType.replace);
}

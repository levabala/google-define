import { RateLimiter } from "./utils/rateLimiter";
import { OpenAI } from "openai";

const rateLimiter = new RateLimiter(10, 1000);

type CreateParams = Parameters<
    InstanceType<typeof OpenAI>["chat"]["completions"]["create"]
>;

export async function ai(...args: CreateParams) {
    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
    });

    if (!rateLimiter.allowRequest()) {
        throw new Error("rate limited");
    }

    const start = Date.now();
    console.log("hit ai api");
    const res = await openai.chat.completions.create(...args);
    console.log("ai api has responded", `${Date.now() - start}ms`);

    return res;
}

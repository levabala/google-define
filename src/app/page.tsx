"use client";

import dynamic from "next/dynamic";
import { Main } from "./Main";

export default dynamic(() => Promise.resolve(Main), {
    ssr: false,
});

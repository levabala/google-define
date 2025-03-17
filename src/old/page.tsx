"use client";

import dynamic from "next/dynamic";
import { Main } from "../Mainain";

export default dynamic(() => Promise.resolve(Main), {
    ssr: false,
});

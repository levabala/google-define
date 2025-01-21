import { test, expect } from "bun:test";
import { screen, render } from "@testing-library/react";
import { ToggleSwitch } from "./components/ToggleSwitch";

test("Can use Testing Library", () => {
    render(
        <ToggleSwitch
            checked
            onChange={() => {}}
            leftLabel="asd"
            rightLabel="qwe"
        />,
    );
    const myComponent = screen.getByText("asd");
    expect(myComponent).toBeInTheDocument();
});

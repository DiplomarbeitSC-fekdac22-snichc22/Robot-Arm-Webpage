import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import App from "../App";


function getElement(
    container: HTMLElement,
    selector: string,
): HTMLElement {
    const element = container.querySelector<HTMLElement>(selector);

    if (!element) {
        throw new Error(`Element not found: ${selector}`);
    }

    return element;
}


describe("Camera selector", () => {
    beforeEach(() => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => [],
            }),
        );
    });


    it("shows two cameras by default", () => {
        const { container } = render(<App />);

        const cameraGrid = getElement(
            container,
            ".camera-grid",
        );

        expect(cameraGrid).toHaveClass("two-cameras");
        expect(cameraGrid).not.toHaveClass("one-camera");

        expect(
            container.querySelectorAll(".camera-card"),
        ).toHaveLength(2);
    });


    it("shows one camera after clicking the switch", async () => {
        const user = userEvent.setup();
        const { container } = render(<App />);

        const toggle = getElement(
            container,
            ".apple-toggle",
        );

        await user.click(toggle);

        const cameraGrid = getElement(
            container,
            ".camera-grid",
        );

        expect(cameraGrid).toHaveClass("one-camera");
        expect(cameraGrid).not.toHaveClass("two-cameras");

        expect(
            container.querySelectorAll(".camera-card"),
        ).toHaveLength(1);
    });
});
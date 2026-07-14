import {
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import App from "../App";


type TestObject = {
    id: number;
    class_name: string;
    name: string;
    label: string;
    confidence: number;
    score: number;
    crop_url: string;
    image_url: string;
    center: {
        x: number;
        y: number;
    };
};


const mannerObject: TestObject = {
    id: 1,

    // Several names are included because your current backend
    // may use class_name, name, or label.
    class_name: "Manner",
    name: "Manner",
    label: "Manner",

    confidence: 0.91,
    score: 0.91,

    crop_url: "/static/crops/manner-1.jpg",
    image_url: "/static/crops/manner-1.jpg",

    center: {
        x: 320,
        y: 240,
    },
};


const carObject: TestObject = {
    id: 2,
    class_name: "Car",
    name: "Car",
    label: "Car",
    confidence: 0.87,
    score: 0.87,
    crop_url: "/static/crops/car-1.jpg",
    image_url: "/static/crops/car-1.jpg",
    center: {
        x: 550,
        y: 310,
    },
};


function createObjectsPayload(objects: TestObject[]) {
    /*
     * This allows the mock to work with either:
     *
     * response.json() -> [...]
     *
     * or:
     *
     * response.json() -> { objects: [...] }
     */

    const payload = [...objects] as TestObject[] & {
        objects: TestObject[];
        detections: TestObject[];
        detected_objects: TestObject[];
    };

    payload.objects = objects;
    payload.detections = objects;
    payload.detected_objects = objects;

    return payload;
}


function createResponse(
    data: unknown,
    ok = true,
): Response {
    return {
        ok,
        status: ok ? 200 : 500,
        json: async () => data,
    } as Response;
}


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


describe("Robot Arm frontend", () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        fetchMock.mockResolvedValue(
            createResponse(
                createObjectsPayload([]),
            ),
        );

        vi.stubGlobal("fetch", fetchMock);
    });


    it("renders the main application", () => {
        const { container } = render(<App />);

        expect(
            container.querySelector(".app-shell"),
        ).toBeInTheDocument();

        expect(
            container.querySelector(".navbar"),
        ).toBeInTheDocument();

        expect(
            container.querySelector(".sidebar"),
        ).toBeInTheDocument();

        expect(
            container.querySelector(".terminal"),
        ).toBeInTheDocument();
    });


    it("starts in two-camera mode", () => {
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


    it("switches from two cameras to one camera", async () => {
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


    it("switches back to two-camera mode", async () => {
        const user = userEvent.setup();
        const { container } = render(<App />);

        const toggle = getElement(
            container,
            ".apple-toggle",
        );

        await user.click(toggle);
        await user.click(toggle);

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


    it("requests detected objects when the refresh button is clicked", async () => {
        const user = userEvent.setup();

        const { container } = render(<App />);

        const refreshButton = getElement(
            container,
            ".refresh-button",
        );

        await user.click(refreshButton);

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalled();
        });

        const requestedUrls = fetchMock.mock.calls.map(
            ([url]) => String(url),
        );

        expect(
            requestedUrls.some((url) =>
                url.includes("/objects"),
            ),
        ).toBe(true);
    });


    it("renders objects returned by the backend", async () => {
        fetchMock.mockResolvedValue(
            createResponse(
                createObjectsPayload([
                    mannerObject,
                    carObject,
                ]),
            ),
        );

        const user = userEvent.setup();

        const { container } = render(<App />);

        const refreshButton = getElement(
            container,
            ".refresh-button",
        );

        await user.click(refreshButton);

        expect(
            await screen.findByText("Manner"),
        ).toBeInTheDocument();

        expect(
            await screen.findByText("Car"),
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(
                container.querySelectorAll(".object-card"),
            ).toHaveLength(2);
        });
    });


    it("renders the crop image for a detected object", async () => {
        fetchMock.mockResolvedValue(
            createResponse(
                createObjectsPayload([
                    mannerObject,
                ]),
            ),
        );

        const user = userEvent.setup();

        const { container } = render(<App />);

        await user.click(
            getElement(
                container,
                ".refresh-button",
            ),
        );

        await screen.findByText("Manner");

        const objectImage =
            container.querySelector<HTMLImageElement>(
                ".object-card img",
            );

        expect(objectImage).toBeInTheDocument();

        expect(objectImage?.src).toContain(
            "manner-1.jpg",
        );
    });


    it("selects an object when its card is clicked", async () => {
        fetchMock.mockResolvedValue(
            createResponse(
                createObjectsPayload([
                    mannerObject,
                ]),
            ),
        );

        vi.spyOn(
            Math,
            "random",
        ).mockReturnValue(0.5);

        const user = userEvent.setup();

        const { container } = render(<App />);

        await user.click(
            getElement(
                container,
                ".refresh-button",
            ),
        );

        await screen.findByText("Manner");

        const objectCard = getElement(
            container,
            ".object-card",
        );

        await user.click(objectCard);

        await waitFor(() => {
            const targetBox =
                container.querySelector(".target-box");

            expect(targetBox).toBeInTheDocument();
            expect(targetBox).toHaveTextContent("Manner");
        });
    });


    it("does not crash when the backend returns no objects", async () => {
        fetchMock.mockResolvedValue(
            createResponse(
                createObjectsPayload([]),
            ),
        );

        const user = userEvent.setup();

        const { container } = render(<App />);

        await user.click(
            getElement(
                container,
                ".refresh-button",
            ),
        );

        await waitFor(() => {
            expect(
                container.querySelectorAll(".object-card"),
            ).toHaveLength(0);
        });

        expect(
            container.querySelector(".app-shell"),
        ).toBeInTheDocument();
    });


    it("re-enables the refresh button after a backend failure", async () => {
        const consoleErrorMock = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        fetchMock.mockRejectedValue(
            new Error("Backend unavailable"),
        );

        const { container } = render(<App />);

        const refreshButton = getElement(
            container,
            ".refresh-button",
        ) as HTMLButtonElement;

        fireEvent.click(refreshButton);

        await waitFor(() => {
            expect(refreshButton).toBeEnabled();
        });

        expect(consoleErrorMock).toHaveBeenCalled();

        expect(
            container.querySelector(".app-shell"),
        ).toBeInTheDocument();
    });
});
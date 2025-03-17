console.log("------------------------- youtube-captions-adapter init");

const host =
    localStorage.getItem("YOUTUBE_CAPTIONS_ADAPTER_TARGET_HOST") ||
    "http://localhost:3000/";
localStorage.setItem("YOUTUBE_CAPTIONS_ADAPTER_TARGET_HOST", host);

const enableCaptionsButton = document.querySelector(
    'button[data-title-no-tooltip="Subtitles/closed captions"]',
);

const areCaptionsEnabled =
    enableCaptionsButton.getAttribute("aria-pressed") === "true";

if (!areCaptionsEnabled) {
    enableCaptionsButton.click();
}

const captionsContainer = document.getElementById(
    "ytp-caption-window-container",
);

captionsContainer.addEventListener("click", (e) => {
    if (!e.target.getAttribute("caption-text-node") === "true") {
        return;
    }

    const text = e.target.textContent.trim();
    const url = host + "?word=" + text;
    console.log(url);
    window.open(url);
});

// Configuration for the observer
const config = {
    childList: true, // Observe direct children
    subtree: true, // Observe all descendants
    characterData: true, // Observe text changes
};

// Callback function for the observer
const callback = (mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
            // Check added nodes
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const nodeWrapped = document.createElement("span");
                    nodeWrapped.textContent = node.textContent;
                    nodeWrapped.setAttribute("caption-text-node", "true");
                    node.replaceWith(nodeWrapped);

                    nodeWrapped.addEventListener("mouseenter", () => {
                        nodeWrapped.style.outline = "solid gray 1px";
                        nodeWrapped.style.outlineOffset = "-1px";
                    });

                    nodeWrapped.addEventListener("mouseleave", () => {
                        nodeWrapped.style.outline = "";
                        nodeWrapped.style.outlineOffset = "";
                    });
                }
            });
        } else if (mutation.type === "characterData") {
            // Handle direct text changes
            wrapTextSegments(mutation.target);
        }
    }
};

// Create a MutationObserver instance
const observer = new MutationObserver(callback);

// Start observing the target node
observer.observe(captionsContainer, config);

// captionsContainer.style.visibility = "hidden";

// enableCaptionsButton.addEventListener("click", () => {
//     captionsContainer.style.visibility = "visible";
// });

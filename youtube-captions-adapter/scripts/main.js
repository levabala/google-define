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

function showToast(message, duration = 3000) {
    // Create the toast container
    const toast = document.createElement("div");
    toast.textContent = message;

    // Style the toast
    Object.assign(toast.style, {
        position: "fixed",
        bottom: "20px",
        left: "50px",
        backgroundColor: "#333",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: "5px",
        fontSize: "14px",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
        opacity: "0",
        transition: "opacity 0.3s ease-in-out",
        zIndex: "1000",
    });

    // Append the toast to the body
    document.body.appendChild(toast);

    // Show the toast (fade in)
    setTimeout(() => {
        toast.style.opacity = "1";
    }, 10);

    // Remove the toast after the specified duration
    setTimeout(() => {
        toast.style.opacity = "0"; // Fade out
        setTimeout(() => {
            document.body.removeChild(toast); // Remove from DOM
        }, 300); // Match the fade-out duration
    }, duration);
}

captionsContainer.addEventListener("click", (e) => {
    if (!e.target.getAttribute("caption-text-node") === "true") {
        return;
    }

    const text = e.target.textContent.trim();
    const url = host + "api/addWord?word=" + text + "&exit=1";

    console.log(url);
    window.open(url);

    showToast('Added', 2000);
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

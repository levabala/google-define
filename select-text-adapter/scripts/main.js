console.log("------------------------- Text Selection Popup Init");

const host =
    localStorage.getItem("YOUTUBE_CAPTIONS_ADAPTER_TARGET_HOST") ||
    "http://localhost:3000/";
localStorage.setItem("YOUTUBE_CAPTIONS_ADAPTER_TARGET_HOST", host);

// Create popup icon element (hidden by default)
// Using an inline SVG for a minimalistic plus icon (smaller size)
const popupIcon = document.createElement("div");
popupIcon.innerHTML = `
`;
Object.assign(popupIcon.style, {
    position: "absolute",
    width: "20px",
    height: "20px",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
    zIndex: "10000",
    display: "none",
    transform: "translate(-50%, -50%)", // Center the icon based on its size
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "50%",
});
document.body.appendChild(popupIcon);

// Utility function to show a toast notification
function showToast(message, duration = 3000) {
    const toast = document.createElement("div");
    toast.textContent = message;
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
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "1";
    }, 10);
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, duration);
}

// Function to trigger the API call, toast, and open a new window
function triggerAction(text) {
    const url =
        host + "api/addWord?word=" + encodeURIComponent(text) + "&exit=1";
    console.log(url);
    window.open(url, '_blank');
    showToast("Added", 2000);
}

// Helper: Hide popup and remove its click handler
function hidePopup() {
    popupIcon.style.display = "none";
    popupIcon.onclick = null;
}

// Display popup near the selected text on mouseup
document.addEventListener("mouseup", () => {
    // Use a small delay to ensure the selection is updated.
    setTimeout(() => {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        // Do not display popup if there's no text selected.
        if (!text) {
            hidePopup();
            return;
        }

        // Get the bounding rectangle of the selection.
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Position the popup icon so that it does not overlap the text.
        // We'll place it at the right edge of the selection, with a small gap (5px).
        const top = rect.top + window.scrollY + rect.height * 1.25;
        const left = rect.left + window.scrollX + rect.width + 10;

        popupIcon.style.top = `${top}px`;
        popupIcon.style.left = `${left}px`;

        // Attach a click handler to trigger the action.
        popupIcon.onclick = (ev) => {
            ev.stopPropagation();
            triggerAction(text);
            hidePopup();
            selection.removeAllRanges();
        };

        // Display the popup icon.
        popupIcon.style.display = "block";
    }, 10);
});

// Modify document click event to hide the popup only if the click target
// is not the popup icon.
document.addEventListener("click", (e) => {
    if (!popupIcon.contains(e.target)) {
        hidePopup();
    }
});

// Optionally, hide the popup when the user scrolls or presses Escape.
window.addEventListener("scroll", hidePopup);
document.addEventListener("keyup", (e) => {
    if (e.key === "Escape") {
        hidePopup();
    }
});

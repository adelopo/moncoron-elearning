import axios from "axios";
const csrf = document.querySelector('input[name = "_token"]')?.value;
export const getPermissions = () => {
    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }

    // Some browsers partially implement mediaDevices. We can't just assign an object
    // with getUserMedia as it would overwrite existing properties.
    // Here, we will just add the getUserMedia property if it's missing.
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
            // First get ahold of the legacy getUserMedia, if present
            const getUserMedia =
                navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            // Some browsers just don't implement it - return a rejected promise with an error
            // to keep a consistent interface
            if (!getUserMedia) {
                return Promise.reject(
                    new Error("getUserMedia is not implemented in this browser")
                );
            }

            // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
            return new Promise((resolve, reject) => {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        };
    }
    navigator.mediaDevices.getUserMedia =
        navigator.mediaDevices.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;

    return new Promise((resolve, reject) => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                resolve(stream);
            })
            .catch((err) => {
                reject(err);
                //   throw new Error(`Unable to fetch stream ${err}`);
            });
    });
};

// getthenotifications-all-andactions-here
const readAllnotification = document.getElementById("querymarkread");
readAllnotification?.addEventListener("click", async () => {
    // make-post-req
    try {
        axios.post(
            "/notification/markallasread",
            {},
            {
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrf,
                },
            }
        );
    } catch (err) {
        window.alert("Error marking as read!");
    }
});

// get-vide-duration
// export function getDuration(videoElement) {
//     return new Promise((resolve) => {
//         videoElement.addEventListener("loadedmetadata", () => {
//             const videoDuration = videoElement.duration;

//             // Convert to minutes and seconds
//             const minutes = Math.floor(videoDuration / 60);
//             const seconds = Math.floor(videoDuration % 60);

//             // Resolve the Promise with the formatted time
//             resolve(`${minutes}m ${seconds}s`);
//         });
//     });
// }
export function getDuration(videoElement) {
    return new Promise((resolve) => {
        // if video loaded -already
        if (videoElement.readyState >= 1) {
            const videoDuration = videoElement.duration;

            // Convert to minutes and seconds
            const minutes = Math.floor(videoDuration / 60);
            const seconds = Math.floor(videoDuration % 60);
            resolve(`${minutes}m ${seconds}s`);
        } else {
            videoElement.addEventListener("loadedmetadata", () => {
                const videoDuration = videoElement.duration;

                // Convert to minutes and seconds
                const minutes = Math.floor(videoDuration / 60);
                const seconds = Math.floor(videoDuration % 60);
                resolve(`${minutes}m ${seconds}s`);
            });
        }
    });
}

// clean_node-elements

export function flushNodes(nodel) {
    if (nodel) {
        for (const nodes of nodel?.childNodes) {
            nodes.remove();
        }
    }
}

export function handleUpload(type, upload, wrappwr) {
    let format;
    if (upload) {
        // create-mock-image or audio
        // blob_url
        const url = URL.createObjectURL(upload);
        switch (type) {
            case "video":
                format = document.createElement(`video`);
                format.setAttribute("src", url);
                format.setAttribute("controls", true);
                // format.setAttribute("autoplay", false);
                format.classList.add("pop_upload_file");
                break;
            case "audio":
                format = document.createElement(`audio`);
                format.setAttribute("src", url);
                format.setAttribute("controls", true);
                break;
            default:
                throw new Error("unknown file type");
        }
    }
    wrappwr.appendChild(format);
}

export function initializeplayers() {
    const audioElement = document.querySelector("audio");
    if (audioElement) {
        const player = new Plyr(audioElement, {});
        window.player = player;
    } else {
        console.warn("No audio element found.");
    }

    // Initialize video players
    const videoElements = document.querySelectorAll("video");
    if (videoElements.length > 0) {
        const players = Array.from(videoElements).map(
            (video) => new Plyr(video)
        );
        window.players = players;
    } else {
        console.warn("No video elements found.");
    }
}

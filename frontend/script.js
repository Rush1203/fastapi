const API_URL = "http://127.0.0.1:8000"; // Adjust if deployed elsewhere

// Upload a file
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById("fileInput");
    const captionInput = document.getElementById("captionInput");

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("caption", captionInput.value);

    try {
        const response = await fetch(`${API_URL}/upload`, {
            method: "POST",
            body: formData,
            credentials: "include" // if using cookie-based auth
        });

        if (!response.ok) {
            const error = await response.json();
            alert("Error: " + error.detail);
            return;
        }

        alert("Upload successful!");
        fileInput.value = "";
        captionInput.value = "";
        loadFeed();

    } catch (err) {
        console.error(err);
        alert("Upload failed.");
    }
});

// Load feed
async function loadFeed() {
    const feedDiv = document.getElementById("feed");
    feedDiv.innerHTML = "<p>Loading...</p>";

    try {
        const response = await fetch(`${API_URL}/feed`, { credentials: "include" });
        if (!response.ok) throw new Error("Failed to load feed");

        const data = await response.json();
        feedDiv.innerHTML = "";

        data.posts.forEach(post => {
            const postDiv = document.createElement("div");
            postDiv.className = "post";

            let media;
            if (post.file_type === "video") {
                media = document.createElement("video");
                media.src = post.url;
                media.controls = true;
            } else {
                media = document.createElement("img");
                media.src = post.url;
            }

            const caption = document.createElement("p");
            caption.innerText = post.caption;

            const userEmail = document.createElement("small");
            userEmail.innerText = `By: ${post.email}`;

            postDiv.appendChild(media);
            postDiv.appendChild(caption);
            postDiv.appendChild(userEmail);

            if (post.is_owner) {
                const deleteBtn = document.createElement("button");
                deleteBtn.className = "delete-btn";
                deleteBtn.innerText = "Delete";
                deleteBtn.onclick = () => deletePost(post.id);
                postDiv.appendChild(deleteBtn);
            }

            feedDiv.appendChild(postDiv);
        });

    } catch (err) {
        console.error(err);
        feedDiv.innerHTML = "<p>Error loading feed.</p>";
    }
}

// Delete post
async function deletePost(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            method: "DELETE",
            credentials: "include"
        });

        if (!response.ok) {
            const error = await response.json();
            alert("Error: " + error.detail);
            return;
        }

        alert("Post deleted!");
        loadFeed();

    } catch (err) {
        console.error(err);
        alert("Failed to delete post.");
    }
}

// Load feed on page load
loadFeed();

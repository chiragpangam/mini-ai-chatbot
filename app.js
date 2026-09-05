
const SUPABASE_URL = "https://viguqtshjbqpdtulfwha.supabase.co";

// Put your SUPABASE PUBLISHABLE KEY here
const SUPABASE_KEY = "sb_publishable_BnpeSzBSKY8Si4kTx79Z2g_SVV4tBNA";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("Supabase connected!");


// Wait until HTML is loaded
document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // SIGN UP
    // =========================

    const signupButton = document.getElementById("signup-btn");

    if (signupButton) {

        signupButton.addEventListener("click", async () => {

            const email = document.getElementById("signup-email").value.trim();
            const password = document.getElementById("signup-password").value;
            const message = document.getElementById("signup-message");

            if (!email || !password) {
                message.textContent = "Please enter email and password.";
                return;
            }

            console.log("Creating account...");

            const { data, error } =
                await supabaseClient.auth.signUp({
                    email: email,
                    password: password
                });

            console.log("Supabase response:", data);
            console.log("Supabase error:", error);

            if (error) {
                message.textContent = error.message;
                return;
            }

            message.textContent =
                "Account created successfully!";

        });
    }


    // =========================
    // LOGIN
    // =========================

    const loginButton = document.getElementById("login-btn");

    if (loginButton) {

        loginButton.addEventListener("click", async () => {

            const email =
                document.getElementById("login-email").value.trim();

            const password =
                document.getElementById("login-password").value;

            const message =
                document.getElementById("login-message");

            if (!email || !password) {
                message.textContent =
                    "Please enter email and password.";
                return;
            }

            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

            console.log("Login response:", data);
            console.log("Login error:", error);

            if (error) {
                message.textContent = error.message;
                return;
            }

            message.textContent = "Login successful!";

            // Go to home page
            setTimeout(() => {
                window.location.href = "index.html";
            }, 500);
        });
    }


    // =========================
    // LOGOUT
    // =========================

    const logoutBtn =
        document.getElementById("logout-btn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", async () => {

            console.log("Logout button clicked");

            // IMPORTANT:
            // Use supabaseClient, NOT supabase
            const { error } =
                await supabaseClient.auth.signOut();

            if (error) {

                console.error("Logout error:", error);

                alert(
                    "Logout failed: " + error.message
                );

                return;
            }

            console.log("Logout successful");

            alert("Logged out successfully!");

            window.location.href = "login.html";
        });
    }


    // =========================
    // CHECK CURRENT USER
    // =========================

    checkUser();

});


// =========================
// CHECK USER FUNCTION
// =========================

async function checkUser() {

    const { data, error } =
        await supabaseClient.auth.getUser();

    if (error || !data.user) {

        console.log("No logged-in user");

        return;
    }

    console.log("Current user:", data.user);

    const userInfo =
        document.getElementById("user-info");

    if (userInfo) {
        userInfo.textContent =
            "Logged in as: " + data.user.email;
    }
}

// =========================
// AI CHAT
// =========================

const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-btn");
const chatBox = document.getElementById("chat-box");
const chatLogoutButton = document.getElementById("chat-logout-btn");


// Add message to chat
function addMessage(message, sender) {

    const messageDiv = document.createElement("div");

    if (sender === "user") {
        messageDiv.className = "message user-message";
        messageDiv.innerHTML = `
            <strong>You:</strong>
            <span>${message}</span>
        `;
    } else {
        messageDiv.className = "message bot-message";
        messageDiv.innerHTML = `
            <strong>AI:</strong>
            <span>${message}</span>
        `;
    }

    chatBox.appendChild(messageDiv);

    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}


// Send message
if (sendButton) {

    sendButton.addEventListener("click", sendMessage);

}


// Press Enter to send
if (chatInput) {

    chatInput.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {
            sendMessage();
        }

    });

}


// Chat function
async function sendMessage() {

    const message = chatInput.value.trim();

    if (!message) {
        return;
    }


    // Show user's message
    addMessage(message, "user");


    // Clear input
    chatInput.value = "";


    // Temporary AI response
    setTimeout(() => {

        addMessage(
            "I received your message! 🤖 We will connect the AI API next.",
            "bot"
        );

    }, 500);

}


// =========================
// CHAT LOGOUT
// =========================

if (chatLogoutButton) {

    chatLogoutButton.addEventListener("click", async () => {

        const { error } =
            await supabaseClient.auth.signOut();

        if (error) {

            console.error("Logout error:", error);

            alert("Logout failed: " + error.message);

            return;
        }

        window.location.href = "login.html";

    });

}
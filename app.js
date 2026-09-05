
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
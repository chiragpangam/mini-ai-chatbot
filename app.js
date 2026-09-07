// ============================================================
// MINI AI CHATBOT
// SUPABASE + GROQ
// CHATGPT-STYLE SIDEBAR + PERSISTENT MEMORY
// RESPONSIVE MOBILE SIDEBAR
// ============================================================


// ============================================================
// SUPABASE CONFIGURATION
// ============================================================

const SUPABASE_URL =
    "https://viguqtshjbqpdtulfwha.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_BnpeSzBSKY8Si4kTx79Z2g_SVV4tBNA";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

console.log("Supabase connected.");


// ============================================================
// GLOBAL STATE
// ============================================================

let conversation = [];

let currentChatId = null;

let currentUser = null;

let isSending = false;


// ============================================================
// PAGE LOADED
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log("Mini AI starting...");

        setupSignup();
        setupLogin();
        setupLogout();
        setupChatLogout();

        setupChat();
        setupClearChat();

        await checkUser();

        console.log("Mini AI ready.");

    }
);


// ============================================================
// SIGN UP
// ============================================================

function setupSignup() {

    const signupButton =
        document.getElementById("signup-btn");

    if (!signupButton) {
        return;
    }

    signupButton.addEventListener(
        "click",
        async () => {

            const emailInput =
                document.getElementById(
                    "signup-email"
                );

            const passwordInput =
                document.getElementById(
                    "signup-password"
                );

            const message =
                document.getElementById(
                    "signup-message"
                );

            if (!emailInput || !passwordInput) {
                return;
            }

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;

            if (!email || !password) {

                if (message) {
                    message.textContent =
                        "Please enter email and password.";
                }

                return;
            }

            if (password.length < 6) {

                if (message) {
                    message.textContent =
                        "Password must be at least 6 characters.";
                }

                return;
            }

            const {
                data,
                error
            } =
                await supabaseClient.auth.signUp({
                    email,
                    password
                });

            console.log(
                "Signup response:",
                data
            );

            if (error) {

                console.error(
                    "Signup error:",
                    error
                );

                if (message) {
                    message.textContent =
                        error.message;
                }

                return;
            }

            if (message) {
                message.textContent =
                    "Account created successfully!";
            }

        }
    );
}


// ============================================================
// LOGIN
// ============================================================

function setupLogin() {

    const loginButton =
        document.getElementById("login-btn");

    if (!loginButton) {
        return;
    }

    loginButton.addEventListener(
        "click",
        async () => {

            const emailElement =
                document.getElementById(
                    "login-email"
                );

            const passwordElement =
                document.getElementById(
                    "login-password"
                );

            const message =
                document.getElementById(
                    "login-message"
                );

            if (
                !emailElement ||
                !passwordElement
            ) {
                return;
            }

            const email =
                emailElement.value.trim();

            const password =
                passwordElement.value;

            if (!email || !password) {

                if (message) {
                    message.textContent =
                        "Please enter email and password.";
                }

                return;
            }

            const {
                data,
                error
            } =
                await supabaseClient.auth
                    .signInWithPassword({
                        email,
                        password
                    });

            console.log(
                "Login response:",
                data
            );

            if (error) {

                console.error(
                    "Login error:",
                    error
                );

                if (message) {
                    message.textContent =
                        error.message;
                }

                return;
            }

            if (message) {
                message.textContent =
                    "Login successful!";
            }

            setTimeout(
                () => {
                    window.location.href =
                        "chat.html";
                },
                400
            );

        }
    );
}


// ============================================================
// NORMAL LOGOUT
// ============================================================

function setupLogout() {

    const logoutButton =
        document.getElementById("logout-btn");

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener(
        "click",
        async () => {

            const {
                error
            } =
                await supabaseClient.auth.signOut();

            if (error) {

                alert(
                    "Logout failed: " +
                    error.message
                );

                return;
            }

            window.location.href =
                "login.html";

        }
    );
}


// ============================================================
// CHAT LOGOUT
// ============================================================

function setupChatLogout() {

    const logoutButton =
        document.getElementById(
            "chat-logout-btn"
        );

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener(
        "click",
        async () => {

            const {
                error
            } =
                await supabaseClient.auth.signOut();

            if (error) {

                alert(
                    "Logout failed: " +
                    error.message
                );

                return;
            }

            window.location.href =
                "login.html";

        }
    );
}


// ============================================================
// CHECK USER
// ============================================================

async function checkUser() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getUser();

        if (
            error ||
            !data ||
            !data.user
        ) {

            console.log(
                "No logged-in user."
            );

            return;
        }

        currentUser =
            data.user;

        console.log(
            "Current user:",
            currentUser.email
        );


        // --------------------------------------------------------
        // SHOW USER EMAIL
        // --------------------------------------------------------

        const userInfo =
            document.getElementById(
                "user-info"
            );

        if (userInfo) {

            userInfo.textContent =
                currentUser.email;

        }


        // --------------------------------------------------------
        // ONLY RUN CHAT FUNCTIONS ON CHAT PAGE
        // --------------------------------------------------------

        const chatBox =
            document.getElementById(
                "chat-box"
            );

        if (chatBox) {

            createChatSidebar();

            await loadChatSessions();

        }

    } catch (error) {

        console.error(
            "checkUser error:",
            error
        );

    }
}


// ============================================================
// CREATE CHAT SIDEBAR
// ============================================================

function createChatSidebar() {

    if (
        document.getElementById(
            "chat-sidebar"
        )
    ) {
        return;
    }


    const chatContainer =
        document.querySelector(
            ".chat-container"
        );

    if (!chatContainer) {
        return;
    }


    // --------------------------------------------------------
    // CREATE MAIN WRAPPER
    // --------------------------------------------------------

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.id =
        "chat-app-wrapper";


    chatContainer.parentNode.insertBefore(
        wrapper,
        chatContainer
    );


    wrapper.appendChild(
        chatContainer
    );


    // --------------------------------------------------------
    // CREATE SIDEBAR
    // --------------------------------------------------------

    const sidebar =
        document.createElement(
            "aside"
        );

    sidebar.id =
        "chat-sidebar";


    sidebar.innerHTML = `

        <div class="sidebar-header">

            <div class="sidebar-title">
                🤖 Mini AI
            </div>

            <button
                id="new-chat-btn"
                class="new-chat-btn"
                type="button"
            >
                + New Chat
            </button>

        </div>

        <div class="sidebar-label">
            Your chats
        </div>

        <div
            id="chat-list"
            class="chat-list"
        >
        </div>

        <div class="sidebar-footer">

            <span>
                ${currentUser
                    ? currentUser.email
                    : ""}
            </span>

        </div>

    `;


    wrapper.insertBefore(
        sidebar,
        chatContainer
    );


    // --------------------------------------------------------
    // MOBILE OVERLAY
    // --------------------------------------------------------

    const overlay =
        document.createElement(
            "div"
        );

    overlay.id =
        "mobile-sidebar-overlay";

    wrapper.appendChild(
        overlay
    );


    // --------------------------------------------------------
    // MOBILE MENU BUTTON
    // --------------------------------------------------------

    const menuButton =
        document.createElement(
            "button"
        );

    menuButton.id =
        "mobile-menu-btn";

    menuButton.type =
        "button";

    menuButton.setAttribute(
        "aria-label",
        "Open chat history"
    );

    menuButton.innerHTML =
        "☰";


    const header =
        chatContainer.querySelector(
            ".chat-header"
        );

    if (header) {

        header.appendChild(
            menuButton
        );

    }


    // --------------------------------------------------------
    // MOBILE SIDEBAR FUNCTIONS
    // --------------------------------------------------------

    function openMobileSidebar() {

        sidebar.classList.add(
            "mobile-open"
        );

        overlay.classList.add(
            "mobile-visible"
        );

        document.body.classList.add(
            "mobile-sidebar-open"
        );

    }


    function closeMobileSidebar() {

        sidebar.classList.remove(
            "mobile-open"
        );

        overlay.classList.remove(
            "mobile-visible"
        );

        document.body.classList.remove(
            "mobile-sidebar-open"
        );

    }


    menuButton.addEventListener(
        "click",
        openMobileSidebar
    );


    overlay.addEventListener(
        "click",
        closeMobileSidebar
    );


    // Make close function available
    // to other functions.

    window.closeMiniAISidebar =
        closeMobileSidebar;


    // --------------------------------------------------------
    // ADD RESPONSIVE SIDEBAR CSS
    // --------------------------------------------------------

    addSidebarStyles();


    // --------------------------------------------------------
    // NEW CHAT BUTTON
    // --------------------------------------------------------

    const newChatButton =
        document.getElementById(
            "new-chat-btn"
        );

    if (newChatButton) {

        newChatButton.addEventListener(
            "click",
            async () => {

                closeMobileSidebar();

                await createNewChat();

            }
        );

    }

}


// ============================================================
// SIDEBAR CSS
// ============================================================

function addSidebarStyles() {

    if (
        document.getElementById(
            "mini-ai-sidebar-style"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );

    style.id =
        "mini-ai-sidebar-style";


    style.textContent = `

        /* =====================================================
           MAIN CHAT APP WRAPPER
        ===================================================== */

        body {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }


        #chat-app-wrapper {

            width: 1100px;

            max-width: 96%;

            height: 90vh;

            display: flex;

            position: relative;

            background: #ffffff;

            border-radius: 18px;

            overflow: hidden;

            box-shadow:
                0 15px 40px rgba(0,0,0,0.15);

        }


        /* =====================================================
           SIDEBAR
        ===================================================== */

        #chat-sidebar {

            width: 250px;

            flex-shrink: 0;

            background: #181818;

            color: white;

            display: flex;

            flex-direction: column;

            overflow: hidden;

            z-index: 100;

        }


        .sidebar-header {

            padding: 18px 14px 14px;

        }


        .sidebar-title {

            font-size: 20px;

            font-weight: bold;

            margin-bottom: 15px;

        }


        .new-chat-btn {

            width: 100%;

            padding: 11px 12px;

            border-radius: 9px;

            border: 1px solid #444;

            background: #292929;

            color: white;

            cursor: pointer;

            font-size: 14px;

            text-align: left;

        }


        .new-chat-btn:hover {

            background: #3a3a3a;

        }


        .sidebar-label {

            padding: 8px 15px;

            color: #999;

            font-size: 12px;

            text-transform: uppercase;

        }


        .chat-list {

            flex: 1;

            overflow-y: auto;

            padding: 5px 8px;

        }


        .chat-list::-webkit-scrollbar {

            width: 5px;

        }


        .chat-list::-webkit-scrollbar-thumb {

            background: #444;

            border-radius: 10px;

        }


        .chat-item {

            padding: 11px 12px;

            margin-bottom: 3px;

            border-radius: 8px;

            cursor: pointer;

            font-size: 14px;

            white-space: nowrap;

            overflow: hidden;

            text-overflow: ellipsis;

            color: #ddd;

        }


        .chat-item:hover {

            background: #292929;

        }


        .chat-item.active {

            background: #343434;

            color: white;

        }


        .empty-chats {

            color: #777;

            font-size: 13px;

            padding: 15px 10px;

        }


        .sidebar-footer {

            border-top: 1px solid #333;

            padding: 12px;

            color: #999;

            font-size: 11px;

            overflow: hidden;

            text-overflow: ellipsis;

            white-space: nowrap;

        }


        /* =====================================================
           CHAT CONTAINER
        ===================================================== */

        #chat-app-wrapper .chat-container {

            width: auto !important;

            max-width: none !important;

            height: 100% !important;

            flex: 1 !important;

            min-width: 0 !important;

            border-radius: 0 !important;

            box-shadow: none !important;

        }


        /* =====================================================
           MOBILE MENU
        ===================================================== */

        #mobile-menu-btn {

            display: none;

            position: absolute;

            left: 12px;

            top: 12px;

            width: 42px;

            height: 42px;

            border: none;

            border-radius: 10px;

            background: #f1f1f1;

            color: #222;

            font-size: 22px;

            cursor: pointer;

            z-index: 50;

            align-items: center;

            justify-content: center;

        }


        /* =====================================================
           MOBILE OVERLAY
        ===================================================== */

        #mobile-sidebar-overlay {

            display: none;

            position: absolute;

            inset: 0;

            background: rgba(0,0,0,0.45);

            z-index: 90;

        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {

            html,
            body {

                width: 100% !important;

                min-width: 100% !important;

                height: 100% !important;

                min-height: 100% !important;

                margin: 0 !important;

                padding: 0 !important;

            }


            body {

                display: block !important;

                overflow: hidden !important;

            }


            #chat-app-wrapper {

                width: 100% !important;

                max-width: 100% !important;

                height: 100dvh !important;

                min-height: 100vh !important;

                border-radius: 0 !important;

                box-shadow: none !important;

                display: block !important;

            }


            /* -------------------------------------------------
               SIDEBAR DRAWER
            ------------------------------------------------- */

            #chat-sidebar {

                position: absolute;

                top: 0;

                left: 0;

                bottom: 0;

                width: min(280px, 82vw) !important;

                height: 100%;

                transform:
                    translateX(-105%);

                transition:
                    transform 0.25s ease;

                box-shadow:
                    5px 0 25px rgba(0,0,0,0.3);

                z-index: 100;

            }


            #chat-sidebar.mobile-open {

                transform:
                    translateX(0);

            }


            /* -------------------------------------------------
               CHAT FULL WIDTH
            ------------------------------------------------- */

            #chat-app-wrapper .chat-container {

                width: 100% !important;

                max-width: 100% !important;

                height: 100% !important;

                min-width: 0 !important;

                display: flex !important;

                flex-direction: column !important;

            }


            /* -------------------------------------------------
               MOBILE MENU BUTTON
            ------------------------------------------------- */

            #mobile-menu-btn {

                display: flex;

            }


            /* -------------------------------------------------
               OVERLAY
            ------------------------------------------------- */

            #mobile-sidebar-overlay.mobile-visible {

                display: block;

            }


            /* -------------------------------------------------
               HEADER
            ------------------------------------------------- */

            #chat-app-wrapper
            .chat-container
            .chat-header {

                position: relative;

                padding-left: 65px !important;

                padding-right: 10px !important;

                min-width: 0;

                flex-shrink: 0;

            }


            #chat-app-wrapper
            .chat-container
            .brand {

                min-width: 0;

                max-width:
                    calc(100% - 45px);

            }


            #chat-app-wrapper
            .chat-container
            .brand-info {

                min-width: 0;

            }


            #chat-app-wrapper
            .chat-container
            .brand h1 {

                font-size: 18px;

            }


            #chat-app-wrapper
            .chat-container
            .brand p {

                font-size: 12px;

            }


            #chat-app-wrapper
            .chat-container
            .user-info {

                max-width: 150px;

                overflow: hidden;

                text-overflow: ellipsis;

                white-space: nowrap;

            }


            #chat-app-wrapper
            .chat-container
            .clear-btn {

                font-size: 12px;

                padding: 7px 9px;

                white-space: nowrap;

            }


            /* -------------------------------------------------
               CHAT AREA
            ------------------------------------------------- */

            #chat-app-wrapper
            .chat-container
            .chat-box {

                flex: 1;

                min-height: 0;

                width: 100%;

                overflow-y: auto;

                overflow-x: hidden;

                padding: 15px 12px !important;

                box-sizing: border-box;

            }


            /* -------------------------------------------------
               MESSAGE BUBBLES
            ------------------------------------------------- */

            #chat-app-wrapper
            .chat-container
            .user-message,

            #chat-app-wrapper
            .chat-container
            .bot-message {

                max-width: 88% !important;

                font-size: 15px !important;

                line-height: 1.45;

                overflow-wrap: anywhere;

                word-break: break-word;

            }


            /* -------------------------------------------------
               INPUT AREA
            ------------------------------------------------- */

            #chat-app-wrapper
            .chat-container
            .input-area {

                width: 100%;

                flex-shrink: 0;

                padding: 8px !important;

                box-sizing: border-box;

            }


            #chat-app-wrapper
            .chat-container
            #message-input {

                min-width: 0;

                width: 100%;

                height: 46px !important;

                font-size: 15px;

            }


            #chat-app-wrapper
            .chat-container
            #send-btn {

                flex-shrink: 0;

                width: 46px !important;

                height: 46px !important;

            }


            /* -------------------------------------------------
               FOOTER
            ------------------------------------------------- */

            #chat-app-wrapper
            .chat-container
            .chat-footer {

                flex-shrink: 0;

                padding: 7px 10px;

                font-size: 10px;

            }

        }


        /* =====================================================
           SMALL PHONES
        ===================================================== */

        @media (max-width: 380px) {

            #chat-app-wrapper
            .chat-container
            .brand h1 {

                font-size: 16px;

            }


            #chat-app-wrapper
            .chat-container
            .brand p {

                display: none;

            }


            #chat-app-wrapper
            .chat-container
            .user-info {

                max-width: 105px;

            }


            #chat-app-wrapper
            .chat-container
            .clear-btn {

                font-size: 11px;

                padding: 6px 7px;

            }


            #chat-app-wrapper
            .chat-container
            .user-message,

            #chat-app-wrapper
            .chat-container
            .bot-message {

                max-width: 92% !important;

                font-size: 14px !important;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}


// ============================================================
// LOAD CHAT SESSIONS
// ============================================================

async function loadChatSessions() {

    if (!currentUser) {
        return;
    }


    const chatList =
        document.getElementById(
            "chat-list"
        );

    if (!chatList) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("chat_sessions")
            .select(
                "id, title, created_at, updated_at"
            )
            .eq(
                "user_id",
                currentUser.id
            )
            .order(
                "updated_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Could not load chats:",
            error
        );

        chatList.innerHTML =
            `
            <div class="empty-chats">
                Could not load chats.
            </div>
            `;

        return;
    }


    chatList.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        chatList.innerHTML =
            `
            <div class="empty-chats">
                No previous chats
            </div>
            `;

        return;
    }


    data.forEach(
        chat => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "chat-item";


            if (
                chat.id === currentChatId
            ) {

                item.classList.add(
                    "active"
                );

            }


            item.textContent =
                chat.title ||
                "New Chat";


            item.title =
                chat.title ||
                "New Chat";


            item.dataset.chatId =
                chat.id;


            item.addEventListener(
                "click",
                () => {

                    loadChat(
                        chat.id
                    );

                }
            );


            chatList.appendChild(
                item
            );

        }
    );

}


// ============================================================
// CREATE NEW CHAT
// ============================================================

async function createNewChat() {

    currentChatId =
        null;

    conversation =
        [];


    const chatBox =
        document.getElementById(
            "chat-box"
        );


    if (chatBox) {

        chatBox.innerHTML =
            "";

        addMessage(
            "Hello! 👋 I'm your AI assistant. How can I help you?",
            "bot"
        );

    }


    updateSidebarActive();


    const input =
        document.getElementById(
            "message-input"
        );


    if (input) {
        input.focus();
    }


    console.log(
        "New chat started."
    );

}


// ============================================================
// LOAD SPECIFIC CHAT
// ============================================================

async function loadChat(
    chatId
) {

    if (!currentUser) {
        return;
    }


    console.log(
        "Loading chat:",
        chatId
    );


    const {
        data,
        error
    } =
        await supabaseClient
            .from("chat_messages")
            .select(
                "id, role, content, created_at"
            )
            .eq(
                "chat_id",
                chatId
            )
            .eq(
                "user_id",
                currentUser.id
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Could not load chat:",
            error
        );

        alert(
            "Could not load this chat."
        );

        return;
    }


    currentChatId =
        chatId;

    conversation =
        [];


    const chatBox =
        document.getElementById(
            "chat-box"
        );


    if (chatBox) {

        chatBox.innerHTML =
            "";

    }


    if (
        !data ||
        data.length === 0
    ) {

        if (chatBox) {

            addMessage(
                "Hello! 👋 I'm your AI assistant. How can I help you?",
                "bot"
            );

        }

    } else {

        data.forEach(
            message => {

                const role =
                    message.role ===
                    "assistant"
                        ? "assistant"
                        : "user";


                conversation.push({

                    role:

                        role,

                    content:
                        message.content

                });


                addMessage(
                    message.content,
                    role === "user"
                        ? "user"
                        : "bot"
                );

            }
        );

    }


    updateSidebarActive();


    // Close mobile drawer
    // after selecting a chat.

    if (
        window.closeMiniAISidebar
    ) {

        window.closeMiniAISidebar();

    }


    const input =
        document.getElementById(
            "message-input"
        );


    if (input) {

        input.focus();

    }


    console.log(
        "Chat loaded."
    );

}


// ============================================================
// UPDATE SIDEBAR ACTIVE CHAT
// ============================================================

function updateSidebarActive() {

    document
        .querySelectorAll(
            ".chat-item"
        )
        .forEach(
            item => {

                if (
                    item.dataset.chatId ===
                    currentChatId
                ) {

                    item.classList.add(
                        "active"
                    );

                } else {

                    item.classList.remove(
                        "active"
                    );

                }

            }
        );

}


// ============================================================
// CREATE CHAT SESSION
// ============================================================

async function createChatSession(
    firstMessage
) {

    if (!currentUser) {
        return null;
    }


    const title =
        createChatTitle(
            firstMessage
        );


    const {
        data,
        error
    } =
        await supabaseClient
            .from("chat_sessions")
            .insert([
                {
                    user_id:
                        currentUser.id,

                    title:
                        title
                }
            ])
            .select()
            .single();


    if (error) {

        console.error(
            "Could not create chat:",
            error
        );

        return null;
    }


    currentChatId =
        data.id;


    await loadChatSessions();


    updateSidebarActive();


    return data.id;

}


// ============================================================
// CREATE CHAT TITLE
// ============================================================

function createChatTitle(
    message
) {

    let title =
        message
            .replace(/\s+/g, " ")
            .trim();


    if (
        title.length > 35
    ) {

        title =
            title.substring(
                0,
                35
            ) +
            "...";

    }


    return title ||
        "New Chat";

}


// ============================================================
// SAVE MESSAGE
// ============================================================

async function saveMessage(
    role,
    content
) {

    if (
        !currentUser ||
        !currentChatId
    ) {

        console.error(
            "Cannot save message: no active chat."
        );

        return false;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("chat_messages")
            .insert([
                {
                    chat_id:
                        currentChatId,

                    user_id:
                        currentUser.id,

                    role:
                        role,

                    content:
                        content
                }
            ])
            .select();


    if (error) {

        console.error(
            "Could not save message:",
            error
        );

        return false;

    }


    // Update chat timestamp

    await supabaseClient
        .from("chat_sessions")
        .update({
            updated_at:
                new Date().toISOString()
        })
        .eq(
            "id",
            currentChatId
        )
        .eq(
            "user_id",
            currentUser.id
        );


    return true;

}


// ============================================================
// LOAD PERSISTENT MEMORY
// ============================================================

async function loadMemories() {

    if (!currentUser) {
        return [];
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("user_memories")
            .select(
                "id, memory, created_at"
            )
            .eq(
                "user_id",
                currentUser.id
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Could not load memories:",
            error
        );

        return [];

    }


    return data || [];

}


// ============================================================
// SAVE MEMORY
// ============================================================

async function saveMemory(
    memoryText
) {

    if (
        !currentUser ||
        !memoryText
    ) {

        return false;

    }


    const memory =
        memoryText.trim();


    if (!memory) {
        return false;
    }


    // Check duplicate

    const {
        data: existing,
        error: checkError
    } =
        await supabaseClient
            .from("user_memories")
            .select("id")
            .eq(
                "user_id",
                currentUser.id
            )
            .eq(
                "memory",
                memory
            )
            .limit(1);


    if (checkError) {

        console.error(
            "Memory check error:",
            checkError
        );

        return false;

    }


    if (
        existing &&
        existing.length > 0
    ) {

        return true;

    }


    const {
        error
    } =
        await supabaseClient
            .from("user_memories")
            .insert([
                {
                    user_id:
                        currentUser.id,

                    memory:
                        memory
                }
            ]);


    if (error) {

        console.error(
            "Could not save memory:",
            error
        );

        return false;

    }


    console.log(
        "Persistent memory saved:",
        memory
    );


    return true;

}


// ============================================================
// DETECT MEMORY FROM USER MESSAGE
// ============================================================

async function detectAndSaveMemory(
    message
) {

    const text =
        message.trim();


    // --------------------------------------------------------
    // "My name is Chirag"
    // --------------------------------------------------------

    const nameMatch =
        text.match(
            /my name is\s+([a-zA-Z][a-zA-Z\s]{1,30})/i
        );


    if (nameMatch) {

        const name =
            nameMatch[1]
                .trim()
                .replace(
                    /[.!?,]+$/,
                    ""
                );


        await saveMemory(
            "User's name is " +
            name
        );

    }


    // --------------------------------------------------------
    // "Remember that I ..."
    // --------------------------------------------------------

    const rememberMatch =
        text.match(
            /remember(?: that)?\s+(.+)/i
        );


    if (rememberMatch) {

        let memory =
            rememberMatch[1]
                .trim()
                .replace(
                    /[.!?]+$/,
                    ""
                );


        if (
            memory.length > 2 &&
            memory.length < 300
        ) {

            await saveMemory(
                "User says: " +
                memory
            );

        }

    }

}


// ============================================================
// BUILD MEMORY SYSTEM MESSAGE
// ============================================================

async function buildConversationForAI() {

    const memories =
        await loadMemories();


    const memoryText =
        memories
            .map(
                item =>
                    "- " +
                    item.memory
            )
            .join("\n");


    const systemMessage = {

        role:
            "system",

        content:
            `You are Mini AI, a helpful personal AI assistant.

The following are persistent memories about the user.

${memoryText || "No saved memories yet."}

Use these memories naturally when they are relevant.

Do not mention the memory database unless the user asks about it.`

    };


    return [

        systemMessage,

        ...conversation

    ];

}


// ============================================================
// SETUP CHAT
// ============================================================

function setupChat() {

    const messageInput =
        document.getElementById(
            "message-input"
        );


    const sendButton =
        document.getElementById(
            "send-btn"
        );


    if (
        !messageInput ||
        !sendButton
    ) {

        console.log(
            "Chat controls not found."
        );

        return;

    }


    // --------------------------------------------------------
    // SEND BUTTON
    // --------------------------------------------------------

    sendButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            sendMessage();

        }
    );


    // --------------------------------------------------------
    // ENTER KEY
    // --------------------------------------------------------

    messageInput.addEventListener(
        "keydown",
        function (event) {

            if (
                (
                    event.key === "Enter" ||
                    event.code === "Enter"
                ) &&
                !event.shiftKey
            ) {

                event.preventDefault();


                if (!isSending) {

                    sendMessage();

                }

            }

        }
    );


    console.log(
        "Chat controls ready."
    );

}


// ============================================================
// SEND MESSAGE
// ============================================================

async function sendMessage() {

    if (isSending) {
        return;
    }


    const messageInput =
        document.getElementById(
            "message-input"
        );


    const sendButton =
        document.getElementById(
            "send-btn"
        );


    const sendIcon =
        document.getElementById(
            "send-icon"
        );


    if (
        !messageInput ||
        !sendButton
    ) {

        console.error(
            "Chat controls missing."
        );

        return;

    }


    const message =
        messageInput.value.trim();


    if (!message) {

        messageInput.focus();

        return;

    }


    isSending = true;


    // --------------------------------------------------------
    // CREATE CHAT IF NEEDED
    // --------------------------------------------------------

    if (!currentChatId) {

        const newChatId =
            await createChatSession(
                message
            );


        if (!newChatId) {

            alert(
                "Could not create a new chat. Check Supabase."
            );

            isSending = false;

            return;

        }

    }


    // --------------------------------------------------------
    // SHOW USER MESSAGE
    // --------------------------------------------------------

    addMessage(
        message,
        "user"
    );


    conversation.push({

        role:
            "user",

        content:
            message

    });


    // --------------------------------------------------------
    // SAVE USER MEMORY
    // --------------------------------------------------------

    await detectAndSaveMemory(
        message
    );


    // --------------------------------------------------------
    // SAVE USER MESSAGE
    // --------------------------------------------------------

    const saved =
        await saveMessage(
            "user",
            message
        );


    if (!saved) {

        console.error(
            "User message could not be saved."
        );

    }


    messageInput.value =
        "";


    // --------------------------------------------------------
    // LOADING
    // --------------------------------------------------------

    sendButton.disabled =
        true;


    sendButton.classList.add(
        "loading"
    );


    if (sendIcon) {

        sendIcon.textContent =
            "⟳";

    } else {

        sendButton.textContent =
            "⟳";

    }


    try {

        // ----------------------------------------------------
        // BUILD AI CONTEXT INCLUDING MEMORY
        // ----------------------------------------------------

        const aiMessages =
            await buildConversationForAI();


        // ----------------------------------------------------
        // CALL PHP
        // ----------------------------------------------------

        const response =
            await fetch(
                "api/chat.php",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            messages:
                                aiMessages
                        })
                }
            );


        const responseText =
            await response.text();


        console.log(
            "Backend response:",
            responseText
        );


        if (!response.ok) {

            throw new Error(
                "Server returned HTTP " +
                response.status
            );

        }


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        } catch (error) {

            throw new Error(
                "Invalid JSON returned by PHP."
            );

        }


        if (!data.success) {

            throw new Error(
                data.message ||
                "AI request failed."
            );

        }


        const reply =
            data.reply;


        if (!reply) {

            throw new Error(
                "AI returned empty response."
            );

        }


        // ----------------------------------------------------
        // SHOW AI RESPONSE
        // ----------------------------------------------------

        addMessage(
            reply,
            "bot"
        );


        // ----------------------------------------------------
        // ADD AI RESPONSE TO CONVERSATION
        // ----------------------------------------------------

        conversation.push({

            role:
                "assistant",

            content:
                reply

        });


        // ----------------------------------------------------
        // SAVE AI RESPONSE
        // ----------------------------------------------------

        await saveMessage(
            "assistant",
            reply
        );


        // ----------------------------------------------------
        // REFRESH SIDEBAR
        // ----------------------------------------------------

        await loadChatSessions();

        updateSidebarActive();


    } catch (error) {

        console.error(
            "Chat error:",
            error
        );


        addMessage(
            "❌ " +
            error.message,
            "bot"
        );


        // Remove failed user message

        if (
            conversation.length > 0 &&
            conversation[
                conversation.length - 1
            ].role === "user"
        ) {

            conversation.pop();

        }

    } finally {

        isSending =
            false;


        sendButton.disabled =
            false;


        sendButton.classList.remove(
            "loading"
        );


        if (sendIcon) {

            sendIcon.textContent =
                "➤";

        } else {

            sendButton.textContent =
                "➤";

        }


        messageInput.focus();

    }

}


// ============================================================
// ADD MESSAGE TO UI
// ============================================================

function addMessage(
    message,
    sender
) {

    const chatBox =
        document.getElementById(
            "chat-box"
        );


    if (!chatBox) {
        return;
    }


    const messageDiv =
        document.createElement(
            "div"
        );


    if (
        sender === "user"
    ) {

        messageDiv.className =
            "user-message";

    } else {

        messageDiv.className =
            "bot-message";

    }


    messageDiv.textContent =
        message;


    chatBox.appendChild(
        messageDiv
    );


    chatBox.scrollTop =
        chatBox.scrollHeight;

}


// ============================================================
// CLEAR CURRENT CHAT
// ============================================================

function setupClearChat() {

    const clearButton =
        document.getElementById(
            "clear-chat-btn"
        );


    if (!clearButton) {
        return;
    }


    clearButton.addEventListener(
        "click",
        clearChat
    );

}


// ============================================================
// CLEAR CHAT
// ============================================================

async function clearChat() {

    if (!currentUser) {

        alert(
            "Please log in first."
        );

        return;

    }


    if (!currentChatId) {

        alert(
            "There is no active chat to clear."
        );

        return;

    }


    const confirmed =
        confirm(
            "Delete this conversation?"
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("chat_sessions")
            .delete()
            .eq(
                "id",
                currentChatId
            )
            .eq(
                "user_id",
                currentUser.id
            );


    if (error) {

        console.error(
            "Clear chat error:",
            error
        );


        alert(
            "Could not delete chat: " +
            error.message
        );


        return;

    }


    currentChatId =
        null;


    conversation =
        [];


    const chatBox =
        document.getElementById(
            "chat-box"
        );


    if (chatBox) {

        chatBox.innerHTML =
            "";

        addMessage(
            "Hello! 👋 I'm your AI assistant. How can I help you?",
            "bot"
        );

    }


    await loadChatSessions();


    console.log(
        "Current chat deleted."
    );

}


// ============================================================
// AUTH STATE
// ============================================================

supabaseClient.auth.onAuthStateChange(
    (
        event,
        session
    ) => {

        console.log(
            "Auth event:",
            event
        );


        if (
            event === "SIGNED_OUT"
        ) {

            currentUser =
                null;

            currentChatId =
                null;

            conversation =
                [];

        }

    }
);
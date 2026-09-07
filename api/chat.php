<?php

header("Content-Type: application/json");

// ========================================
// LOAD .env
// ========================================

$envFile = __DIR__ . '/../.env';

if (!file_exists($envFile)) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => ".env file not found"
    ]);

    exit;
}


// ========================================
// READ .env
// ========================================

$env = parse_ini_file($envFile);

if (!$env || empty($env["GROQ_API_KEY"])) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Groq API key not found in .env"
    ]);

    exit;
}


$apiKey = trim($env["GROQ_API_KEY"]);


// ========================================
// GET REQUEST DATA
// ========================================

$input = json_decode(
    file_get_contents("php://input"),
    true
);


// ========================================
// GET CONVERSATION
// ========================================

$messages = $input["messages"] ?? [];


// Make sure messages is an array

if (!is_array($messages)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Invalid messages format"
    ]);

    exit;
}


// ========================================
// CHECK MESSAGE
// ========================================

if (empty($messages)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "No messages received"
    ]);

    exit;
}


// ========================================
// LIMIT CONVERSATION SIZE
// ========================================

// Keep the latest 20 messages.
// This prevents the request from becoming
// unnecessarily large.

if (count($messages) > 20) {

    $messages =
        array_slice(
            $messages,
            -20
        );

}


// ========================================
// VALIDATE MESSAGES
// ========================================

$cleanMessages = [];


foreach ($messages as $msg) {

    if (
        !isset($msg["role"]) ||
        !isset($msg["content"])
    ) {

        continue;

    }


    $role =
        $msg["role"];

    $content =
        trim($msg["content"]);


    // Only allow these roles

    if (
        $role !== "user" &&
        $role !== "assistant" &&
        $role !== "system"
    ) {

        continue;

    }


    if ($content === "") {

        continue;

    }


    $cleanMessages[] = [

        "role" => $role,

        "content" => $content

    ];

}


if (empty($cleanMessages)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "No valid messages received"
    ]);

    exit;
}


// ========================================
// GROQ API
// ========================================

$url =
    "https://api.groq.com/openai/v1/chat/completions";


// ========================================
// REQUEST DATA
// ========================================

$data = [

    "model" =>
        "openai/gpt-oss-20b",

    "messages" =>
        $cleanMessages,

    "temperature" =>
        0.7,

    "max_completion_tokens" =>
        1024

];


// ========================================
// CURL REQUEST
// ========================================

$ch =
    curl_init($url);


curl_setopt(
    $ch,
    CURLOPT_RETURNTRANSFER,
    true
);


curl_setopt(
    $ch,
    CURLOPT_POST,
    true
);


curl_setopt(
    $ch,
    CURLOPT_HTTPHEADER,
    [

        "Content-Type: application/json",

        "Authorization: Bearer " .
        $apiKey

    ]
);


curl_setopt(
    $ch,
    CURLOPT_POSTFIELDS,
    json_encode($data)
);


// ========================================
// EXECUTE REQUEST
// ========================================

$response =
    curl_exec($ch);


$httpCode =
    curl_getinfo(
        $ch,
        CURLINFO_HTTP_CODE
    );


$curlError =
    curl_error($ch);


curl_close($ch);


// ========================================
// CURL ERROR
// ========================================

if ($response === false) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            "Connection error",

        "error" =>
            $curlError

    ]);

    exit;
}


// ========================================
// DECODE RESPONSE
// ========================================

$result =
    json_decode(
        $response,
        true
    );


// ========================================
// GROQ API ERROR
// ========================================

if (
    $httpCode < 200 ||
    $httpCode >= 300
) {

    http_response_code(
        $httpCode
    );

    echo json_encode([

        "success" => false,

        "message" =>
            "Groq API error",

        "details" =>
            $result

    ]);

    exit;
}


// ========================================
// GET AI RESPONSE
// ========================================

$reply =
    $result["choices"][0]["message"]["content"]
    ?? null;


// ========================================
// NO RESPONSE
// ========================================

if (!$reply) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            "No response received from Groq",

        "raw" =>
            $result

    ]);

    exit;
}


// ========================================
// SUCCESS
// ========================================

echo json_encode([

    "success" =>
        true,

    "reply" =>
        $reply

]);

?>
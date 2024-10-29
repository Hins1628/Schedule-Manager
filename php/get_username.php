<?php
session_start();
header('Content-Type: application/json');
require 'db.php';

$response = [];

if (isset($_SESSION['username'])) {
    $username = $_SESSION['username'];
    
    // Query the database to get the user details
    $sql = "SELECT username FROM users WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        $response['username'] = $user['username'];
    } else {
        $response['username'] = 'Guest';
    }
} else {
    $response['username'] = 'Guest';
}

echo json_encode($response);
?>
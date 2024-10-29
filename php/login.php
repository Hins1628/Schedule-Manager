<?php
session_start();
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$sql = "SELECT * FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $data['username']);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user && password_verify($data['password'], $user['password'])) {
    $_SESSION['username'] = $data['username'];
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false]);
}
?>
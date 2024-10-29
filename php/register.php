<?php
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$sql = "SELECT * FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $data['username']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(['success' => false]);
} else {
    $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
    $sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $data['username'], $hashed_password);
    $stmt->execute();
    echo json_encode(['success' => true]);
}
?>
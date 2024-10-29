<?php
session_start();
header('Content-Type: application/json');
require 'db.php';

$user = $_SESSION['username'];
$sql = "SELECT id FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $user);
$stmt->execute();
$result = $stmt->get_result();
$user_id = $result->fetch_assoc()['id'];

$sql = "SELECT * FROM tasks WHERE user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$tasks = [];
while ($row = $result->fetch_assoc()) {
    $tasks[] = $row;
}

echo json_encode(['tasks' => $tasks]);
?>
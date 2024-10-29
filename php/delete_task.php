<?php
session_start();
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$user = $_SESSION['username'];

$sql = "SELECT id FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $user);
$stmt->execute();
$result = $stmt->get_result();
$user_id = $result->fetch_assoc()['id'];

$sql = "DELETE FROM tasks WHERE id = ? AND user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $data['id'], $user_id);
$stmt->execute();
?>
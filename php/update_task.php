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

$sql = "UPDATE tasks SET date = ?, title = ?, description = ?, start_time = ?, end_time = ? WHERE id = ? AND user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssssii", $data['date'], $data['title'], $data['description'], $data['startTime'], $data['endTime'], $data['id'], $user_id);
$stmt->execute();
?>
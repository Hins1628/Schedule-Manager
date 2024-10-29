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

$sql = "INSERT INTO tasks (user_id, date, title, description, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("isssss", $user_id, $data['date'], $data['title'], $data['description'], $data['startTime'], $data['endTime']);
$stmt->execute();
?>
<?php
$servername = "localhost";
$username = "root"; // Default XAMPP MySQL username
$password = ""; // Default XAMPP MySQL password is empty
$dbname = "task_manager";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
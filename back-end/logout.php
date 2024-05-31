<?php

session_start();

if (!isset($_SESSION['user_id'])) {
    header('Location: /../../view/authentification.html');
    exit();
}

session_destroy();
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('Location: /../../view/authentification.html');
exit();
<?php

class Database
{
    private static $instance;
    private $conn;

    private const SERVERNAME = "localhost";
    private const USERNAME = "tweeter";
    private const PASSWORD = "tweeter";
    private const DBNAME = "my_tweeter";

    private function __construct()
    {
        $this->conn = new mysqli(self::SERVERNAME, self::USERNAME, self::PASSWORD, self::DBNAME);

        if ($this->conn->connect_error) {
            $this->logError("Erreur de connexion à la base de données : " . $this->conn->connect_error);
            die("Erreur de connexion à la base de données : " . $this->conn->connect_error);
        }
    }

    //* Méthode pour obtenir l'instance unique de Database.
    public static function getInstance()
    {
        if (!self::$instance) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function getConn()
    {
        return $this->conn;
    }

    public function logError($message)
    {
        echo "Erreur DB: $message\n";
    }

    public function close()
    {
        $this->conn->close();
    }
}
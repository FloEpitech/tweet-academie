<?php

class MessagerieModel
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    //* Méthode pour crée un message privé.
    public function createPrivateMessage($sender_id, $recipient_id, $message)
    {
        $stmt = $this->conn->prepare("INSERT INTO users_messages (sender_id, recipient_id, messages) VALUES (?, ?, ?)");
        $stmt->bind_param("iis", $sender_id, $recipient_id, $message);

        if ($stmt->execute()) {
            return true;
        } else {
            return $this->conn->error;
        }
    }

    //* Méthode pour obtenir l'ID d'un utilisateur à partir de son username.
    public function getUserIdFromUsername($username)
    {
        $stmt = $this->conn->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->bind_param("s", $username);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $user = $result->fetch_assoc();
                return $user['id'];
            } else {
                return null;
            }
        } else {
            return $this->conn->error;
        }
    }

    //* Méthode pour obtenir l'ID d'un utilisateur à partir de son username.
    public function getUsernameFromUserId($user_id)
    {
        $stmt = $this->conn->prepare("SELECT username FROM users WHERE id = ?");
        $stmt->bind_param("i", $user_id);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $user = $result->fetch_assoc();
                return $user['username'];
            } else {
                return null;
            }
        } else {
            return $this->conn->error;
        }
    }

    //* Méthode pour récupérer les messages
    public function getMessages($user_id, $recipient_id)
    {
        $stmt = $this->conn->prepare("SELECT * FROM users_messages WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)");
        $stmt->bind_param("iiii", $user_id, $recipient_id, $recipient_id, $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $messages = array();
        while ($row = $result->fetch_assoc()) {
            $messages[] = $row;
        }
        return $messages;
    }

    //* Méthode pour récupérer les conversations
    public function getConversations($user_id)
    {
        $stmt = $this->conn->prepare("
            SELECT DISTINCT
                um.sender_id,
                um.recipient_id,
                su.username as sender_username,
                ru.username as recipient_username,
                sup.profile_picture as sender_profile_picture,
                rup.profile_picture as recipient_profile_picture
            FROM users_messages um
            LEFT JOIN users su ON um.sender_id = su.id
            LEFT JOIN users ru ON um.recipient_id = ru.id
            LEFT JOIN users_preferences sup ON um.sender_id = sup.user_id
            LEFT JOIN users_preferences rup ON um.recipient_id = rup.user_id
            WHERE um.sender_id = ? OR um.recipient_id = ?
        ");
        $stmt->bind_param("ii", $user_id, $user_id);

        if ($stmt->execute()) {
            $result = $stmt->get_result();

            $conversations = array();
            while ($row = $result->fetch_assoc()) {
                $conversations[] = $row;
            }
            return $conversations;
        } else {
            return $this->conn->error;
        }
    }

    //* Méthode pour supprimer une conversation
    public function deleteConversation($sender_id, $recipient_id)
    {
        $stmt = $this->conn->prepare("DELETE FROM users_messages WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)");
        $stmt->bind_param('iiii', $sender_id, $recipient_id, $recipient_id, $sender_id);

        if ($stmt->execute()) {
            return true;
        } else {
            return $stmt->errorInfo();
        }
    }
}

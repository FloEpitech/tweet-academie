<?php
require_once '../config/db_config.php';
require_once '../../back-end/models/messagerie_model.php';

class MessagerieController
{
    private $messagerieModel;

    public function __construct()
    {
        $conn = Database::getInstance()->getConn();
        $this->messagerieModel = new MessagerieModel($conn);
    }

    //* Méthode pour envoyer un message privé.
    public function createPrivateMessage()
    {
        session_start();
        $sender_id = $_SESSION['user_id'];
        $recipient_id = $_POST['recipient_id'];
        $message = $_POST['message'];

        $result = $this->messagerieModel->createPrivateMessage($sender_id, $recipient_id, $message);

        if ($result === true) {
            echo json_encode(['status' => 'success', 'message' => 'Message envoyé avec succès']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Erreur lors de l\'envoi du message: ' . $result]);
        }
    }

    //* Méthode pour obtenir l'ID d'un utilisateur à partir de son username.
    public function getUserIdFromUsername()
    {
        $username = $_POST['username'];
        $id = $this->messagerieModel->getUserIdFromUsername($username);

        if ($id !== null) {
            echo json_encode(['status' => 'success', 'id' => $id]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Aucun utilisateur trouvé avec ce username']);
        }
    }

    //* Méthode pour obtenir l'ID de l'utilisateur connecté.
    public function getConnectedUserId()
    {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }

        if (isset ($_SESSION['user_id'])) {

            error_log('user_id: ' . $_SESSION['user_id']);

            echo json_encode(['status' => 'success', 'id' => $_SESSION['user_id']]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Aucun utilisateur connecté']);
        }
    }

    //* Méthode pour récupérer les messages
    public function getMessages()
    {
        session_start();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $user_id = $_SESSION['user_id'];
            $recipient_id = $_POST['recipient_id'];

            $messages = $this->messagerieModel->getMessages($user_id, $recipient_id);

            if ($messages !== null) {
                foreach ($messages as &$message) {
                    $sender_username = $this->messagerieModel->getUsernameFromUserId($message['sender_id']);
                    $message['username'] = $sender_username;
                }

                echo json_encode(['status' => 'success', 'messages' => $messages]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la récupération des messages']);
            }
        }
    }

    //* Méthode pour récupérer les conversations
    public function getConversations()
    {
        session_start();
        $user_id = $_SESSION['user_id'];

        $conversations = $this->messagerieModel->getConversations($user_id);

        if ($conversations !== null) {
            echo json_encode(['status' => 'success', 'conversations' => $conversations]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la récupération des conversations']);
        }
    }

    //* Méthode pour supprimer une conversation
    public function deleteConversation()
    {
        session_start();
        $sender_id = $_POST['sender_id'];
        $recipient_id = $_POST['recipient_id'];

        $result = $this->messagerieModel->deleteConversation($sender_id, $recipient_id);

        if ($result === true) {
            echo json_encode(['status' => 'success', 'message' => 'Conversation supprimée avec succès']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la suppression de la conversation: ' . $result]);
        }
    }

    //* Méthode pour définir les variables de session
    public function setSessionVariables()
    {
        session_start();
        if (isset ($_POST['sender_id']) && isset ($_POST['recipient_id'])) {
            $_SESSION['sender_id'] = $_POST['sender_id'];
            $_SESSION['recipient_id'] = $_POST['recipient_id'];
            echo json_encode(['status' => 'success', 'message' => 'Variables de session définies avec succès']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la définition des variables de session']);
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset ($_POST['action'])) {
        $action = $_POST['action'];
        $controller = new MessagerieController();

        if ($action === 'createPrivateMessage') {
            $controller->createPrivateMessage();
        } else if ($action === 'getUserIdFromUsername') {
            $controller->getUserIdFromUsername();
        } else if ($action === 'getMessages') {
            $controller->getMessages();
        } else if ($action === 'getConversations') {
            $controller->getConversations();
        } else if ($action === 'deleteConversation') {
            $controller->deleteConversation();
        } else if ($action === 'getConnectedUserId') {
            $controller->getConnectedUserId();
        } else if ($action === 'setSessionVariables') {
            $controller->setSessionVariables();
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Action non spécifiée']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Action non spécifiée']);
    }
}

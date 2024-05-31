<?php

require_once '../config/db_config.php';
require_once '../../back-end/models/user_model.php';

class UserController
{
    private $userModel;

    public function __construct()
    {
        $conn = Database::getInstance()->getConn();
        $this->userModel = new UserModel($conn);
    }

    //* Méthode pour l'inscription d'un utilisateur.
    public function register()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {

            $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
            if (!$email) {
                echo "L'adresse e-mail n'est pas au bon format.";
                return;
            }

            //* On appelle la méthode register_user du modèle UserModel.
            $result = $this->userModel->register_user($_POST);

            if ($result === true) {
                echo "Inscription réussie !";
            } else {
                echo "Erreur lors de l'inscription: " . $result;
            }
        }
    }

    //* Méthode pour la connexion d'un utilisateur.
    public function login()
    {
        if ($_SERVER["REQUEST_METHOD"] === "POST") {

            $email = $_POST['email'];
            $password = $_POST['password'];

            $user = $this->userModel->login_user($email, $password);

            if (session_status() == PHP_SESSION_ACTIVE) {
                session_destroy();
            }

            if (is_array($user)) {
                session_start();
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                echo json_encode(['status' => 'success', 'message' => 'Connexion réussie', 'username' => $user['username'], 'user_id' => $user['id']]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la connexion: ' . $user]);
            }
        }
    }

    //* Méthode pour afficher le profil de l'utilisateur connecté.
    public function profil()
    {
        session_start();

        if ($_SERVER["REQUEST_METHOD"] === "GET") {
            if (isset ($_SESSION['username'])) {
                $username = $_SESSION['username'];

                $user = $this->userModel->profil_user($username);

                if (is_array($user)) {
                    echo json_encode(['status' => 'success', 'user' => $user, 'username' => $username]);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la récupération du profil: ' . $user]);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Utilisateur non connecté']);
            }
        }
    }

    //* Méthode pour mettre à jour le profil de l'utilisateur.
    public function updateProfil()
    {
        session_start();

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (isset ($_SESSION['username'])) {
                $oldUsername = $_SESSION['username'];
                $newUsername = $_POST['username'];
                $bio = $_POST['bio'];
                $localisation = $_POST['localisation'];
                $website = $_POST['website'];

                //* Récupérer l'ID de l'utilisateur à partir de l'ancien nom d'utilisateur
                $userIdResult = $this->userModel->getUserIdByUsername($oldUsername);
                if ($userIdResult === null) {
                    header('Content-Type: application/json');
                    echo json_encode(['status' => 'error', 'message' => 'Utilisateur introuvable']);
                    return;
                }
                $userId = $userIdResult['id'];

                //* Vérifier si le champ username est vide
                if (empty ($newUsername)) {
                    header('Content-Type: application/json');
                    echo json_encode(['status' => 'error', 'message' => 'Veuillez remplir le champ username pour mettre à jour votre profil !']);
                    return;
                }

                //* On vérifie si de nouveaux fichiers ont été téléchargés
                $profilePicture = isset ($_FILES['profile_picture']) ? $_FILES['profile_picture'] : null;
                $profileBanner = isset ($_FILES['profile_banner']) ? $_FILES['profile_banner'] : null;

                //* On vérifie la taille des images téléchargées
                if ($profilePicture['size'] > 2000000) {
                    header('Content-Type: application/json');
                    echo json_encode(['status' => 'error', 'message' => 'Fichier trop volumineux, votre photo de profil ne doit pas dépasser 2 Mo']);
                    return;
                } elseif ($profileBanner['size'] > 2000000) {
                    header('Content-Type: application/json');
                    echo json_encode(['status' => 'error', 'message' => 'Fichier trop volumineux, votre bannière de profil ne doit pas dépasser 2 Mo']);
                    return;
                }

                //* Si un nouveau fichier a été téléchargé, on le déplace dans le dossier uploads
                if ($profilePicture && $profilePicture['error'] === UPLOAD_ERR_OK) {
                    $profilePictureName = $profilePicture['name'];
                    $profilePictureTmp = $profilePicture['tmp_name'];
                    $profilePicturePath = '../../uploads/profile_pictures/' . $profilePictureName;
                    move_uploaded_file($profilePictureTmp, $profilePicturePath);
                } else {
                    $profilePicturePath = null;
                }

                if ($profileBanner && $profileBanner['error'] === UPLOAD_ERR_OK) {
                    $profileBannerName = $profileBanner['name'];
                    $profileBannerTmp = $profileBanner['tmp_name'];
                    $profileBannerPath = '../../uploads/profile_banners/' . $profileBannerName;
                    move_uploaded_file($profileBannerTmp, $profileBannerPath);
                } else {
                    $profileBannerPath = null;
                }

                $result = $this->userModel->updateProfil_user($oldUsername, $newUsername, $bio, $localisation, $website, $profilePicture, $profileBanner);

                header('Content-Type: application/json');

                if ($result === true) {
                    $_SESSION['username'] = $newUsername;
                    echo json_encode(['status' => 'success', 'message' => 'Informations utilisateur mises à jour avec succès']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la mise à jour des informations utilisateur']);
                }
            } else {
                header('Content-Type: application/json');
                echo json_encode(['status' => 'error', 'message' => 'Utilisateur non connecté']);
            }
        } else {
            header('Content-Type: application/json');
            echo json_encode(['status' => 'error', 'message' => 'Méthode de requête incorrecte']);
        }
    }

    //* Méthode pour créer un hashtag.
    public function createHashtag()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $tweet_id = $_POST['tweet_id'];
            $rtweet_id = $_POST['rtweet_id'];
            $hashtag = $_POST['hashtag'];

            if ($hashtag[0] === '#') {
                $result = $this->userModel->create_hashtag($tweet_id, $rtweet_id, $hashtag);
                if ($result === true) {
                    echo json_encode(['status' => 'success', 'message' => 'Hashtag créé avec succès']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la création du hashtag: ' . $result]);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Le hashtag doit commencer par un #']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Méthode de requête incorrecte']);
        }
    }

    //* Méthode pour afficher le profil d'un autre utilisateur.
    public function profil_other_user($username)
    {
        if ($_SERVER["REQUEST_METHOD"] === "GET") {
            if (isset ($_GET['username'])) {
                $username = $_GET['username'];

                $user = $this->userModel->profil_other_user($username);

                if (is_array($user)) {
                    echo json_encode(['status' => 'success', 'user' => $user]);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la récupération du profil: ' . $user]);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Nom d\'utilisateur non fourni']);
            }
        }
    }

    //* Méthode pour rechercher un utilisateur.
    public function search($query)
    {
        if ($_SERVER["REQUEST_METHOD"] === "GET") {

            $result = $this->userModel->search_user($query);

            if (is_array($result)) {
                echo json_encode(['status' => 'success', 'results' => $result]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la recherche: ' . $result]);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Méthode de requête incorrecte']);
        }
    }

    //* Méthode pour follow un utilisateur.
    public function follow()
    {
        session_start();

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (isset ($_SESSION['user_id']) && isset ($_POST['username'])) {
                $follower_id = $_SESSION['user_id'];
                $username = $_POST['username'];
                $following_id = $this->userModel->getUserIdByUsername($username);
                if ($following_id !== null) {
                    $result = $this->userModel->follow_unfollow_user($follower_id, $following_id);
                    if ($result === 'followed') {
                        echo json_encode(['status' => 'success', 'message' => 'Follow réussi']);
                    } elseif ($result === 'unfollowed') {
                        echo json_encode(['status' => 'success', 'message' => 'Unfollow réussi']);
                    } else {
                        echo json_encode(['status' => 'error', 'message' => 'Erreur lors du follow/unfollow : ' . $result]);
                    }
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Username non trouvé']);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Paramètres manquants']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée']);
        }
    }

    //* Méthode pour récupérer l'ID d'un utilisateur.
    public function getLoggedInUserId()
    {
        session_start();

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if (isset ($_SESSION['username'])) {

                echo json_encode(['status' => 'success', 'username' => $_SESSION['username']]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Utilisateur non connecté']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Méthode de requête incorrecte']);
        }
    }

    //* Méthode pour obtenir le nombre de follows d'un utilisateur.
    public function getFollowersCount()
    {
        session_start();

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if (isset ($_GET['username'])) {
                $username = $_GET['username'];
                $followersCount = $this->userModel->getFollowersCount($username);

                echo json_encode(['status' => 'success', 'followersCount' => $followersCount]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Utilisateur non connecté']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Méthode de requête incorrecte']);
        }
    }

    //* Méthode pour obtenir le nombre de followings d'un utilisateur.
    public function getFollowingsCount()
    {
        session_start();

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if (isset ($_GET['username'])) {
                $username = $_GET['username'];
                $followingsCount = $this->userModel->getFollowingsCount($username);

                echo json_encode(['status' => 'success', 'followingsCount' => $followingsCount]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Utilisateur non connecté']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Méthode de requête incorrecte']);
        }
    }

    //* Méthode pour obtenir le nombre de tweets d'un utilisateur.
    public function getTweetsCount()
    {
        session_start();

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if (isset ($_GET['username'])) {
                $username = $_GET['username'];
                $tweetsCount = $this->userModel->getTweetsCount($username);

                echo json_encode(['status' => 'success', 'tweetsCount' => $tweetsCount]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Nom d\'utilisateur non fourni']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Méthode de requête incorrecte']);
        }
    }

    //* Méthode pour obtenir la liste des followers d'un utilisateur.
    public function getFollowersList()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if (isset ($_GET['username'])) {
                $username = $_GET['username'];
                $followersList = $this->userModel->getFollowersList($username);

                echo json_encode(['status' => 'success', 'followersList' => $followersList]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Nom d\'utilisateur non fourni']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Méthode de requête incorrecte']);
        }
    }

    //* Méthode pour obtenir la liste des followings d'un utilisateur.
    public function getFollowingsList()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if (isset ($_GET['username'])) {
                $username = $_GET['username'];
                $followingsList = $this->userModel->getFollowingsList($username);

                echo json_encode(['status' => 'success', 'followingsList' => $followingsList]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Nom d\'utilisateur non fourni']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Méthode de requête incorrecte']);
        }
    }

    //* Méthode pour vérifier si l'utilisateur actuellement connecté suit un autre utilisateur.
    public function isFollowing()
    {
        session_start();

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if (isset ($_SESSION['username']) && isset ($_GET['username'])) {
                $currentUsername = $_SESSION['username'];
                $otherUsername = $_GET['username'];
                $isFollowing = $this->userModel->isFollowing($currentUsername, $otherUsername);

                echo json_encode(['status' => 'success', 'isFollowing' => $isFollowing, 'currentUsername' => $currentUsername]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Utilisateur non connecté ou nom d\'utilisateur non spécifié']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Méthode de requête incorrecte']);
        }
    }

    //* Méthode pour obtenir une liste d'utilisateurs suggérés.
    public function getSuggestedUsers()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $suggestedUsers = $this->userModel->getSuggestedUsers();

            echo json_encode(['status' => 'success', 'suggestedUsers' => $suggestedUsers]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Méthode de requête incorrecte']);
        }
    }

    //* Méthode pour obtenir le thème de l'utilisateur.
    public function getTheme()
    {
        session_start();

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $userId = $_SESSION['user_id'];
            $theme = $this->userModel->getTheme($userId);

            echo json_encode(['status' => 'success', 'theme' => $theme]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Méthode de requête incorrecte']);
        }
    }

    //* Méthode pour mettre à jour le thème de l'utilisateur.
    public function updateTheme()
    {
        session_start();

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $userId = $_SESSION['user_id'];
            $theme = $_POST['theme'];

            error_log("userId: " . $userId);
            error_log("theme: " . $theme);

            $result = $this->userModel->updateTheme($userId, $theme);

            if ($result) {
                echo json_encode([
                    'status' => 'success',
                    'theme' => $theme
                ]);

            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to update theme']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Incorrect request method']);
        }
    }

    //* Méthode pour vérifier si un nom d'utilisateur existe déjà.
    public function check_username()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $username = $_POST['username'];

            $exists = $this->userModel->check_username($username);

            echo json_encode(['exists' => $exists]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Incorrect request method']);
        }
    }

}

//* On crée un nouvel objet de la classe UserController.
$controller = new UserController();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset ($_POST['action'])) {
        $action = $_POST['action'];
        if ($action === 'register') {
            $controller->register();
        } else if ($action === 'login') {
            $controller->login();
        } else if ($action === 'updateProfil') {
            $controller->updateProfil();
        } else if ($action === 'createHashtag') {
            $controller->createHashtag();
        } else if ($action === 'follow') {
            $controller->follow();
        } else if ($action === 'updateTheme') {
            $theme = $_POST['theme'];
            $controller->updateTheme();
        } else if ($action === 'getTheme') {
            $controller->getTheme();
        } else if ($action === 'check_username') {
            $controller->check_username();
        }
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset ($_GET['action'])) {
        $action = $_GET['action'];
        if ($action === 'profil') {
            $controller->profil();
        } else if ($action === 'profil_other_user') {
            if (isset ($_GET['username'])) {
                $username = $_GET['username'];
                $controller->profil_other_user($username);
            }
        } else if ($action === 'search') {
            if (isset ($_GET['query'])) {
                $query = $_GET['query'];
                $controller->search($query);
            }
        } else if ($action === 'getLoggedInUserId') {
            $controller->getLoggedInUserId();
        } else if ($action === 'getFollowersCount') {
            $controller->getFollowersCount();
        } else if ($action === 'getFollowingsCount') {
            $controller->getFollowingsCount();
        } else if ($action === 'getFollowersList') {
            $controller->getFollowersList();
        } else if ($action === 'getFollowingsList') {
            $controller->getFollowingsList();
        } else if ($action === 'isFollowing') {
            $controller->isFollowing();
        } else if ($action === 'getSuggestedUsers') {
            $controller->getSuggestedUsers();
        } else if ($action === 'getTweetsCount') {
            $controller->getTweetsCount();
        }
    }
}
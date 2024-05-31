<?php

class UserModel
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    //* Méthode pour l'inscription d'un utilisateur.
    public function register_user($data)
    {
        extract($data);

        //* On hash le mot de passe avec le salt "vive le projet tweet_academy" en utilisant l'algorithme de hachage "ripemd160".
        $salt = "vive le projet tweet_academy";
        $password_hash = hash('ripemd160', $salt . $password);

        //* On prépare la requête SQL
        $stmt = $this->conn->prepare("INSERT INTO users (genre, email, birthdate, username, firstname, lastname, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)");

        //* On lie les paramètres
        $stmt->bind_param("sssssss", $genre, $email, $birthdate, $username, $firstname, $lastname, $password_hash);

        //* On exécute la requête
        if ($stmt->execute()) {
            return true;
        } else {
            return $this->conn->error;
        }
    }

    //* Méthode pour la connexion d'un utilisateur.
    public function login_user($email, $password)
    {
        $salt = "vive le projet tweet_academy";
        $password_hash = hash('ripemd160', $salt . $password);

        $stmt = $this->conn->prepare("SELECT id, username FROM users WHERE email = ? AND password_hash = ?");
        $stmt->bind_param("ss", $email, $password_hash);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();

            if ($user) {
                session_start();
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];

                return $user;
            } else {
                return 'Email ou mot de passe incorrect';
            }
        } else {
            return $this->conn->error;
        }
    }

    //* Méthode pour récupérer l'ID d'un utilisateur à partir de son username
    public function getUserIdByUsername($username)
    {
        $stmt = $this->conn->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $row = $result->fetch_row();
            return $row[0];
        } else {
            return null;
        }
    }

    //* Méthode pour récupérer l'ID d'un utilisateur à partir de son ID
    public function getUserId($id)
    {
        $stmt = $this->conn->prepare("SELECT id FROM users WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $row = $result->fetch_row();
            return $row[0];
        } else {
            return null;
        }
    }

    //* Méthode pour afficher le profil d'un utilisateur.
    public function profil_user($username)
    {
        $stmt = $this->conn->prepare("SELECT u.*, up.*
                                FROM users u
                                LEFT JOIN users_preferences up ON u.id = up.user_id
                                WHERE u.username = ?");
        $stmt->bind_param("s", $username);


        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();

            if ($user) {
                return $user;
            } else {
                return 'Utilisateur introuvable';
            }
        } else {
            return $this->conn->error;
        }
    }

    //* Méthode pour mettre à jour le profil d'un utilisateur.
    public function updateProfil_user($oldUsername, $newUsername, $bio, $localisation, $website, $profilePicture, $profileBanner)
    {
        //* Récupérer l'ID de l'utilisateur à partir de l'ancien nom d'utilisateur
        $userIdResult = $this->getUserIdByUsername($oldUsername);
        if ($userIdResult === null) {
            return 'Utilisateur introuvable';
        }
        $userId = $userIdResult;

        //* Récupérer le chemin actuel de la photo de profil et de la bannière
        $stmt = $this->conn->prepare("SELECT profile_picture, profile_banner FROM users_preferences WHERE user_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $row = $result->fetch_assoc();
            $currentProfilePicture = $row['profile_picture'];
            $currentProfileBanner = $row['profile_banner'];
        } else {
            $currentProfilePicture = null;
            $currentProfileBanner = null;
        }

        //* Vérifier si un nouveau fichier a été téléchargé pour la photo de profil et de la bannière.
        if ($profilePicture && $profilePicture['error'] === UPLOAD_ERR_OK) {
            $profilePicturePath = '../../uploads/profile_pictures/' . basename($profilePicture['name']);
            move_uploaded_file($profilePicture['tmp_name'], $profilePicturePath);
        } else {
            $profilePicturePath = $currentProfilePicture;
        }

        if ($profileBanner && $profileBanner['error'] === UPLOAD_ERR_OK) {
            $profileBannerPath = '../../uploads/profile_banners/' . basename($profileBanner['name']);
            move_uploaded_file($profileBanner['tmp_name'], $profileBannerPath);
        } else {
            $profileBannerPath = $currentProfileBanner;
        }

        //* Mise à jour du nom d'utilisateur si un nouveau nom d'utilisateur a été saisi.
        if ($newUsername !== null) {
            $stmt = $this->conn->prepare("UPDATE users SET username = ? WHERE id = ?");
            $stmt->bind_param("si", $newUsername, $userId);
            $stmt->execute();
        }

        //* Verifier si l'utilisateur a déjà des préférences
        $stmt = $this->conn->prepare("SELECT * FROM users_preferences WHERE user_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $stmt = $this->conn->prepare("UPDATE users_preferences SET bio = ?, localisation = ?, website = ?, profile_picture = ?, profile_banner = ? WHERE user_id = ?");
            $stmt->bind_param("sssssi", $bio, $localisation, $website, $profilePicturePath, $profileBannerPath, $userId);
            $stmt->execute();
        } else {
            $stmt = $this->conn->prepare("INSERT INTO users_preferences (bio, localisation, website, profile_picture, profile_banner, user_id) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("sssssi", $bio, $localisation, $website, $profilePicturePath, $profileBannerPath, $userId);
            $stmt->execute();
        }

        return true;
    }

    //* Méthode permettant de crée des hashtags
    public function create_hashtag($tweet_id, $rtweet_id, $hashtag)
    {
        $stmt = $this->conn->prepare("INSERT INTO hashtag (tweet_id, rtweet_id, name) VALUES (?, ?, ?)");
        $stmt->bind_param("iis", $tweet_id, $rtweet_id, $hashtag);

        if ($stmt->execute()) {
            return true;
        } else {
            return $this->conn->error;
        }
    }

    //* Méthode pour afficher le profil d'autre utilisateur.
    public function profil_other_user($username)
    {
        $stmt = $this->conn->prepare("SELECT u.*, up.*
                                FROM users u
                                LEFT JOIN users_preferences up ON u.id = up.user_id
                                WHERE u.username = ?");
        $stmt->bind_param("s", $username);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();

            if ($user) {
                return $user;
            } else {
                return 'Utilisateur introuvable';
            }
        } else {
            return $this->conn->error;
        }
    }

    //* Méthode pour rechercher un utilisateur.
    public function search_user($username)
    {
        $username = $username . "%";
        $stmt = $this->conn->prepare("
            SELECT users.*, users_preferences.profile_picture
            FROM users
            LEFT JOIN users_preferences ON users.id = users_preferences.user_id
            WHERE users.username LIKE ?
        ");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        $users = $result->fetch_all(MYSQLI_ASSOC);

        return $users;
    }

    //* Méthode pour suivre un utilisateur.
    public function follow_unfollow_user($follower_id, $following_id)
    {
        $stmt = $this->conn->prepare("SELECT * FROM followers WHERE follower_id = ? AND following_id = ?");
        $stmt->bind_param("ii", $follower_id, $following_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $stmt = $this->conn->prepare("DELETE FROM followers WHERE follower_id = ? AND following_id = ?");
            $stmt->bind_param("ii", $follower_id, $following_id);
        } else {
            $stmt = $this->conn->prepare("INSERT INTO followers (follower_id, following_id) VALUES (?, ?)");
            $stmt->bind_param("ii", $follower_id, $following_id);
        }

        if ($stmt->execute()) {
            return $result->num_rows > 0 ? 'unfollowed' : 'followed';
        } else {
            return $this->conn->error;
        }
    }

    //* Méthode pour obtenir le nombre de follows d'un utilisateur.
    public function getFollowersCount($username)
    {
        $userId = $this->getUserIdByUsername($username);
        if ($userId === null) {
            return null;
        }

        $stmt = $this->conn->prepare("SELECT COUNT(*) FROM followers WHERE following_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $row = $result->fetch_row();
            return $row[0];
        } else {
            return null;
        }
    }

    public function getFollowingsCount($username)
    {
        $userId = $this->getUserIdByUsername($username);
        if ($userId === null) {
            return null;
        }

        $stmt = $this->conn->prepare("SELECT COUNT(*) FROM followers WHERE follower_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $row = $result->fetch_row();
            return $row[0];
        } else {
            return null;
        }
    }

    //* Méthode pour obtenir le nombre de tweets d'un utilisateur.
    public function getTweetsCount($username)
    {
        $userId = $this->getUserIdByUsername($username);
        if ($userId === null) {
            return null;
        }

        $stmt = $this->conn->prepare("SELECT COUNT(*) FROM tweet WHERE user_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $row = $result->fetch_row();
            return $row[0];
        } else {
            return null;
        }
    }

    //* Méthode pour obtenir la liste des followers d'un utilisateur.
    public function getFollowersList($username)
    {
        $userId = $this->getUserIdByUsername($username);
        if ($userId === null) {
            return null;
        }

        $stmt = $this->conn->prepare("
        SELECT users.*, users_preferences.profile_picture
        FROM users
        INNER JOIN followers ON users.id = followers.follower_id
        LEFT JOIN users_preferences ON users.id = users_preferences.user_id
        WHERE followers.following_id = ?
    ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $followers = $result->fetch_all(MYSQLI_ASSOC);

        return $followers;
    }

    //* Méthode pour obtenir la liste des utilisateurs suivis par un utilisateur.
    public function getFollowingsList($username)
    {
        $userId = $this->getUserIdByUsername($username);
        if ($userId === null) {
            return null;
        }

        $stmt = $this->conn->prepare("
        SELECT users.*, users_preferences.profile_picture
        FROM users
        INNER JOIN followers ON users.id = followers.following_id
        LEFT JOIN users_preferences ON users.id = users_preferences.user_id
        WHERE followers.follower_id = ?
    ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $followings = $result->fetch_all(MYSQLI_ASSOC);

        return $followings;
    }

    //* Méthode pour vérifier si un utilisateur suit un autre utilisateur.
    public function isFollowing($currentUsername, $otherUsername)
    {
        $currentUserId = $this->getUserIdByUsername($currentUsername);
        $otherUserId = $this->getUserIdByUsername($otherUsername);
        if ($currentUserId === null || $otherUserId === null) {
            return null;
        }

        $stmt = $this->conn->prepare("
    SELECT COUNT(*)
    FROM followers
    WHERE follower_id = ? AND following_id = ?
    ");
        $stmt->bind_param("ii", $currentUserId, $otherUserId);
        $stmt->execute();
        $result = $stmt->get_result();
        $count = $result->fetch_array(MYSQLI_NUM)[0];

        return $count > 0;
    }

    //* Méthode pour obtenir une liste d'utilisateurs suggérés.
    public function getSuggestedUsers()
    {
        $stmt = $this->conn->prepare("
    SELECT users.*, users_preferences.profile_picture
    FROM users
    LEFT JOIN users_preferences ON users.id = users_preferences.user_id
    ORDER BY RAND()
    LIMIT 10
    ");
        $stmt->execute();
        $result = $stmt->get_result();
        $suggestedUsers = $result->fetch_all(MYSQLI_ASSOC);

        return $suggestedUsers;
    }
    //* Méthode pour obtenir le thème de l'utilisateur.
    public function getTheme($userId)
    {
        $stmt = $this->conn->prepare("
    SELECT theme
    FROM users_preferences
    WHERE user_id = ?
    ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $theme = $result->fetch_assoc();

        return $theme['theme'];
    }

    //* Méthode pour changer le thème de l'utilisateur.
    public function updateTheme($userId, $theme)
    {
        $sql = "UPDATE users_preferences SET theme = ? WHERE user_id = ?";

        $stmt = $this->conn->prepare($sql);

        $stmt->bind_param("ii", $theme, $userId);

        if ($stmt->execute()) {
            return true;
        } else {
            error_log("Failed to update theme: " . $stmt->error);
            return false;
        }
    }

    //* Méthode pour vérifier si un nom d'utilisateur existe déjà.
    public function check_username($username)
    {
        $stmt = $this->conn->prepare("
            SELECT COUNT(*)
            FROM users
            WHERE username = ?
        ");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        $count = $result->fetch_array(MYSQLI_NUM)[0];

        return $count > 0;
    }
}
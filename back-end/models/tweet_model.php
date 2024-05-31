<?php

class TweetModel
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    //* Methode hypothétique pour récupèrer l'username d'un utilisateur par son ID.
    public function get_username_from_id($user_id)
    {
        $stmt = $this->conn->prepare("SELECT username FROM users WHERE id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        return $user['username'];
    }

    //* Methode pour récupèrer les informations de l'utilisateur à l'origine d'un tweet.
    public function get_user_info($user_id)
    {
        $stmt = $this->conn->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        $stmt = $this->conn->prepare("SELECT profile_picture FROM users_preferences WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $user_preferences = $result->fetch_assoc();

        $user['profile_picture'] = $user_preferences['profile_picture'];

        return $user;
    }

    //* Méthode pour récuperer les tweets
    public function get_all_tweets($username = null)
    {
        if ($username) {
            // Si un nom d'utilisateur est fourni, ne renvoyer que les tweets de cet utilisateur
            $query = "SELECT *, CONCAT('../../uploads/tweet_image/', media) AS image_path
                    FROM tweet
                    WHERE user_id = (SELECT id FROM users WHERE username = ?)
                    ORDER BY created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("s", $username);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            // Sinon, renvoyer tous les tweets
            $query = "SELECT *, CONCAT('../../uploads/tweet_image/', media) AS image_path FROM tweet ORDER BY created_at DESC";
            $result = $this->conn->query($query);
        }

        $tweets = array();

        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $tweets[] = $row;
            }
        }
        return $tweets;
    }

    //* Méthode pour créer un tweet
    public function create_post($user, $message, $media)
    {
        $stmt = $this->conn->prepare("INSERT INTO tweet (user_id, message, media, created_at) VALUES (?, ?, ?, NOW())");

        if ($stmt) {
            $stmt->bind_param("iss", $user, $message, $media);

            if ($stmt->execute()) {
                return $this->conn->insert_id;
            } else {
                return "Erreur lors de l'exécution de la requête : " . $stmt->error;
            }
        } else {
            return "Erreur lors de la préparation de la requête : " . $this->conn->error;
        }
    }

    //* Méthode pour créer un commentaire sur un tweet
    public function create_comment($user, $message, $tweet_id)
    {
        $stmt = $this->conn->prepare("INSERT INTO tweet_comment (user_id, message, tweet_id) VALUES (?, ?, ?)");

        if ($stmt) {
            $stmt->bind_param("isi", $user, $message, $tweet_id);

            if ($stmt->execute()) {
                //* On récupère l'username de l'utilisateur pour le retourner dans la réponse
                $stmt = $this->conn->prepare("SELECT profile_picture FROM users_preferences WHERE user_id = ?");
                $stmt->bind_param("i", $user);

                if ($stmt->execute()) {
                    $result = $stmt->get_result();
                    $user_preferences = $result->fetch_assoc();

                    return ['status' => 'success', 'profile_picture' => $user_preferences['profile_picture']];
                } else {
                    return "Erreur lors de l'exécution de la requête : " . $stmt->error;
                }
            } else {
                return "Erreur lors de l'exécution de la requête : " . $stmt->error;
            }
        } else {
            return "Erreur lors de la préparation de la requête : " . $this->conn->error;
        }
    }

    //* Méthode pour faire un retweet
    public function create_retweet($user, $tweet_id, $reference)
    {
        //* On vérifie si l'utilisateur a déjà retweet le tweet
        $stmt = $this->conn->prepare("SELECT * FROM retweets WHERE references_tweet_id = ? AND user_id = ?");
        $stmt->bind_param("ii", $reference, $user);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            //* Si a déjà retweet le tweet, on le retire de la table
            $stmt = $this->conn->prepare("DELETE FROM retweets WHERE references_tweet_id = ? AND user_id = ?");
            $stmt->bind_param("ii", $reference, $user);
            $stmt->execute();
            return "Retweet retiré.";
        } else {
            //* Si n'a pas encore retweet le tweet, on l'insère dans la table
            $stmt = $this->conn->prepare("INSERT INTO retweets (tweet_id, user_id, references_tweet_id) VALUES (?, ?, ?)");
            $stmt->bind_param("iii", $tweet_id, $user, $reference);

            if ($stmt->execute()) {
                return true;
            } else {
                return $this->conn->error;
            }
        }
    }

    //* Méthode pour récuperer le nombre de retweets d'un tweet
    public function get_retweet_count($tweet_id)
    {
        $stmt = $this->conn->prepare("SELECT COUNT(*) as retweetCount FROM retweets WHERE references_tweet_id = ?");
        $stmt->bind_param("i", $tweet_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();

        return $row['retweetCount'];
    }

    //* Méthode pour insérer un hashtag
    public function insertHashtag($tweet_id, $rtweet_id, $hashtag)
    {
        $stmt = $this->conn->prepare("INSERT INTO hashtag (tweet_id, rtweet_id, name) VALUES (?, ?, ?)");
        $stmt->bind_param("iis", $tweet_id, $rtweet_id, $hashtag);

        if ($stmt->execute()) {
            return true;
        } else {
            return $this->conn->error;
        }
    }

    //* Méthode pour récuperer les commentaires d'un tweet
    public function get_all_comments_of_tweet($tweet_id)
    {
        $stmt = $this->conn->prepare("
            SELECT tc.*, u.username, up.profile_picture
            FROM tweet_comment tc
            JOIN users u ON tc.user_id = u.id
            LEFT JOIN users_preferences up ON u.id = up.user_id
            WHERE tc.tweet_id = ?
            ORDER BY tc.created_at DESC
        ");
        $stmt->bind_param("i", $tweet_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $comments = array();

        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $comments[] = $row;
            }
        }
        return $comments;
    }

    //* Méthode pour récuperer le nombre de commentaires d'un tweet
    public function get_comment_count($tweet_id)
    {
        $stmt = $this->conn->prepare("SELECT COUNT(*) as commentCount FROM tweet_comment WHERE tweet_id = ?");
        $stmt->bind_param("i", $tweet_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();

        return $row['commentCount'];
    }

    //* Méthode pour rechercher par hashtag
    public function search_hashtag($hashtag)
    {
        $stmt = $this->conn->prepare("
        SELECT t.id as tweet_id, t.*, u.username, up.profile_picture
        FROM hashtag h
        JOIN tweet t ON h.tweet_id = t.id
        JOIN users u ON t.user_id = u.id
        LEFT JOIN users_preferences up ON u.id = up.user_id
        WHERE h.name = ?
        ORDER BY t.created_at DESC
    ");
        $stmt->bind_param("s", $hashtag);
        $stmt->execute();
        $result = $stmt->get_result();
        $tweets = array();

        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $row['comments'] = $this->get_comments_for_tweet($row['tweet_id']);
                $tweets[] = $row;
            }
        }
        return $tweets;
    }

    //* Méthode pour récuperer les commentaires d'un tweet
    private function get_comments_for_tweet($tweet_id)
    {
        $stmt = $this->conn->prepare("
        SELECT tc.message as comment_message, tc.created_at as comment_created_at, u.username as comment_username, up.profile_picture as comment_profile_picture
        FROM tweet_comment tc
        JOIN users u ON tc.user_id = u.id
        LEFT JOIN users_preferences up ON u.id = up.user_id
        WHERE tc.tweet_id = ?
        ORDER BY tc.created_at DESC
    ");
        $stmt->bind_param("i", $tweet_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $comments = array();

        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $comments[] = $row;
            }
        }
        return $comments;
    }

    //* Méthode pour modifier un tweet.
    public function edit_tweet($tweet_id, $new_message)
    {
        $stmt = $this->conn->prepare("UPDATE tweet SET message = ? WHERE id = ?");
        $stmt->bind_param("si", $new_message, $tweet_id);

        if ($stmt->execute()) {
            return true;
        } else {
            return false;
        }
    }

    //* Méthode pour supprimer un tweet.
    public function delete_tweet($tweet_id)
    {
        $stmt_delete_comments = $this->conn->prepare("DELETE FROM tweet_comment WHERE tweet_id = ?");
        $stmt_delete_comments->bind_param("i", $tweet_id);
        $stmt_delete_comments->execute();
        $stmt_delete_comments->close();

        $stm_delete_hashtag = $this->conn->prepare("DELETE FROM hashtag WHERE tweet_id = ?");
        $stm_delete_hashtag->bind_param("i", $tweet_id);
        $stm_delete_hashtag->execute();
        $stm_delete_hashtag->close();

        $stmt = $this->conn->prepare("DELETE FROM tweet WHERE id = ?");
        $stmt->bind_param("i", $tweet_id);

        if ($stmt->execute()) {
            $stmt->close();
            return true;
        } else {
            $stmt->close();
            return false;
        }
    }

    //* Méthode pour vérifier si un utilisateur a retweeté un tweet
    public function has_user_retweeted($user_id, $tweet_id)
    {
        $stmt = $this->conn->prepare("SELECT * FROM retweets WHERE references_tweet_id = ? AND user_id = ?");
        $stmt->bind_param("ii", $tweet_id, $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            return true;
        } else {
            return false;
        }
    }

    //* Méthode pour récupèrer les hashtags les plus populaires
    public function get_trending_hashtags()
    {
        $stmt = $this->conn->prepare("SELECT name, COUNT(*) as count FROM hashtag GROUP BY name ORDER BY count DESC LIMIT 10");
        $stmt->execute();
        $result = $stmt->get_result();
        $hashtags = $result->fetch_all(MYSQLI_ASSOC);
        return $hashtags;
    }
}

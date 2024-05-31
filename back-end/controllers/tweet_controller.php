<?php

require_once '../config/db_config.php';
require_once '../../back-end/models/tweet_model.php';


class TweetController
{
    private $tweetModel;

    public function __construct()
    {
        $conn = Database::getInstance()->getConn();
        $this->tweetModel = new TweetModel($conn);
    }

    //* Méthode pour récuperer les tweets et leurs nombres de commentaires
    public function get_tweets()
    {
        session_start();

        if (!isset ($_SESSION['user_id'])) {
            echo json_encode(['status' => 'error', 'message' => 'Vous devez être connecté pour voir les tweets.']);
            return;
        }

        $username = isset ($_POST['username']) ? $_POST['username'] : null;
        $tweets = $this->tweetModel->get_all_tweets($username);
        foreach ($tweets as &$tweet) {
            $tweet['commentCount'] = $this->tweetModel->get_comment_count($tweet['id']);
            $tweet['retweetCount'] = $this->tweetModel->get_retweet_count($tweet['id']);
            $tweet['user'] = $this->tweetModel->get_user_info($tweet['user_id']);
        }
        echo json_encode(['status' => 'success', 'tweets' => $tweets, 'currentUserId' => $_SESSION['user_id']]);
    }

    //* Méthode pour créer un tweet
    public function create_post()
    {
        session_start();

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (isset ($_SESSION['user_id'])) {
                $user = $_SESSION['user_id'];
                $message = $_POST['postContent'];
                $media = $_GET['imageFile'];

                if (empty ($message) || strlen($message) > 140) {
                    echo json_encode(['status' => 'error', 'message' => 'Le tweet ne peut pas être vide ou dépasser 140 caractères.']);
                    return;
                }

                if (!empty ($_FILES['imageFile']['name'])) {
                    $targetDir = "../../uploads/tweet_image/";
                    $fileName = basename($_FILES["imageFile"]["name"]);
                    $targetFilePath = $targetDir . $fileName;
                    $fileType = pathinfo($targetFilePath, PATHINFO_EXTENSION);

                    $allowTypes = array('jpg', 'png', 'jpeg', 'gif');
                    if (in_array($fileType, $allowTypes)) {
                        if (move_uploaded_file($_FILES["imageFile"]["tmp_name"], $targetFilePath)) {
                            $media = $targetFilePath;
                        } else {
                            echo json_encode(['status' => 'error', 'message' => 'Erreur lors du téléchargement du fichier.']);
                            return;
                        }
                    } else {
                        echo json_encode(['status' => 'error', 'message' => 'Seuls les fichiers JPG, JPEG, PNG et GIF sont autorisés.']);
                        return;
                    }
                }

                $result = $this->tweetModel->create_post($user, $message, $media);

                if (is_numeric($result)) {
                    preg_match_all('/#(\w+)/', $message, $matches);

                    foreach ($matches[1] as $hashtag) {
                        $this->tweetModel->insertHashtag($result, null, $hashtag);
                    }

                    echo json_encode(['status' => 'success', 'message' => 'Tweet créé avec succès.', 'tweet_id' => $result]);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la création du tweet : ' . $result]);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Vous devez être connecté pour créer un tweet.']);
            }
        }
    }

    //* Méthode pour créer un commentaire sur un tweet
    public function create_comment()
    {
        session_start();

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (isset ($_SESSION['user_id'])) {
                $user_id = $_SESSION['user_id'];
                $message = $_POST['commentContent'];
                $tweet_id = $_POST['tweet_id'];

                if (empty ($message)) {
                    echo json_encode(['status' => 'error', 'message' => 'Veuillez entrer un commentaire avant de le publier.']);
                    return;
                }

                $result = $this->tweetModel->create_comment($user_id, $message, $tweet_id);

                if ($result['status'] === 'success') {
                    $username = $this->tweetModel->get_username_from_id($user_id);
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Commentaire créé avec succès.',
                        'username' => $username,
                        'commentContent' => $message,
                        'profile_picture' => $result['profile_picture']
                    ]);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la création du commentaire : ' . $result['message']]);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Vous devez être connecté pour créer un commentaire.']);
            }
        }
    }

    //* Méthode pour faire un retweet
    public function create_retweet()
    {
        session_start();

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (isset ($_SESSION['user_id'])) {
                $user = $_SESSION['user_id'];
                $reference = $_POST['references_tweet_id'];

                $result = $this->tweetModel->create_retweet($user, $reference, $reference);

                if ($result === true) {
                    echo json_encode(['status' => 'success', 'message' => 'Retweet créé avec succès.']);
                } elseif ($result === "Retweet retiré.") {
                    echo json_encode(['status' => 'success', 'message' => 'Retweet retiré.']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la création du retweet : ' . $result]);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Vous devez être connecté pour créer un retweet.']);
            }
        }
    }

    //* Méthode pour récuperer les commentaires d'un tweet
    public function get_all_comments_of_tweet()
    {
        session_start();

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if (isset ($_SESSION['user_id'])) {
                $tweet_id = $_GET['tweet_id'];

                $comments = $this->tweetModel->get_all_comments_of_tweet($tweet_id);

                echo json_encode(['status' => 'success', 'comments' => $comments]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Vous devez être connecté pour voir les commentaires.']);
            }
        }
    }

    //* Méthode pour rechercher un hashtag
    public function search_hashtag($hashtag)
    {
        session_start();

        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if (isset ($_SESSION['user_id'])) {
                $tweets = $this->tweetModel->search_hashtag($hashtag);

                foreach ($tweets as &$tweet) {
                    $tweet['commentCount'] = $this->tweetModel->get_comment_count($tweet['id']);
                    $tweet['retweetCount'] = $this->tweetModel->get_retweet_count($tweet['id']);
                    $tweet['hasRetweeted'] = $this->tweetModel->has_user_retweeted($tweet['id'], $_SESSION['user_id']);
                }

                error_log(print_r($tweets, true));

                echo json_encode(['status' => 'success', 'tweets' => $tweets]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Vous devez être connecté pour rechercher un hashtag.']);
            }
        }
    }

    //* Méthode pour modifier un tweet
    public function edit_tweet()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (isset ($_POST['tweet_id']) && isset ($_POST['new_message'])) {
                $tweet_id = $_POST['tweet_id'];
                $new_message = $_POST['new_message'];
                $result = $this->tweetModel->edit_tweet($tweet_id, $new_message);
                if ($result) {
                    echo json_encode(['status' => 'success', 'message' => 'Tweet modifié avec succès.']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la modification du tweet.']);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'ID du tweet ou nouveau message manquant.']);
            }
        }
    }

    //*  Méthode pour supprimer un tweet
    public function delete_tweet()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (isset ($_POST['tweet_id'])) {
                $tweet_id = $_POST['tweet_id'];
                $result = $this->tweetModel->delete_tweet($tweet_id);
                if ($result) {
                    echo json_encode(['status' => 'success', 'message' => 'Tweet supprimé avec succès.']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la suppression du tweet.']);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'ID du tweet manquant.']);
            }
        }
    }

    //* Méthode pour récuperer les hashtags tendances
    public function get_trending_hashtags()
    {
        $hashtags = $this->tweetModel->get_trending_hashtags();
        echo json_encode($hashtags);
    }

}

if (isset ($_POST['action'])) {
    $action = $_POST['action'];
    $controller = new TweetController();

    if ($action === 'create_post') {
        $controller->create_post();
    } elseif ($action === 'create_comment') {
        $controller->create_comment();
    } elseif ($action === 'create_retweet') {
        $controller->create_retweet();
    } elseif ($action === 'get_tweets') {
        $controller->get_tweets();
    } elseif ($action === 'edit_tweet') {
        $controller->edit_tweet();
    } elseif ($action === 'delete_tweet') {
        $controller->delete_tweet();
    }
}

if (isset ($_GET['action'])) {
    $action = $_GET['action'];
    $controller = new TweetController();

    if ($action === 'get_all_comments') {
        $controller->get_all_comments_of_tweet();
    } else if ($action === 'search_hashtag') {
        $hashtag = $_GET['query'];
        $controller->search_hashtag($hashtag);
    } else if ($action === 'get_trending_hashtags') {
        $controller->get_trending_hashtags();
    }
}
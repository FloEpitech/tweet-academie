/* -------------------------------------------------------------------------- */
/*                         FONCTION POUR LES HASHTAGS                         */
/* -------------------------------------------------------------------------- */
$(document).ready(function () {
    var urlParams = new URLSearchParams(window.location.search);
    var username = urlParams.get('username');
    var hashtag = urlParams.get('hashtag');

    $('#searchForm').on('submit', function (e) {
        e.preventDefault();
        var query = $('#searchbar').val();
        if (query.startsWith('#')) {
            hashtag = query.substring(1);
            window.history.pushState({}, '', '?hashtag=' + hashtag);
            loadHashtagTweets(hashtag);
            $("#postDisplay").hide();
            $("#tweets").show();
        } else if (query === '') {
            window.history.pushState({}, '', window.location.pathname);
            $("#postDisplay").show();
            $("#tweetContainer").show();
            $("#responses").show();
            $("#tweets").hide();
        } else {
            username = query;
            window.location.href = '/view/profil.html?username=' + username;
        }
    });

    function debounce(func, delay) {
        var debounceTimer;
        return function () {
            var context = this;
            var args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                       DROP MENU RECHERCHE UTILISATEUR                      */
    /* -------------------------------------------------------------------------- */
    $('#searchbar').on('input', debounce(function () {
        var query = $(this).val();
        if (query) {
            var action = query.startsWith('#') ? 'search_hashtag' : 'search';
            var url = query.startsWith('#') ? '../../back-end/controllers/tweet_controller.php' : '../../back-end/controllers/user_controller.php';
            if (action === 'search_hashtag') {
                query = query.substring(1);
            }
            $.ajax({
                url: url,
                type: 'GET',
                data: {
                    action: action,
                    query: query
                },
                dataType: 'json',
                success: function (data) {
                    if (data.results) {
                        var results = data.results;
                        var resultsHtml = '';
                        for (var i = 0; i < Math.min(results.length, 5); i++) {
                            var profilePicture = results[i].profile_picture ? results[i].profile_picture : '../../uploads/defaut_profil_pics/defaut_pics_profil.png';
                            if (action === 'search') {
                                resultsHtml += '<div class="dropdown-item flex items-center space-x-2 cursor-pointer bg-white hover:bg-gray-100 p-2 border-b border-gray-200" data-value="' + results[i].username + '"><img class="h-7 w-7 rounded-full" src="' + profilePicture + '" alt="Profile Picture" /><span>' + results[i].username + '</span></div>';
                            } else {
                                resultsHtml += '<div class="dropdown-item cursor-pointer bg-white hover:bg-gray-100 p-2 border-b border-gray-200" data-value="#' + results[i].name + '">#' + results[i].name + '</div>';
                            }
                        }
                        $('#results').html('<div class="max-h-60 overflow-y-auto bg-white w-full">' + resultsHtml + '</div>');
                        $('.dropdown-item').on('click', function () {
                            $('#searchbar').val($(this).data('value'));
                            $('#results').html('');
                        });
                    } else {
                        console.log('No results returned from server');
                    }
                }
            });
        } else {
            $('#results').html('');
        }
    }, 300));

    if (username) {
        loadUserProfile(username);
    }

    /* -------------------------------------------------------------------------- */
    /*                         BOUTTON MODIFICATION PROFIL                        */
    /* -------------------------------------------------------------------------- */
    $.ajax({
        url: '../../back-end/controllers/user_controller.php',
        type: 'GET',
        data: {
            action: 'profil'
        },
        dataType: 'json',
        success: function (user) {
            var sessionUsername = user.username;

            var urlParams = new URLSearchParams(window.location.search);
            var urlUsername = urlParams.get('username');

            if (sessionUsername === urlUsername) {
                $('#bouton-modif-profil').show();
            } else {
                $('#bouton-modif-profil').hide();
            }
        },
        error: function () {
            console.log('Erreur lors de la récupération de l\'username de la session');
        }
    });
});

/* -------------------------------------------------------------------------- */
/*      FONCTION POUR CHARGER LES INFORMATIONS DE PROFIL D'UN UTILISATEUR     */
/* -------------------------------------------------------------------------- */
function loadUserProfile(username) {
    $.ajax({
        url: '../../back-end/controllers/user_controller.php',
        type: 'GET',
        data: {
            action: 'profil_other_user',
            username: username
        },
        dataType: 'json',
        success: function (data) {
            console.log(data);
            $('#user-id').text('User ID: ' + data.user.id);
            $('#user-firstname').text('First Name: ' + data.user.firstname);
            $('#user-lastname').text('Last Name: ' + data.user.lastname);
            $('#user-surname').text('Surname: ' + data.user.username);
            $('#user-age').text('Age: ' + data.user.birthdate);
            $('#user-bio').text(data.user.bio);
            $('#user-localisation').text(data.user.localisation);
            $('#user-website').text(data.user.website);
            if (data.user.profile_banner) {
                $("#profile-banner").css("background-image", "url(" + data.user.profile_banner + ")");
            }
            $('#profile-picture').attr('src', data.user.profile_picture);
        },
        error: function () {
            console.log('Erreur lors de la récupération des informations de profil');
        }
    });
}

/* -------------------------------------------------------------------------- */
/*                   FONCTION POUR L'AFFICHAGE DES HASHTAGS                   */
/* -------------------------------------------------------------------------- */
//* Evènement pour afficher les commentaires d'un tweet + textarea lors du clique.
$(document).on('click', '.show-comments', function () {
    var commentsDiv = $(this).closest('.tweet').find('.comments');
    if (commentsDiv.is(':hidden')) {
        commentsDiv.show();
    } else {
        commentsDiv.hide();
    }
});

//* Fonction pour charger les tweets avec un hashtag spécifique.
function loadHashtagTweets(hashtag) {
    $.ajax({
        url: '../../back-end/controllers/tweet_controller.php',
        type: 'GET',
        data: {
            action: 'search_hashtag',
            query: hashtag
        },
        dataType: 'json',
        success: function (data) {
            var tweetsHtml = '';
            for (var i = 0; i < data.tweets.length; i++) {
                let tweet = data.tweets[i];
                let postContentWithLinks = tweet.message.replace(
                    /#(\w+)/g,
                    '<a href="/view/profil.html?hashtag=$1" class="hashtag text-blue-500">#$1</a>'
                );
                postContentWithLinks = postContentWithLinks.replace(
                    /@(\w+)/g,
                    '<a href="/view/profil.html?username=$1" class="username text-blue-500">@$1</a>'
                );
                let tweetContent = '<p class="tweetContent dark:text-white">' + postContentWithLinks + "</p>";
                let tweetDate = new Date(Date.parse(tweet.created_at));
                let timeElapsed = timeSince(tweetDate);
                let userDisplay =
                    '<div class="userDisplay flex items-start mb-2">' +
                    '<img src="' + tweet.profile_picture + '" alt="Profile Picture" class="profile-picture w-12 h-12 rounded-full mr-2">' +
                    '<div class"flex">' +
                    '<span class="row font-medium dark:text-white">' + tweet.username + '</span>' +
                    '<span class="tweet-date font-normal text-sm text-gray-600 dark:text-gray-500">' + " @" + tweet.username + " · " + timeElapsed + '</span>' +
                    '<p class="dark:text-white">' + tweetContent + '</p>' +
                    '</div>' +
                    '</div>';
                let commentsButton = '<button class="show-comments px-2 py-2 rounded hover:text-blue-500 text-white ease-in hover:shadow-lg duration-300"><i class="fas fa-comment-dots"></i> <span class="dark:text-white">' + tweet.commentCount + "</span></button>";
                let retweetButtonColor = tweet.retweetCount ? "text-green-500" : "text-white";
                let retweetButton =
                    '<button class="repost-button px-2 py-2 rounded hover:text-green-500 ' + retweetButtonColor + ' ease-in hover:shadow-lg duration-300" data-tweet-id="' +
                    tweet.id +
                    '"><i class="fas fa-retweet"></i> <span class="dark:text-white">' +
                    tweet.retweetCount +
                    "</span></button>";
                let buttonsContainer =
                    '<div class="buttons-container mx-12">' +
                    commentsButton +
                    retweetButton +
                    '</div>';
                let tweetHtml =
                    '<div class="tweet p-4 border rounded shadow bg-grey-700 dark:text-white" data-tweet-id="' +
                    tweet.id +
                    '">' +
                    userDisplay +
                    buttonsContainer +
                    '<div class="comments hidden mt-2">' +
                    '<div class="comments-container">';
                for (var j = 0; j < tweet.comments.length; j++) {
                    tweetHtml += '<div class="comment-header flex items-start mt-4 border-t pt-4 text-white dark:text-white">';
                    tweetHtml += '<img src="' + (tweet.comments[j].comment_profile_picture || '../../uploads/profile_pictures/default_pic.png') + '" alt="Profile Picture" class="profile-picture w-12 h-12 rounded-full mr-2">';
                    tweetHtml += '<div>';
                    tweetHtml += '<strong class="block dark:text-white">' + (tweet.comments[j].comment_username || 'Unknown User') + '</strong>';
                    tweetHtml += '</div>';
                    tweetHtml += '</div>';
                    tweetHtml += '<p class="mt-2 dark:text-white">' + tweet.comments[j].comment_message + '</p>';
                }
                if (tweet.comments.length === 0) {
                    tweetHtml += '<p class="mt-2 dark:text-white">Ce tweet ne possède aucun commentaire.</p>';
                }
                tweetHtml += '<textarea class="new-comment mt-2 w-full p-2 border rounded text-black dark:text-white" placeholder="Write a comment..."></textarea>';
                tweetHtml += '<button class="submit-comment mt-2 p-2 bg-blue-500 text-white rounded">Submit Comment</button>';
                tweetHtml += '</div>';
                tweetHtml += '</div>';
                tweetHtml += '</div>';
                tweetsHtml += tweetHtml;
            }
            $('#tweets').html(tweetsHtml);
        },
        error: function () {
            console.log('Erreur lors de la récupération des tweets');
        }
    });
}

//* Evènement pour pouvoir poster un commentaire.
$(document).on('click', '.submit-comment', function () {
    var commentText = $(this).siblings('.new-comment').val();
    var tweetID = $(this).closest('.tweet').data('tweet-id');

    let formData = new FormData();
    formData.append("action", "create_comment");
    formData.append("commentContent", commentText);
    formData.append("tweet_id", tweetID);

    let commentButton = this;

    $.ajax({
        url: "../../back-end/controllers/tweet_controller.php",
        type: "POST",
        data: formData,
        dataType: "json",
        processData: false,
        contentType: false,
        success: function (data) {
            if (data.status === "success") {
                let tweetContainer = $(commentButton).closest(".tweet");
                let commentsContainer = tweetContainer.find(".comments");
                let profilePicture = data.profile_picture
                    ? data.profile_picture
                    : "../../uploads/profile_pictures/default_pic.png";
                let commentHtml = `
                    <div class="comment-header flex items-start mt-4 border-t pt-4 text-white">
                        <img src="${profilePicture}" alt="Profile Picture" class="profile-picture w-12 h-12 rounded-full mr-2">
                        <div>
                            <strong class="block">${data.username}</strong>
                        </div>
                    </div>
                    <p class="mt-2">${commentText}</p>`;
                commentsContainer.prepend(commentHtml);
                alert(data.message);
                $(commentButton).siblings('.new-comment').val("");

                let commentCountButton = tweetContainer.find(".show-comments span");
                let currentCommentCount = parseInt(commentCountButton.text());
                commentCountButton.text(currentCommentCount + 1);
            } else {
                alert(data.message);
            }
        },
    });
});

/* -------------------------------------------------------------------------- */
/*                                   RETWEET                                  */
/* -------------------------------------------------------------------------- */
//* Function pour soumettre le formulaire de retweet le tweet
function repostButtonHandler() {
    let tweetID = $(this).data("tweet-id");
    console.log(tweetID);

    let formData = new FormData();
    formData.append("action", "create_retweet");
    formData.append("references_tweet_id", tweetID);

    let button = this;

    $.ajax({
        type: "POST",
        url: "../back-end/controllers/tweet_controller.php",
        data: formData,
        dataType: "json",
        processData: false,
        contentType: false,
        success: function (response) {
            if (response.status === "success") {
                let retweetButton = $(button);
                let retweetCount = retweetButton.find("span");
                let currentCount = parseInt(retweetCount.text());

                if (response.message === "Retweet créé avec succès.") {
                    alert("Retweet créé avec succès.");

                    //* Incremente le nombre de retweets + change la couleur du bouton en vert
                    retweetCount.text(currentCount + 1);
                    retweetButton.addClass("text-green-500");
                } else if (response.message === "Retweet retiré.") {
                    alert("Retweet retiré.");

                    //* Décremente le nombre de retweets + change la couleur du bouton en noir
                    retweetCount.text(currentCount - 1);
                    retweetButton.removeClass("text-green-500");
                }
            } else {
                alert(
                    "Erreur lors de la création du retweet : " +
                    response.message
                );
            }
        },
        error: function (xhr, status, error) {
            console.error("Erreur AJAX : ", error);
        },
    });
}

//* Evènement pour appeler la fonction de retweet lors du clique sur le bouton de retweet
$(document).on("click", ".repost-button", repostButtonHandler);

//* Function pour afficher le temps écoulé depuis la publication d'un tweet
function timeSince(date) {
    let seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}
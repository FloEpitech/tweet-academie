/* -------------------------------------------------------------------------- */
/*                                    TWEET                                   */
/* -------------------------------------------------------------------------- */
$(document).ready(function () {
    let tweetID;

    //* Appel de la function pour charger les tweets au chargement de la page
    loadTweets();

    //* Evènement de soumission du formulaire de publication de tweet
    $("#postContent").submit(postContentSubmitHandler);
    $(document).on("click", ".repostButton", repostButtonHandler);
    $(document).on("click", ".replyButton", replyButtonHandler);
    $(document).on("submit", ".commentForm", commentFormSubmitHandler);

    function loadTweets() {
        const urlParams = new URLSearchParams(window.location.search);
        const username = urlParams.get('username');

        let data = { action: "get_tweets" };
        if (username && window.location.pathname.includes('profil.html')) {
            data.username = username;
        }

        $.ajax({
            url: "../back-end/controllers/tweet_controller.php",
            type: "POST",
            data: data,
            dataType: "json",
            success: function (data) {
                if (data.status === "success") {
                    displayTweets(data.tweets, data.currentUserId);
                } else {
                    console.error("Erreur lors du chargement des tweets.");
                }
            },
            error: function (xhr, status, error) {
                console.error("Erreur AJAX : ", error);
            },
        });
    }

    //* Function pour afficher les tweets
    function displayTweets(tweets, currentUserId) {
        $("#tweetContainer").empty();
        tweets.forEach(function (tweet) {
            displayTweet(tweet, currentUserId);
        });
        $(".hashtag").css({
            color: "blue",
            "text-decoration": "none",
        });
    }

    //* Function pour définirla structure d'un tweet
    function displayTweet(tweet, currentUserId) {
        let postContentWithLinks = tweet.message.replace(
            /#(\w+)/g,
            '<a href="/view/profil.html?hashtag=$1" class="hashtag text-blue-500">#$1</a>'
        );
        postContentWithLinks = postContentWithLinks.replace(
            /@(\w+)/g,
            '<a href="/view/profil.html?username=$1" class="username text-blue-500">@$1</a>'
        );
        let tweetContent = '<p class="tweetContent">' + postContentWithLinks + "</p>";
        let buttonContainer =
            '<div class="buttonContainer flex gap-5 mb-2 mx-11">';
        let replyButton =
            '<button class="replyButton px-2 py-2 rounded text-black ease-in duration-300 hover:shadow-lg hover:text-blue-500 dark:text-white dark:hover:text-blue-500" data-tweet-id="' +
            tweet.id + '"><i class="fas fa-comment-dots"></i> <span>' + tweet.commentCount + "</span></button>";
        let retweetButtonColor = tweet.retweetCount ? "text-green-500 dark:text-green-500" : "text-black dark:text-white";
        let retweetButton =
            '<button class="repostButton px-2 py-2 rounded ' + retweetButtonColor + ' ease-in hover:shadow-lg hover:text-green-500 dark:text-white dark:hover:text-green-500" data-tweet-id="' +
            tweet.id +
            '"><i class="fas fa-retweet"></i> <span>' +
            tweet.retweetCount +
            "</span></button>";
        let editButton = '';
        let deleteButton = '';
        if (currentUserId === tweet.user.id) {
            editButton =
                '<button class="editButton px-3 py-2 rounded text-black ease-in duration-300 hover:shadow-lg hover:text-yellow-500 dark:text-white dark:hover:text-yellow-500" data-tweet-id="' +
                tweet.id +
                '"><i class="fas fa-edit"></i></button>';
            deleteButton =
                '<button class="deleteButton px-3 py-2 rounded text-black ease-in duration-300 hover:shadow-lg hover:text-red-500 dark:text-white dark:hover:text-red-500" data-tweet-id="' +
                tweet.id +
                '"><i class="fas fa-trash"></i></button>';
        }
        let endDiv = "</div>";
        let commentDisplay = '<ul class="commentsContainer"></ul>';
        let commentForm =
            '<form class="commentForm mt-2 hidden"><textarea class="form-control mt-2 w-full p-2 border rounded text-black" placeholder="Write a comment..." name="commentContent"></textarea><input type="hidden" name="tweet_id"><input type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" value="Reply"></form>';
        let tweetDate = new Date(Date.parse(tweet.created_at));
        let timeElapsed = timeSince(tweetDate);
        let tweetImage = tweet.media ? '<img id="tweet-image-' + tweet.id + '" src="' + tweet.image_path + '" alt="Tweet Image" class="tweet-image max-w-full max-h-72 rounded-lg cursor-pointer">' : '';
        let profilePicture = tweet.user.profile_picture ? tweet.user.profile_picture : '../../uploads/defaut_profil_pics/defaut_pics_profil.png';
        let userDisplay =
            '<div class="userDisplay flex items-start mb-2">' +
            '<img src="' + profilePicture + '" alt="Profile Picture" class="profile-picture w-12 h-12 rounded-full mr-2">' +
            '<div class"flex row">' +
            '<a href="/view/profil.html?username=' + tweet.user.username + '" class="row font-medium dark:text-white">' + tweet.user.username + '</a>' +
            '<span class="tweet-date font-normal text-sm text-gray-500">' + " @" + tweet.user.username + " · " + timeElapsed + '</span>' +
            '<span class="dark:text-white">' + tweetContent + '</span>' +
            tweetImage +
            '</div>' +
            '</div>';
        let tweetHtml =
            '<div class="tweet p-4 border dark:border-stone-500 rounded shadow bg-white dark:bg-stone-800" data-tweet-id="' +
            tweet.id +
            '">' +
            userDisplay +
            buttonContainer +
            replyButton +
            retweetButton +
            editButton +
            deleteButton +
            endDiv +
            commentDisplay +
            commentForm +
            "</div>";
        $("#tweetContainer").append(tweetHtml);

        if (tweet.media) {
            $('#tweet-image-' + tweet.id).on('click', function () {
                let img = new Image();
                img.src = this.src;
                let div = document.createElement('div');
                div.appendChild(img);
                div.style.display = 'flex';
                div.style.justifyContent = 'center';
                div.style.alignItems = 'center';
                div.style.position = 'fixed';
                div.style.zIndex = '99999';
                div.style.top = '0';
                div.style.bottom = '0';
                div.style.left = '0';
                div.style.right = '0';
                div.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                img.style.maxWidth = '90%';
                img.style.maxHeight = '90%';
                div.onclick = function () {
                    document.body.removeChild(this);
                };
                document.body.appendChild(div);
            });
        }
    }


    //* Function pour soumettre le formulaire de publication de tweet
    function postContentSubmitHandler(e) {
        e.preventDefault();
        let postContent = $("#postContent textarea").val();
        let imageFile = $("button input[type=file]")[0].files[0];

        let formData = new FormData();
        formData.append("action", "create_post");
        formData.append("postContent", postContent);
        if (imageFile) {
            formData.append("imageFile", imageFile);
        }
        formData.append("action", "create_post");

        $.ajax({
            url: "../back-end/controllers/tweet_controller.php",
            type: "POST",
            data: formData,
            dataType: "json",
            processData: false,
            contentType: false,
            success: function (data) {
                if (data.status === "success") {
                    $("#postContent textarea").val("");
                    $("#postContent input[type=file]").val("");
                    $("#imagePreview").html("");
                    loadTweets();
                    updateTweetCount();
                } else {
                    alert(data.message);
                }
            },
            error: function (xhr, status, error) {
                console.error(error);
            },
        });
    }

    $(document).ready(function () {
        $("button input[type=file]").on('change', function () {
            let reader = new FileReader();
            reader.onload = function (e) {
                let imagePreview = '<img src="' + e.target.result + '" alt="Image Preview" style="max-width: 100%; max-height: 300px; border-radius: 10px;">';
                $("#imagePreview").html(imagePreview);
            }
            reader.readAsDataURL(this.files[0]);
        });
    });

    //* Fonction pour afficher un menu déroulant des utilisateurs mentionnés.
    $("#postContent textarea").on("input", function () {
        let content = $(this).val();
        let lastChar = content.slice(-1);

        if (content.includes("@")) {
            let usernameStart = content.split("@").pop();

            $.ajax({
                url: "../../back-end/controllers/user_controller.php",
                type: "GET",
                data: { action: "search", query: usernameStart },
                dataType: "json",
                success: function (data) {
                    if (data.status === "success") {
                        displayUserDropdown(data.results);
                    } else {
                        console.error("Erreur lors de la récupération des utilisateurs.");
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Erreur AJAX : ", error);
                },
            });
        }
    });

    /* -------------------------------------------------------------------------- */
    /*                 MENU DEROULANT DES UTILISATEURS MENTIONNES                 */
    /* -------------------------------------------------------------------------- */
    let textarea = document.querySelector("#postContent textarea");
    textarea.addEventListener('input', function () {
        let dropdown = document.querySelector("#userDropdown");
        if (!this.value.includes("@")) {
            dropdown.style.display = "none";
        }
    });

    function displayUserDropdown(users) {
        let dropdown = document.querySelector("#userDropdown");
        let button = document.querySelector("#postContent button");
        let textarea = document.querySelector("#postContent textarea");
        dropdown.innerHTML = "";

        let rect = button.getBoundingClientRect();
        dropdown.style.top = rect.bottom + "px";
        dropdown.style.left = rect.left + "px";

        users.forEach(function (user) {
            let userElement = document.createElement('div');
            userElement.setAttribute('value', user.username);
            userElement.classList.add('flex', 'items-center', 'px-4', 'py-2', 'text-black', 'hover:bg-gray-200');

            let userImage = document.createElement('img');
            userImage.alt = user.username;
            userImage.classList.add('w-8', 'h-8', 'mr-2', 'rounded-full');

            if (user.profile_picture) {
                userImage.src = user.profile_picture;
            } else {
                userImage.src = "../../uploads/defaut_profil_pics/defaut_pics_profil.png";
            }

            userElement.appendChild(userImage);

            let usernameText = document.createElement('span');
            usernameText.textContent = user.username;
            userElement.appendChild(usernameText);

            userElement.addEventListener('click', function (event) {
                event.stopPropagation();

                let currentContent = textarea.value;
                let newContent = currentContent.substring(0, currentContent.lastIndexOf("@")) + "@" + user.username;
                textarea.value = newContent;
                dropdown.style.display = "none";
            });

            dropdown.appendChild(userElement);
        });

        dropdown.classList.add('absolute', 'left-16', 'top-10', 'mt-2', 'bg-white', 'shadow-md', 'rounded-md');
        dropdown.style.display = "block";
        dropdown.style.maxHeight = "250px";
        dropdown.style.overflowY = "auto";
    }

    /* -------------------------------------------------------------------------- */
    /*                                   RETWEET                                  */
    /* -------------------------------------------------------------------------- */
    //* Function pour soumettre le formulaire de retweet le tweet
    function repostButtonHandler() {
        let tweetID = $(this).data("tweet-id");

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
                        //* Incremente le nombre de retweets + change la couleur du bouton en vert
                        retweetCount.text(currentCount + 1);
                        retweetButton.addClass("text-green-500");
                    } else if (response.message === "Retweet retiré.") {

                        //* Decremente le nombre de retweets + change la couleur du bouton en noir
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

    /* -------------------------------------------------------------------------- */
    /*                              REPONDRE AU TWEET                             */
    /* -------------------------------------------------------------------------- */
    //* Function pour afficher les commentaires + "comment area" d'un tweet lors du clic sur le bouton "Répondre"
    function replyButtonHandler() {
        tweetID = $(this).data("tweet-id");
        let commentForm = $(this).closest(".tweet").find(".commentForm");
        let commentsContainer = $(this)
            .closest(".tweet")
            .find(".commentsContainer");

        //* Si les commentaire + le textarea des commentaires est déjà visible, on le cache
        if (commentForm.is(":visible")) {
            commentForm.hide();
            commentsContainer.hide();
            return;
        }

        commentForm.show();
        commentsContainer.show();
        commentForm.find('input[name="tweet_id"]').val(tweetID);

        $.ajax({
            url: "../../back-end/controllers/tweet_controller.php",
            type: "GET",
            data: { action: "get_all_comments", tweet_id: tweetID },
            dataType: "json",
            success: function (data) {
                if (data.status === "success") {
                    displayComments(data.comments, commentsContainer);
                } else {
                    alert(data.message);
                }
            },
            error: function (xhr, status, error) {
                console.error("Erreur AJAX : ", error);
            },
        });
    }

    //* Function pour soumettre le formulaire de commentaire
    function commentFormSubmitHandler(e) {
        e.preventDefault();

        let commentContent = $(this)
            .find('textarea[name="commentContent"]')
            .val();
        let tweetID = $(this).find('input[name="tweet_id"]').val();

        let formData = new FormData();
        formData.append("action", "create_comment");
        formData.append("commentContent", commentContent);
        formData.append("tweet_id", tweetID);

        let form = this;

        $.ajax({
            url: "../../back-end/controllers/tweet_controller.php",
            type: "POST",
            data: formData,
            dataType: "json",
            processData: false,
            contentType: false,
            success: function (data) {
                if (data.status === "success") {
                    //* Ajoute le commentaire sans recharger la page
                    let commentsContainer = $(form)
                        .closest(".tweet")
                        .find(".commentsContainer");
                    let profilePicture = data.profile_picture
                        ? data.profile_picture
                        : "../../uploads/defaut_profil_pics/defaut_pics_profil.png";
                    let commentHtml = `
                        <li class="comment p-2 border-b flex items-center dark:text-white">
                            <img src="${profilePicture}" alt="Profile Picture" class="comment-profile-picture w-12 h-12 rounded-full mr-2">
                            <div>
                                <div class="comment-user font-bold">${data.username} :</div>
                                <div class="comment-message">${commentContent}</div>
                            </div>
                        </li>`;
                    commentsContainer.append(commentHtml);
                    $(form).find('textarea[name="commentContent"]').val("");

                    //* Incremente le nombre de commentaires sans recharger la page
                    let replyButton = $(form)
                        .closest(".tweet")
                        .find(".replyButton span");
                    let currentCount = parseInt(replyButton.text());
                    replyButton.text(currentCount + 1);
                } else {
                    alert(data.message);
                }
            },
            error: function (xhr, status, error) {
                console.error(error);
            },
        });
    }

    function displayComments(comments, commentsContainer) {
        commentsContainer.empty();
        comments.forEach(function (comment) {
            let profilePicture = comment.profile_picture
                ? comment.profile_picture
                : "../../uploads/defaut_profil_pics/defaut_pics_profil.png";
            let commentHtml = `
                <li class="comment p-2 border-b flex items-center dark:text-white">
                    <img src="${profilePicture}" alt="Profile Picture" class="comment-profile-picture w-12 h-12 rounded-full mr-2">
                    <div>
                        <div class="comment-user font-bold">${comment.username} :</div>
                        <div class="comment-message">${comment.message}</div>
                    </div>
                </li>`;
            commentsContainer.append(commentHtml);
        });
    }

    /* -------------------------------------------------------------------------- */
    /*                               EDITER UN TWEET                              */
    /* -------------------------------------------------------------------------- */
    //* Fonction pour éditer le tweet
    $(document).on("click", ".editButton", function () {
        let tweetID = $(this).data("tweet-id");
        $('#editTweetModal').removeClass('hidden');

        $('#confirmEdit').click(function () {
            let newMessage = $('#newMessage').val();
            if (newMessage !== '') {
                editTweet(tweetID, newMessage);
                $('#editTweetModal').addClass('hidden');
                $('#newMessage').val('');
            }
        });

        $('#cancelEdit').click(function () {
            $('#editTweetModal').addClass('hidden');
        });
    });

    //* Function pour soumettre le formulaire de modification de tweet
    function editTweet(tweetID, new_message) {
        let formData = new FormData();
        formData.append("action", "edit_tweet");
        formData.append("tweet_id", tweetID);
        formData.append("new_message", new_message);

        $.ajax({
            url: "../back-end/controllers/tweet_controller.php",
            type: "POST",
            data: formData,
            dataType: "json",
            processData: false,
            contentType: false,
            success: function (data) {
                if (data.status === "success") {
                    loadTweets();
                } else {
                    alert("Erreur lors de la modification du tweet : " + data.message);
                }
            },
            error: function (xhr, status, error) {
                console.error("Erreur AJAX : ", error);
            },
        });
    }

    /* -------------------------------------------------------------------------- */
    /*                             SUPPRIMER UN TWEET                             */
    /* -------------------------------------------------------------------------- */
    $(document).on("click", ".deleteButton", function () {
        let tweetID = $(this).data("tweet-id");

        $('#confirmDelete').data('tweet-id', tweetID);
        $('#deleteModal').removeClass('hidden');
    });

    $(document).on("click", "#confirmDelete", function () {
        let tweetID = $(this).data('tweet-id');

        deleteTweet(tweetID);
        $('#deleteModal').addClass('hidden');
    });

    $(document).on("click", "#cancelDelete", function () {
        $('#deleteModal').addClass('hidden');
    });

    //* Function pour supprimer un tweet
    function deleteTweet(tweetID) {
        let formData = new FormData();
        formData.append("action", "delete_tweet");
        formData.append("tweet_id", tweetID);

        $.ajax({
            url: "../back-end/controllers/tweet_controller.php",
            type: "POST",
            data: formData,
            dataType: "json",
            processData: false,
            contentType: false,
            success: function (data) {
                if (data.status === "success") {
                    loadTweets();
                    updateTweetCount();
                } else {
                    alert("Erreur lors de la suppression du tweet : " + data.message);
                }
            },
            error: function (xhr, status, error) {
                console.error("Erreur AJAX : ", error);
            },
        });
    }

    /* -------------------------------------------------------------------------- */
    /*                TEMPS ÉCOULÉ DEPUIS LA PUBLICATION D'UN TWEET               */
    /* -------------------------------------------------------------------------- */
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
});

/* -------------------------------------------------------------------------- */
/*                              COMPTEUR DE TWEET                             */
/* -------------------------------------------------------------------------- */
function updateTweetCount() {
    let urlParams = new URLSearchParams(window.location.search);
    let username = urlParams.get('username');

    $.ajax({
        url: '../../back-end/controllers/user_controller.php',
        type: 'GET',
        data: {
            action: 'getTweetsCount',
            username: username
        },
        success: function (response) {
            let data = JSON.parse(response);
            if (data.status === 'success') {
                $('#tweet-count').text(data.tweetsCount);
            } else {
                alert('Erreur : ' + data.message);
            }
        },
        error: function () {
            alert('Erreur lors de la requête AJAX');
        }
    });
}

$(document).ready(function () {
    updateTweetCount();
});

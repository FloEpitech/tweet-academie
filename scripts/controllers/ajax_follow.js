/* -------------------------------------------------------------------------- */
/*          CACHER LE BOUTON FOLLOW SI ON EST SUR NOTRE PROPRE PROFIL         */
/* -------------------------------------------------------------------------- */
function checkFollowButton() {
    let urlParams = new URLSearchParams(window.location.search);
    let username = urlParams.get('username');

    $('#followings-link').attr('href', `follows_followings.html?username=${username}&tab=followings`);
    $('#followers-link').attr('href', `follows_followings.html?username=${username}&tab=followers`);

    $.ajax({
        url: '../../back-end/controllers/user_controller.php',
        type: 'GET',
        data: {
            action: 'getLoggedInUserId'
        },
        success: function (response) {
            let data = JSON.parse(response);
            if (data.status === 'success') {
                let loggedInUsername = data.username;

                if (loggedInUsername === username) {
                    $('#follow-button').hide();
                } else {
                    $('#follow-button').show();
                }
            } else {
                alert('Erreur : ' + data.message);
            }
        },
        error: function () {
            alert('Erreur lors de la requête AJAX');
        }
    });
}

window.addEventListener('popstate', function (event) {
    setTimeout(checkFollowButton, 10);
});

$(document).ready(function () {
    setTimeout(checkFollowButton, 10);
});

/* -------------------------------------------------------------------------- */
/*                                FOLLOW BUTTON                               */
/* -------------------------------------------------------------------------- */
$(document).on('click', '#follow-button', function () {
    let urlParams = new URLSearchParams(window.location.search);
    let username = urlParams.get('username');
    let button = $('#follow-button');

    if (button.hasClass('bg-green-500')) {
        $('#unfollowUsername').text('Voulez-vous vraiment unfollow ' + username + ' ?');
        $('#unfollowModal').css('display', 'flex');

        $('#confirmUnfollow').off('click').click(function () {
            $.ajax({
                url: '../../back-end/controllers/user_controller.php',
                type: 'POST',
                data: {
                    action: 'follow',
                    username: username
                },
                success: function (response) {
                    let data = JSON.parse(response);
                    if (data.status === 'success' && data.message === 'Unfollow réussi') {
                        button.removeClass('bg-green-500 hover:bg-red-500').addClass('bg-blue-500').text('Follow');
                        button.off('mouseenter mouseleave');
                    } else {
                        alert('Erreur : ' + data.message);
                    }
                },
                error: function () {
                    alert('Erreur lors de la requête AJAX');
                }
            });

            $('#unfollowModal').css('display', 'none');
        });

        $('#cancelUnfollow').click(function () {
            $('#unfollowModal').css('display', 'none');
        });
    } else {
        $.ajax({
            url: '../../back-end/controllers/user_controller.php',
            type: 'POST',
            data: {
                action: 'follow',
                username: username
            },
            success: function (response) {
                let data = JSON.parse(response);
                if (data.status === 'success' && data.message === 'Follow réussi') {
                    button.removeClass('bg-blue-500').addClass('bg-green-500 hover:bg-red-500').text('Following');
                    button.hover(function () {
                        $(this).text('Unfollow');
                    }, function () {
                        $(this).text('Following');
                    });
                } else {
                    alert('Erreur : ' + data.message);
                }
            },
            error: function () {
                alert('Erreur lors de la requête AJAX');
            }
        });
    }
});

$(document).ready(function () {
    let urlParams = new URLSearchParams(window.location.search);
    let username = urlParams.get('username');

    $.ajax({
        url: '../../back-end/controllers/user_controller.php',
        type: 'GET',
        data: {
            action: 'isFollowing',
            username: username
        },
        success: function (response) {
            let data = JSON.parse(response);
            if (data.status === 'success' && data.isFollowing) {
                $('#follow-button').removeClass('bg-blue-500').addClass('bg-green-500 hover:bg-red-500').text('Following');
                $('#follow-button').hover(function () {
                    $(this).text('Unfollow');
                }, function () {
                    $(this).text('Following');
                });
            } else {
                $('#follow-button').removeClass('bg-green-500 hover:bg-red-500').addClass('bg-blue-500').text('Follow');
                $('#follow-button').off('mouseenter mouseleave');
            }
        },
        error: function () {
            alert('Erreur lors de la requête AJAX');
        }
    });
});

/* -------------------------------------------------------------------------- */
/*                        COUNT FOLLOWS AND FOLLOWINGS                        */
/* -------------------------------------------------------------------------- */
function updateFollowersCount() {
    let urlParams = new URLSearchParams(window.location.search);
    let username = urlParams.get('username');

    $.ajax({
        url: '../../back-end/controllers/user_controller.php',
        type: 'GET',
        data: {
            action: 'getFollowersCount',
            username: username
        },
        success: function (response) {
            let data = JSON.parse(response);
            if (data.status === 'success') {
                $('#followers-count').text(data.followersCount);
            } else {
                alert('Erreur : ' + data.message);
            }
        },
        error: function () {
            alert('Erreur lors de la requête AJAX');
        }
    });
}

function updateFollowingsCount() {
    let urlParams = new URLSearchParams(window.location.search);
    let username = urlParams.get('username');

    $.ajax({
        url: '../../back-end/controllers/user_controller.php',
        type: 'GET',
        data: {
            action: 'getFollowingsCount',
            username: username
        },
        success: function (response) {
            let data = JSON.parse(response);
            if (data.status === 'success') {
                $('#followings-count').text(data.followingsCount);
            } else {
                alert('Erreur : ' + data.message);
            }
        },
        error: function () {
            alert('Erreur lors de la requête AJAX');
        }
    });
}
/* -------------------------------------------------------------------------- */
/*                         LIST FOLLOWS AND FOLLOWINGS                        */
/* -------------------------------------------------------------------------- */
let currentUser;

$.ajax({
    url: '../../back-end/controllers/user_controller.php',
    type: 'GET',
    data: {
        action: 'getLoggedInUserId'
    },
    success: function (response) {
        const data = JSON.parse(response);
        if (data.status === 'success') {
            currentUser = data.username;
            $(document).ready(function () {
                setTimeout(checkFollowButton, 20);
                updateFollowersCount();
                updateFollowingsCount();
                updateFollowersList();
                updateFollowingsList();
            });
        } else {
            console.error(data.message);
        }
    },
    error: function (error) {
        console.error('Erreur lors de la récupération du nom d\'utilisateur connecté', error);
    }
});

function updateFollowersList() {
    let urlParams = new URLSearchParams(window.location.search);
    let username = urlParams.get('username');
    let defaultProfilePicture = '../../uploads/defaut_profil_pics/defaut_pics_profil.png';

    $.ajax({
        url: '../../back-end/controllers/user_controller.php',
        type: 'GET',
        data: {
            action: 'getFollowersList',
            username: username
        },
        success: function (response) {
            let data = JSON.parse(response);
            if (data.status === 'success') {
                let followersList = data.followersList;
                let followersDiv = $('#followers');
                followersDiv.empty();
                followersList.forEach(follower => {
                    let profilePicture = follower.profile_picture ? follower.profile_picture : defaultProfilePicture;
                    if (currentUser !== follower.username) {
                        $.ajax({
                            url: '../../back-end/controllers/user_controller.php',
                            type: 'GET',
                            data: {
                                action: 'isFollowing',
                                username: follower.username
                            },
                            success: function (response) {
                                let data = JSON.parse(response);
                                if (data.status === 'success' && data.isFollowing) {
                                    followersDiv.append(`
                                        <div class="flex items-center justify-between text-black dark:text-white border-b pb-2">
                                            <div class="flex items-center">
                                                <img src="${profilePicture}" alt="Profile Picture" class="w-12 h-12 rounded-full mr-4 mt-2 border-2">
                                                <a href="/view/profil.html?username=${follower.username}" class="hover:text-black-800 dark:hover:text-white">${follower.username}</a>
                                            </div>
                                            <button class="follow-button bg-green-500 hover:bg-red-500 text-white font-bold py-2 px-4 rounded mx-4 followed" data-username="${follower.username}">Following</button>
                                        </div>
                                    `);
                                    $('.followed').hover(function () {
                                        $(this).text('Unfollow');
                                    }, function () {
                                        $(this).text('Following');
                                    });
                                } else {
                                    followersDiv.append(`
                                        <div class="flex items-center justify-between text-black dark:text-white border-b pb-2">
                                            <div class="flex items-center">
                                                <img src="${profilePicture}" alt="Profile Picture" class="w-12 h-12 rounded-full mr-4 mt-2 border-2">
                                                <a href="/view/profil.html?username=${follower.username}" class="hover:text-black-800 dark:hover:text-white">${follower.username}</a>
                                            </div>
                                            <button class="follow-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-4" data-username="${follower.username}">Follow</button>
                                        </div>
                                    `);
                                }
                            },
                            error: function () {
                                alert('Erreur lors de la requête AJAX');
                            }
                        });
                    } else {
                        followersDiv.append(`
                            <div class="flex items-center justify-between text-black dark:text-white border-b pb-2">
                                <div class="flex items-center">
                                    <img src="${profilePicture}" alt="Profile Picture" class="w-12 h-12 rounded-full mr-4 mt-2 border-2">
                                    <a href="/view/profil.html?username=${follower.username}" class="hover:text-black-800 dark:hover:text-white">${follower.username}</a>
                                </div>
                            </div>
                        `);
                    }
                });
            } else {
                alert('Erreur : ' + data.message);
            }
        },
        error: function () {
            alert('Erreur lors de la requête AJAX');
        }
    });
}

function updateFollowingsList() {
    let defaultProfilePicture = '../../uploads/defaut_profil_pics/defaut_pics_profil.png';
    let urlParams = new URLSearchParams(window.location.search);
    let username = urlParams.get('username');

    $.ajax({
        url: '../../back-end/controllers/user_controller.php',
        type: 'GET',
        data: {
            action: 'getFollowingsList',
            username: username
        },
        success: function (response) {
            let data = JSON.parse(response);
            if (data.status === 'success') {
                let followingsList = data.followingsList;
                let followingsDiv = $('#followings');
                followingsDiv.empty();
                followingsList.forEach(following => {
                    let profilePicture = following.profile_picture ? following.profile_picture : defaultProfilePicture;
                    if (currentUser !== following.username) {
                        followingsDiv.append(`
                            <div class="flex items-center justify-between text-black dark:text-white border-b pb-2">
                                <div class="flex items-center">
                                    <img src="${profilePicture}" alt="Profile Picture" class="w-12 h-12 rounded-full mr-4 mt-2 border-2">
                                    <a href="/view/profil.html?username=${following.username}" class="hover:text-black-800 dark:hover:text-white">${following.username}</a>
                                </div>
                                <button class="follow-button bg-green-500 hover:bg-red-500 text-white font-bold py-2 px-4 rounded mx-4 followed" data-username="${following.username}">Following</button>
                            </div>
                        `);
                    } else {
                        followingsDiv.append(`
                            <div class="flex items-center justify-between text-black dark:text-white border-b pb-2">
                                <div class="flex items-center">
                                    <img src="${profilePicture}" alt="Profile Picture" class="w-12 h-12 rounded-full mr-4 mt-2 border-2">
                                    <a href="/view/profil.html?username=${following.username}" class="hover:text-black-800 dark:hover:text-white">${following.username}</a>
                                </div>
                            </div>
                        `);
                    }
                });

                $(document).on('mouseenter', '.followed', function () {
                    $(this).text('Unfollow');
                    $(this).addClass('bg-red-500 hover:bg-red-700');
                    $(this).removeClass('bg-green-500 hover:bg-red-500');
                });

                $(document).on('mouseleave', '.followed', function () {
                    $(this).text('Following');
                    $(this).addClass('bg-green-500 hover:bg-red-500');
                    $(this).removeClass('bg-red-500 hover:bg-red-700');
                });
            } else {
                alert('Erreur : ' + data.message);
            }
        },
        error: function () {
            alert('Erreur lors de la requête AJAX');
        }
    });
}

$(document).on('click', '.follow-button', function () {
    let username = $(this).data('username');
    let button = $(this);

    if (button.hasClass('followed')) {
        $('#unfollowUsername').text(username);
        $('#unfollowModal').css('display', 'flex');

        $('#confirmUnfollow').off('click').click(function () {
            $.ajax({
                url: '../../back-end/controllers/user_controller.php',
                type: 'POST',
                data: {
                    action: 'follow',
                    username: username
                },
                success: function (response) {
                    let data = JSON.parse(response);
                    if (data.status === 'success' && data.message === 'Unfollow réussi') {
                        button.text('Follow');
                        button.removeClass('followed bg-green-500 hover:bg-red-500');
                        button.addClass('bg-blue-500 hover:bg-blue-700');

                        button.off('mouseenter mouseleave');
                        button.css('background-color', 'bg-blue-500');

                        updateFollowersList();
                        updateFollowingsList();
                        updateFollowersCount();
                        updateFollowingsCount();
                    } else {
                        alert('Erreur : ' + data.message);
                    }
                },
                error: function () {
                    alert('Erreur lors de la requête AJAX');
                }
            });

            $('#unfollowModal').css('display', 'none');
        });

        $('#cancelUnfollow').click(function () {
            $('#unfollowModal').css('display', 'none');
        });
    } else {
        $.ajax({
            url: '../../back-end/controllers/user_controller.php',
            type: 'POST',
            data: {
                action: 'follow',
                username: username
            },
            success: function (response) {
                let data = JSON.parse(response);
                if (data.status === 'success' && data.message === 'Follow réussi') {
                    button.text('Following');
                    button.addClass('followed bg-green-500 hover:bg-red-500');
                    button.removeClass('bg-blue-500 hover:bg-blue-700');

                    button.hover(function () {
                        $(this).text('Unfollow');
                    }, function () {
                        $(this).text('Following');
                    });
                } else {
                    alert('Erreur : ' + data.message);
                }
            },
            error: function () {
                alert('Erreur lors de la requête AJAX');
            }
        });
    }
});

/* -------------------------------------------------------------------------- */
/*                            SUGGESTION DE PROFIL                            */
/* -------------------------------------------------------------------------- */
var currentIndex = 0;
var count = 5;
var suggestedUsers;

function getSuggestedUsers() {
    if (!suggestedUsers) {
        $.ajax({
            url: '../../back-end/controllers/user_controller.php',
            type: 'GET',
            data: {
                action: 'getSuggestedUsers'
            },
            success: function (response) {
                let data = JSON.parse(response);
                if (data.status === 'success') {
                    suggestedUsers = data.suggestedUsers;
                    showSuggestedUsers();
                } else {
                    alert('Erreur : ' + data.message);
                }
            },
            error: function () {
                alert('Erreur lors de la requête AJAX');
            }
        });
    } else {
        showSuggestedUsers();
    }
}

function showSuggestedUsers() {
    let suggestionsDiv = $('#suggestions');
    for (let i = currentIndex; i < currentIndex + count && i < suggestedUsers.length; i++) {
        let user = suggestedUsers[i];
        $.ajax({
            url: '../../back-end/controllers/user_controller.php',
            type: 'GET',
            data: {
                action: 'isFollowing',
                username: user.username
            },
            success: function (response) {
                let data = JSON.parse(response);
                if (data.status === 'success' && !data.isFollowing && user.username !== data.currentUsername) {
                    let profilePicture = user.profile_picture ? user.profile_picture : '../../uploads/defaut_profil_pics/defaut_pics_profil.png';
                    suggestionsDiv.append(`
                        <div class="flex justify-between items-center w-full p-2 border-b border-gray-200">
                            <div class="flex items-center">
                                <div>
                                    <img id="img_user" class="inline-block h-10 w-auto rounded-full ml-4 mt-2"
                                        src="${profilePicture}" alt="Profile pic">
                                </div>
                                <div class="ml-3 mt-3">
                                    <a href="/view/profil.html?username=${user.username}" class=" dark:text-white text-black hover:text-blue-300">
                                        <span id="Username">${user.username}</span>
                                    </a>
                                    <p
                                        class="text-sm leading-5 font-medium text-gray-400 group-hover:text-gray-300 transition ease-in-out duration-150">
                                        <span id="Username">@${user.username}</span>
                                    </p>
                                </div>
                            </div>
                            <div>
                                <button id="follow_user" data-username="${user.username}" class="follow-button float-left bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                                    Follow
                                </button>
                            </div>
                        </div>
                    `);
                }
            },
            error: function () {
                alert('Erreur lors de la requête AJAX');
            }
        });
    }
    currentIndex += count;
}

function hideSuggestedUsers() {
    let suggestionsDiv = $('#suggestions');
    for (let i = 0; i < count; i++) {
        suggestionsDiv.children().last().remove();
    }
    currentIndex -= count;
}

$(document).ready(function () {
    getSuggestedUsers();

    $('#showMoreButtonSuggest').click(function () {
        var button = $(this);
        if (button.text().trim() === 'Show more') {
            getSuggestedUsers();
            button.text('Show less');
        } else {
            hideSuggestedUsers();
            button.text('Show more');
        }
    });
});
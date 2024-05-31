$(document).ready(function () {
    var urlParams = new URLSearchParams(window.location.search);
    var username = urlParams.get("username");

    var action = username ? "profil_other_user" : "profil";

    $.ajax({
        url: "../../back-end/controllers/user_controller.php",
        type: "GET",
        data: {
            action: action,
            username: username,
        },
        success: function (response) {
            var data = JSON.parse(response);
            if (data.status === "success") {
                var user = data.user;

                var profileBanner = user.profile_banner ? user.profile_banner : '../../uploads/defaut_profil_pics/default_banner.jpeg';
                var profilePicture = user.profile_picture ? user.profile_picture : '../../uploads/defaut_profil_pics/defaut_pics_profil.png';

                //* Permet d'afficher les informations de l'utilisateur dans la page
                $("#profile-banner").css("background-image", "url(" + profileBanner + ")");
                $("#profile-picture").attr("src", profilePicture);
                $("#user-id").text("User ID: " + user.user_id);
                $("#user-firstname").text("First Name: " + user.firstname);
                $("#user-lastname").text("Last Name: " + user.lastname);
                $("#user-username").text(user.username);
                $("#user-arrobase-username").text("@" + user.username);
                $("#user-age").text("Age: " + user.birthdate);
                $("#user-bio").text(user.bio);
                $("#user-localisation").text(user.localisation);
                $("#user-website").text(user.website);
            } else {
                console.error(data.message);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error("Error: " + textStatus, errorThrown);
        },
    }).always(function (response) {
        if (typeof response === 'string') {
            var data = JSON.parse(response);
            if (data.status === "success") {
                var user = data.user;

                if (action === "profil") {
                    window.history.pushState(
                        {},
                        "",
                        "?username=" + user.username
                    );
                    window.location.reload();
                }
            }
        }
    });
});
$(document).ready(function () {
    var currentProfilePicture = "";
    var currentProfileBanner = "";

    //* Requête AJAX pour récupérer les informations actuelles de l'utilisateur
    $.ajax({
        url: "../../back-end/controllers/user_controller.php",
        type: "GET",
        data: { action: "profil" },
        dataType: "json",
        success: function (response) {
            if (response.status === "success") {
                var user = response.user;

                //* Pré-remplir les champs du formulaire avec les informations actuelles de l'utilisateur
                $("#username").val(user.username);
                $("#bio").val(user.bio);
                $("#localisation").val(user.localisation);
                $("#website").val(user.website);

                //* On stocke les chemins des images actuelles dans des variables
                currentProfilePicture = user.profile_picture;
                currentProfileBanner = user.profile_banner;

                //* On affiche les images actuelles dans les balises img
                if (user.profile_picture) {
                    $("#profile_picture_preview").attr(
                        "src",
                        "../../uploads/profile_pictures/" + user.profile_picture
                    );
                }
                if (user.profile_banner) {
                    $("#profile_banner_preview").css(
                        "background-image",
                        "url('../../uploads/profile_banners/" + user.profile_banner + "')"
                    );
                }

                //* Event listener pour ouvrir le sélecteur de fichier lorsqu'on clique sur l'image de profil ou de bannière
                $("#profile_picture_button").click(function () {
                    $("#hidden_profile_picture_input").click();
                });

                $("#profile_banner_input").click(function (event) {
                    event.preventDefault();
                    $("#hidden_profile_banner_input").click();
                });

                //* Ajout d'un event listener pour afficher un aperçu de l'image sélectionnée avant de la télécharger
                $("#hidden_profile_picture_input").change(function () {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        $("#profile_picture_preview").attr(
                            "src",
                            e.target.result
                        );
                    };
                    reader.readAsDataURL(this.files[0]);
                });

                $("#hidden_profile_banner_input").change(function () {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        $("#profile_banner_preview").css(
                            "background-image",
                            "url('" + e.target.result + "')"
                        );
                    };
                    reader.readAsDataURL(this.files[0]);
                });
            } else {
                console.log("Erreur: " + response.message);
            }
        },
        error: function (xhr, status, error) {
            console.log("Erreur AJAX: " + error);
        },
    });

    //* Requête AJAX pour mettre à jour le profil de l'utilisateur
    $(document).ready(function () {
        //* Requête AJAX pour mettre à jour le profil de l'utilisateur
        $("#myForm").submit(function (event) {
            event.preventDefault();

            var formData = new FormData(this);

            //* Récupérer les nouvelles images sélectionnées
            var newProfilePictureFile = $("#hidden_profile_picture_input")[0].files[0];
            var newProfileBannerFile = $("#hidden_profile_banner_input")[0].files[0];

            //* On vériie la taille des images
            if (newProfilePictureFile && newProfilePictureFile.size > 2000000) {
                $("#message_area").html(
                    '<div class="alert alert-danger" role="alert">Fichier trop volumineux, votre photo de profil ne doit pas dépasser 2 Mo</div>'
                );
                $("#profile_picture_preview").attr(
                    "src",
                    "../../uploads/profile_pictures/" + currentProfilePicture
                );
                return;
            } else if (newProfileBannerFile && newProfileBannerFile.size > 2000000) {
                $("#message_area").html(
                    '<div class="alert alert-danger" role="alert">Fichier trop volumineux, votre bannière ne doit pas dépasser 2 Mo</div>'
                );
                formData.append("profile_banner", currentProfileBanner);
                $("#profile_banner_preview").attr(
                    "src",
                    "../../uploads/profile_banners/" + currentProfileBanner
                );
                return;
            }

            //* On vérifie si les nouvelles images sont différentes des images actuelles
            if (
                newProfilePictureFile &&
                newProfilePictureFile.name !== currentProfilePicture
            ) {
                formData.append("profile_picture", newProfilePictureFile);
            }
            if (
                newProfileBannerFile &&
                newProfileBannerFile.name !== currentProfileBanner
            ) {
                formData.append("profile_banner", newProfileBannerFile);
            }

            formData.append("action", "updateProfil");

            $.ajax({
                url: "../../back-end/controllers/user_controller.php",
                type: "POST",
                data: formData,
                dataType: "json",
                processData: false,
                contentType: false,
                success: function (response) {
                    if (response.status === "success") {
                        var newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?username=' + formData.get('username');
                        window.history.pushState({ path: newUrl }, '', newUrl);

                        $("#message_area").html(
                            '<div class="alert alert-success" role="alert">' +
                            response.message +
                            "</div>"
                        );

                        document.getElementById('overlay').classList.add('hidden');
                        window.location.reload();
                    } else {
                        $("#message_area").html(
                            '<div class="alert alert-danger" role="alert">' +
                            response.message +
                            "</div>"
                        );
                    }
                },
                error: function (xhr, status, error) {
                    $("#message_area").html(
                        '<div class="alert alert-danger" role="alert">Erreur AJAX: ' +
                        error +
                        "</div>"
                    );
                },
            });
        });
    });
});
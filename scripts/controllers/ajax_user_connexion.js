$(document).ready(function () {
    $(document).on('click', '#submit1, #submit2', function (event) {
        event.preventDefault();

        let form = $(this).closest('form');
        let email = form.find('input[type="text"]').val();
        let password = form.find('#password_co').val();

        $.ajax({
            url: '/back-end/controllers/user_controller.php',
            type: 'POST',
            data: {
                action: 'login',
                email: email,
                password: password
            },
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    window.location.href = '../../view/accueil.html';
                } else {
                    $("#alert-connexion").fadeIn();
                    setTimeout(function () {
                        $("#alert-connexion").fadeOut();
                    }, 3000);
                    return;
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert('Error: ' + errorThrown);
            }
        });
    });
});
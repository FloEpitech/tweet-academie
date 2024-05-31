$(document).ready(function () {
    $(document).on("click", "#submit", function (event) {
        event.preventDefault();

        let password = $("#password_log").val();
        let repeat_password = $("#repeat_password").val();
        let email = $("#email_log").val();
        let birthdate = $("#birthdate").val();
        let username = $("#username").val();
        let firstname = $("#firstname").val();
        let lastname = $("#lastname").val();
        let gender = $("#genre").val();

        if (!validateEmail(email)) {
            $("#alert-email").css("display", "block");
            $("#alert-password1").css("display", "none");
            $("#alert-password2").css("display", "none");
            $("#alert-birthdate").css("display", "none");
            $("#alert-username").css("display", "none");
            $("#alert-firstname").css("display", "none");
            $("#alert-lastname").css("display", "none");
            $("#alert-gender").css("display", "none");
            return;
        }

        if (!validatePassword(password)) {
            $("#alert-password1").css("display", "block");
            $("#alert-email").css("display", "none");
            $("#alert-password2").css("display", "none");
            $("#alert-birthdate").css("display", "none");
            $("#alert-username").css("display", "none");
            $("#alert-firstname").css("display", "none");
            $("#alert-lastname").css("display", "none");
            $("#alert-gender").css("display", "none");
            return;
        }

        if (password !== repeat_password) {
            $("#alert-password2").css("display", "block");
            $("#alert-email").css("display", "none");
            $("#alert-password1").css("display", "none");
            $("#alert-birthdate").css("display", "none");
            $("#alert-username").css("display", "none");
            $("#alert-firstname").css("display", "none");
            $("#alert-lastname").css("display", "none");
            $("#alert-gender").css("display", "none");
            return;
        }

        if (!validateFirstname(firstname)) {
            $("#alert-firstname").css("display", "block");
            $("#alert-password1").css("display", "none");
            $("#alert-password2").css("display", "none");
            $("#alert-email").css("display", "none");
            $("#alert-birthdate").css("display", "none");
            $("#alert-username").css("display", "none");
            $("#alert-lastname").css("display", "none");
            $("#alert-gender").css("display", "none");
            return;
        }

        if (!validateLastname(lastname)) {
            $("#alert-lastname").css("display", "block");
            $("#alert-password1").css("display", "none");
            $("#alert-password2").css("display", "none");
            $("#alert-email").css("display", "none");
            $("#alert-birthdate").css("display", "none");
            $("#alert-username").css("display", "none");
            $("#alert-firstname").css("display", "none");
            $("#alert-gender").css("display", "none");
            return;
        }

        if (!validateUsername(username)) {
            $("#alert-username").css("display", "block");
            $("#alert-password1").css("display", "none");
            $("#alert-password2").css("display", "none");
            $("#alert-email").css("display", "none");
            $("#alert-birthdate").css("display", "none");
            $("#alert-firstname").css("display", "none");
            $("#alert-lastname").css("display", "none");
            $("#alert-gender").css("display", "none");
            return;
        }

        if (!birthdate) {
            $("#alert-birthdate").css("display", "block");
            $("#alert-password1").css("display", "none");
            $("#alert-password2").css("display", "none");
            $("#alert-email").css("display", "none");
            $("#alert-username").css("display", "none");
            $("#alert-firstname").css("display", "none");
            $("#alert-lastname").css("display", "none");
            $("#alert-gender").css("display", "none");
            return;
        }

        let age = calculateAge(birthdate);
        if (age < 13 || age > 100) {
            $("#alert-birthdate").css("display", "block");
            $("#alert-password1").css("display", "none");
            $("#alert-password2").css("display", "none");
            $("#alert-email").css("display", "none");
            $("#alert-username").css("display", "none");
            $("#alert-firstname").css("display", "none");
            $("#alert-lastname").css("display", "none");
            $("#alert-gender").css("display", "none");
            return;
        }

        if (!gender) {
            $("#alert-gender").css("display", "block");
            $("#alert-password1").css("display", "none");
            $("#alert-password2").css("display", "none");
            $("#alert-email").css("display", "none");
            $("#alert-username").css("display", "none");
            $("#alert-firstname").css("display", "none");
            $("#alert-lastname").css("display", "none");
            $("#alert-birthdate").css("display", "none");
            return;
        }

        $.ajax({
            url: "../../back-end/controllers/user_controller.php",
            type: "POST",
            data: {
                action: "check_username",
                username: username
            },
            success: function (response) {
                var data = JSON.parse(response);
                if (data.exists) {
                    $("#alert-lastname").css("display", "none");
                    $("#alert-password1").css("display", "none");
                    $("#alert-password2").css("display", "none");
                    $("#alert-email").css("display", "none");
                    $("#alert-birthdate").css("display", "none");
                    $("#alert-username").css("display", "none");
                    $("#alert-firstname").css("display", "none");
                    $("#alert-gender").css("display", "none");
                    $("#alert-username-exists").css("display", "block");
                    return;
                } else {
                    $.ajax({
                        url: "../../back-end/controllers/user_controller.php",
                        type: "POST",
                        data: {
                            action: "register",
                            genre: $("#genre").val(),
                            email: email,
                            birthdate: $("#birthdate").val(),
                            username: $("#username").val(),
                            firstname: $("#firstname").val(),
                            lastname: $("#lastname").val(),
                            password: password,
                            repeat_password: repeat_password,
                        },
                        success: function (response) {
                            $("#alert-compte").css("display", "block");
                            $("#alert-lastname").css("display", "none");
                            $("#alert-password1").css("display", "none");
                            $("#alert-password2").css("display", "none");
                            $("#alert-email").css("display", "none");
                            $("#alert-birthdate").css("display", "none");
                            $("#alert-username").css("display", "none");
                            $("#alert-firstname").css("display", "none");
                            $("#alert-gender").css("display", "none");
                            $("#alert-username-exists").css("display", "none");
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            alert("Error: " + errorThrown);
                        },
                    });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert("Error: " + errorThrown);
            },
        });
    });

    function validateEmail(email) {
        let emailRegex = /^\S+@\S+\.\S+$/;
        return emailRegex.test(email);
    }

    function validatePassword(password) {
        let passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
        return passwordRegex.test(password);
    }

    function calculateAge(birthdate) {
        let today = new Date();
        let birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        let month = today.getMonth() - birthDate.getMonth();
        if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    function validateUsername(username) {
        let usernameRegex = /^[a-zA-Z0-9]{1,10}$/;
        return usernameRegex.test(username);
    }

    function validateFirstname(firstname) {
        let firstnameRegex = /^[a-zA-Z]{1,25}$/;
        return firstnameRegex.test(firstname);
    }

    function validateLastname(lastname) {
        let lastnameRegex = /^[a-zA-Z]{1,25}$/;
        return lastnameRegex.test(lastname);
    }
});
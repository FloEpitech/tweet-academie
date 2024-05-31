$(document).ready(function () {
    $.ajax({
        url: '../../back-end/controllers/user_controller.php',
        type: 'POST',
        data: {
            action: 'createHashtag',
            tweet_id: $('#tweet_id').val(),
            rtweet_id: $('#rtweet_id').val(),
            hashtag: $('#hashtag').val()
        },
        success: function (response) {
            var data = JSON.parse(response);
            if (data.status === 'success') {
                alert(data.message);
            } else {
                alert(data.message);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('Une erreur est survenue lors de la création du hashtag: ' + errorThrown);
        }
    });
});
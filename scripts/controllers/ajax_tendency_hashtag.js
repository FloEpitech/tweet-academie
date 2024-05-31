$(document).ready(function () {
    var data;
    var currentIndex = 0;
    var count = 5;

    function showHashtags() {
        var trendsDiv = $('#trendsDiv');
        for (var i = currentIndex; i < currentIndex + count && i < data.length; i++) {
            var hashtag = data[i];
            var hashtagDiv = `
                <div class="flex-1">
                    <p class="px-4 ml-2 mt-3 w-48 text-xs text-gray-400">${i + 1} . </p>
                    <a href="" class="px-4 ml-2 w-48 font-bold dark:text-white text-black hover:text-blue-300 ">#${hashtag.name}</a>
                    <p class="px-4 ml-2 mb-3 w-48 text-xs text-gray-400">${hashtag.count} Tweets</p>
                </div>
                <div class="flex-1 px-4 py-2 m-2"></div>
                <hr class="border-slate-400 dark:border-stone-500">
            `;
            trendsDiv.append(hashtagDiv);
        }
        currentIndex += count;
    }

    function hideHashtags() {
        var trendsDiv = $('#trendsDiv');
        for (var i = 0; i < count; i++) {
            trendsDiv.children().last().remove();
            trendsDiv.children().last().remove();
            trendsDiv.children().last().remove();
        }
        currentIndex -= count;
    }

    $.ajax({
        url: '../../back-end/controllers/tweet_controller.php',
        type: 'GET',
        data: {
            action: 'get_trending_hashtags'
        },
        success: function (response) {
            data = JSON.parse(response);
            showHashtags();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('Une erreur est survenue lors de la récupération des hashtags tendances: ' + errorThrown);
        }
    });

    $('#showMoreButton').click(function () {
        var button = $(this);
        if (button.text() === 'Show more') {
            showHashtags();
            button.text('Show less');
        } else {
            hideHashtags();
            button.text('Show more');
        }
    });
});
$(document).ready(function () {
    $("#tweetText").on("input", function () {
        var maxCharacters = 140;
        if (this.value.length > maxCharacters) {
            this.value = this.value.substr(0, maxCharacters);
        }
        updateCharacterCount();
    });

    function updateCharacterCount() {
        const maxCharacters = 140;
        const currentCharacters = $("#tweetText").val().length;
        const circumference = 2 * Math.PI * 45; 
        const percentageUsed = currentCharacters / maxCharacters;
        const strokeDashoffset = circumference * (1 - percentageUsed);

        $("#progress").css('stroke-dashoffset', strokeDashoffset);

        $("#progress").css('stroke', '#007bff');
    }

    $("#progressCircle").hide();

    $("#tweetText").on("focus", function () {
        $("#progressCircle").show();
        updateCharacterCount();
    });

    $("#tweetText").on("blur", function () {
        $("#progressCircle").hide();
    });

    updateCharacterCount();
});

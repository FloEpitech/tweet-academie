tailwind.config = {
    darkMode: 'class',
}


$(document).ready(function () {
    var currentTheme;

    // Get the current theme from the database when the page is loaded
    $.ajax({
        url: '../../back-end/controllers/user_controller.php',
        type: 'POST',
        data: {
            action: 'getTheme'
        },
        success: function (response) {
            var data = JSON.parse(response);
            if (data.status === 'success') {
                currentTheme = String(data.theme);
                console.log('le theme est ' + currentTheme);

                if (currentTheme === '1') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            } else {
                alert('Erreur lors de la récupération du thème');
            }
        }
    });

    $('#theme-toggle').click(function () {
        var theme = String(currentTheme) === '1' ? '0' : '1';

        $.ajax({
            url: '../../back-end/controllers/user_controller.php',
            type: 'POST',
            data: {
                action: 'updateTheme',
                theme: theme
            },
            success: function (response) {
                var data = JSON.parse(response);
                if (data.status === 'success') {
                    currentTheme = String(data.theme);
                    console.log('le theme est ' + currentTheme);

                    if (currentTheme === '1') {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                } else {
                    alert('Erreur lors de la mise à jour du thème');
                }
            }
        });
    });
});
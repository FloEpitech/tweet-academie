$(document).ready(function () {
    var recipient_username = sessionStorage.getItem('recipient_username');

    $("#recipient_id").text(recipient_username);
    console.log('Nom d\'utilisateur du destinataire : ' + recipient_username);

});
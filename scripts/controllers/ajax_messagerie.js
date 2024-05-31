function createMessageHTML(message) {
    return '<p><strong>' + message.username + ':</strong> ' + message.messages + '</p>';
}

$(document).ready(function () {

    function addConversationToDiv(sender_id, recipient_id, recipient_username, recipient_profile_pic) {

        var existingConversation = $('.conversation[data-sender-id="' + sender_id + '"][data-recipient-id="' + recipient_id + '"], .conversation[data-sender-id="' + recipient_id + '"][data-recipient-id="' + sender_id + '"]');
        if (existingConversation.length > 0) {
            return;
        }

        var conversationHTML = '<div class="conversation flex items-center border-b border-gray-200 hover:bg-gray-100 cursor-pointer p-2" data-sender-id="' + sender_id + '" data-recipient-id="' + recipient_id + '">' +
            '<img class="w-12 h-12 rounded-full mr-4 border-2 border-black" src="' + recipient_profile_pic + '" alt="' + recipient_username + '\'s profile picture">' +
            '<span class="text-black">' + recipient_username + '</span>' +
            '<button class="delete-conversation bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-auto">Supprimer</button>' +
            '</div>';
        var $conversation = $(conversationHTML).appendTo('#conversations');

        $conversation.find('.delete-conversation').click(function (event) {
            event.stopPropagation();

            if (confirm('Voulez-vous vraiment supprimer cette conversation ?')) {
                $.ajax({
                    url: '../../back-end/controllers/messagerie_controller.php',
                    type: 'POST',
                    data: {
                        action: 'deleteConversation',
                        sender_id: sender_id,
                        recipient_id: recipient_id
                    },
                    success: function (response) {
                        let data = JSON.parse(response);
                        if (data.status === 'success') {
                            $conversation.remove();
                            getMessages();
                        } else {
                            alert(data.message);
                        }
                    },
                    error: function () {
                        alert('Une erreur est survenue lors de la suppression de la conversation');
                    }
                });
            }
        });

        $conversation.click(function () {
            var sender_id = $(this).data('sender-id');
            var recipient_id = $(this).data('recipient-id');

            $.ajax({
                url: '../../back-end/controllers/messagerie_controller.php',
                type: 'POST',
                data: {
                    action: 'setSessionVariables',
                    sender_id: sender_id,
                    recipient_id: recipient_id
                },
                success: function (response) {
                    getMessages(sender_id, recipient_id);
                    console.log('sender_id: ' + sender_id + ' recipient_id: ' + recipient_id);
                },
                error: function () {
                    alert('Une erreur est survenue lors de la définition des variables de session');
                }
            });
        });
    }

    function getConversations() {
        $.ajax({
            url: '../../back-end/controllers/messagerie_controller.php',
            type: 'POST',
            data: {
                action: 'getConversations'
            },
            success: function (response) {
                let data = JSON.parse(response);
                if (data.status === 'success') {
                    data.conversations.forEach(function (conversation) {
                        addConversationToDiv(
                            conversation.sender_id,
                            conversation.recipient_id,
                            conversation.recipient_username,
                            conversation.recipient_profile_picture
                        );
                    });
                } else {
                    alert(data.message);
                }
            },
            error: function () {
                alert('Une erreur est survenue lors de la récupération des conversations');
            }
        });
    }

    function getMessages(sender_id, recipient_id) {
        $.ajax({
            url: '../../back-end/controllers/messagerie_controller.php',
            type: 'POST',
            data: {
                action: 'getMessages',
                sender_id: sender_id,
                recipient_id: recipient_id
            },
            success: function (response) {
                let data = JSON.parse(response);
                console.log(data);
                if (data.status === 'success') {
                    let messagesHTML = data.messages.map(createMessageHTML).join('');
                    $("#messages").html(messagesHTML);
                } else {
                    alert(data.message);
                }
            },
            error: function () {
                alert('Une erreur est survenue lors de la récupération des messages');
            }
        });
    }

    getConversations();


    $(document).ready(function () {
        let recipient_id = sessionStorage.getItem('recipient_id');
        let recipient_username = sessionStorage.getItem('recipient_username');
        let show_form = sessionStorage.getItem('show_form');

        if (recipient_id && recipient_username && show_form) {
            $("#messageForm").removeClass('hidden');
            $("#messages").removeClass('hidden');
            sessionStorage.removeItem('show_form');
        }
    });

    $(document).ready(function () {
        let url = window.location.href;
        if (url.indexOf('profil.html') !== -1) {
            let recipient_username = new URL(url).searchParams.get('username');

            $.ajax({
                url: '../../back-end/controllers/messagerie_controller.php',
                type: 'POST',
                data: {
                    action: 'getUserIdFromUsername',
                    username: recipient_username
                },
                success: function (response) {
                    let data = JSON.parse(response);
                    if (data.status === 'success') {
                        $.ajax({
                            url: '../../back-end/controllers/messagerie_controller.php',
                            type: 'POST',
                            data: {
                                action: 'getConnectedUserId'
                            },
                            success: function (response) {
                                let connectedUserData = JSON.parse(response);
                                if (connectedUserData.status === 'success') {
                                    if (data.id === connectedUserData.id) {
                                        $("#contact-button").hide();
                                    } else {
                                        sessionStorage.setItem('recipient_id', data.id);
                                        sessionStorage.setItem('recipient_username', recipient_username);
                                        sessionStorage.setItem('show_form', 'true');
                                    }
                                } else {
                                    return (connectedUserData.message);
                                }
                            },
                            error: function () {
                                alert('Une erreur est survenue lors de la récupération de l\'ID de l\'utilisateur connecté');
                            }
                        });
                    } else {
                        return (data.message);
                    }
                },
                error: function () {
                    alert('Une erreur est survenue lors de la récupération de l\'ID de l\'utilisateur');
                }
            });
        }
    });

    $("#contact-button").click(function (event) {
        event.preventDefault();

        let recipient_username = new URL(window.location.href).searchParams.get('username');

        $.ajax({
            url: '../../back-end/controllers/messagerie_controller.php',
            type: 'POST',
            data: {
                action: 'getUserIdFromUsername',
                username: recipient_username
            },
            success: function (response) {
                let data = JSON.parse(response);
                if (data.status === 'success') {
                    sessionStorage.setItem('recipient_id', data.id);
                    sessionStorage.setItem('recipient_username', recipient_username);
                    sessionStorage.setItem('show_form', 'true');
                    window.location.href = '../view/messagerie.html';
                } else {
                    return (data.message);
                }
            },
            error: function () {
                alert('Une erreur est survenue lors de la récupération de l\'ID de l\'utilisateur');
            }
        });
    });

    $("#messageForm").submit(function (event) {
        event.preventDefault();

        let sender_id = sessionStorage.getItem('sender_id');
        let recipient_id = sessionStorage.getItem('recipient_id');
        let recipient_username = sessionStorage.getItem('recipient_username');
        let message = $("#message").val();

        $.ajax({
            url: '../../back-end/controllers/messagerie_controller.php',
            type: 'POST',
            data: {
                action: 'createPrivateMessage',
                recipient_id: recipient_id,
                message: message
            },
            success: function (response) {
                let data = JSON.parse(response);
                if (data.status === 'success') {
                    $("#message").val('');
                    getMessages(sender_id, recipient_id);
                    $('#conversations').empty();
                    getConversations();
                } else {
                    alert(data.message);
                }
            },
            error: function () {
                alert('Une erreur est survenue lors de l\'envoi du message');
            }
        });
    });

    $(document).on('click', '.conversation', function () {
        $("#messageForm").toggleClass('hidden');
        $("#messages").toggleClass('hidden');
    });

});
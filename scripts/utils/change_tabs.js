document.addEventListener('DOMContentLoaded', () => {

    let buttons = document.querySelectorAll('.flex.gap-4 button');

    let contents = document.querySelectorAll('#followers, #followings, #content-central');

    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {

            contents.forEach(content => content.classList.add('hidden'));


            buttons.forEach(btn => btn.classList.remove('border-blue-400'));
            button.classList.add('border-blue-400');


            if (contents[index]) {
                contents[index].classList.remove('hidden');
            }
        });
    });
});
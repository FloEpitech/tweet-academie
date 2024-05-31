document.addEventListener('DOMContentLoaded', function () {

    document.querySelector('.inline-block.cursor-pointer.mr-2').addEventListener('click', function () {
        document.getElementById('overlay').classList.remove('hidden');
    });

    document.getElementById('user-website').addEventListener('click', function () {
        var url = this.textContent;
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }
        window.open(url, '_blank').focus();
    });
});

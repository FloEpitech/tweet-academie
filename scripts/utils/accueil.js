document.addEventListener("DOMContentLoaded", function () {

    document.getElementById('icons1').addEventListener('click', function () {
        this.innerHTML = `
    <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M256 319.841c-35.346 0-64 28.654-64 64v128h128v-128c0-35.346-28.654-64-64-64z" fill="#1dbada" opacity="1" data-original="#000000" class=""></path><path d="M362.667 383.841v128H448c35.346 0 64-28.654 64-64V253.26a42.665 42.665 0 0 0-12.011-29.696l-181.29-195.99c-31.988-34.61-85.976-36.735-120.586-4.747a85.355 85.355 0 0 0-4.747 4.747L12.395 223.5A42.669 42.669 0 0 0 0 253.58v194.261c0 35.346 28.654 64 64 64h85.333v-128c.399-58.172 47.366-105.676 104.073-107.044 58.604-1.414 108.814 46.899 109.261 107.044z" fill="#1dbada" opacity="1" data-original="#000000" class=""></path><path d="M256 319.841c-35.346 0-64 28.654-64 64v128h128v-128c0-35.346-28.654-64-64-64z" fill="#1dbada" opacity="1" data-original="#000000" class=""></path></g></svg>
    <span>Acceuil</span>
    `;
    });


    document.getElementById('icons2').addEventListener('click', function () {
        this.innerHTML = `
    <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 24 24" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="m23.259 16.2-2.6-9.371A9.321 9.321 0 0 0 2.576 7.3L.565 16.35A3 3 0 0 0 3.493 20H7.1a5 5 0 0 0 9.8 0h3.47a3 3 0 0 0 2.89-3.8ZM12 22a3 3 0 0 1-2.816-2h5.632A3 3 0 0 1 12 22Zm9.165-4.395a.993.993 0 0 1-.8.395H3.493a1 1 0 0 1-.976-1.217l2.011-9.05a7.321 7.321 0 0 1 14.2-.372l2.6 9.371a.993.993 0 0 1-.163.873Z" data-name="01 align center" fill="#1dbada" opacity="1" data-original="#000000" class=""></path></g></svg>
    <span>Notifications</span>
    `;
    });


    document.getElementById('icons3').addEventListener('click', function () {
        this.innerHTML = `
    <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 24 24" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M19 1H5a5.006 5.006 0 0 0-5 5v12a5.006 5.006 0 0 0 5 5h14a5.006 5.006 0 0 0 5-5V6a5.006 5.006 0 0 0-5-5ZM5 3h14a3 3 0 0 1 2.78 1.887l-7.658 7.659a3.007 3.007 0 0 1-4.244 0L2.22 4.887A3 3 0 0 1 5 3Zm14 18H5a3 3 0 0 1-3-3V7.5l6.464 6.46a5.007 5.007 0 0 0 7.072 0L22 7.5V18a3 3 0 0 1-3 3Z" fill="#1dbada" opacity="1" data-original="#000000" class=""></path></g></svg>
    <span>Messages</span>
    `;
    });

});

document.addEventListener('DOMContentLoaded', function () {

    const container = document.querySelector('.w-96.mx-auto.h-96');
    let initialContent = container.innerHTML;

    function attachInitialEventListeners() {
        document.getElementById('signupButton').addEventListener('click', showSignupForm);
        document.getElementById('loginButton').addEventListener('click', showLoginForm);
    }

    function restoreInitialContent() {
        container.innerHTML = initialContent;
        attachInitialEventListeners();
    }

    function showSignupForm() {
        const container = document.querySelector('.w-96.mx-auto.h-96');
        container.innerHTML = `
<form class="max-w-md mx-auto w-96">
<div class="relative z-0 w-full mb-5 group">
<input type="email" name="email_log" id="email_log" class="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
<label for="email" class="peer-focus:font-medium absolute text-sm text-white dark:text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Email address</label>
</div>

<div class="relative z-0 w-full mb-5 group">
<input type="password" name="password_log" id="password_log" class="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
<label for="password" class="peer-focus:font-medium absolute text-sm text-white dark:text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Password</label>
</div>

<div class="relative z-0 w-full mb-5 group">
<input type="password" name="repeat_password" id="repeat_password" class="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder="" required/>
<label for="repeat_password" class="peer-focus:font-medium absolute text-sm text-white dark:text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Confirm password</label>
</div>

<div class="grid md:grid-cols-2 md:gap-6 ">
<div class="relative z-0 w-full mb-5 group">
<input type="text" name="firstname" id="firstname" class="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
<label for="firstname" class="peer-focus:font-medium absolute text-sm text-white dark:text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">First name</label>
</div>

<div class="relative z-0 w-full mb-5 group">
<input type="text" name="lastname" id="lastname" class="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
<label for="lastname" class="peer-focus:font-medium absolute text-sm text-white dark:text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Last name</label>
</div>
</div>

<div class="grid md:grid-cols-2 md:gap-6">

<div class="relative z-0 w-full mb-5 group">
<input type="text" name="username" id="username" class="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
<label for="username" class="peer-focus:font-medium absolute text-sm text-white dark:text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Username</label>
</div>

<div class="relative z-0 w-full mb-5 group">
<input type="date" name="birthdate" id="birthdate" class="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder="" required />
<label for="birthdate" class="peer-focus:font-medium absolute text-sm text-white dark:text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Date of Birth</label>
</div>


<div class="relative z-0 w-full mb-5 group">
<select id="genre" name="genre" class="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" required>
<option value="" disabled selected hidden>Select your genre</option>
<option value="man">Man</option>
<option value="woman">Women</option>
<option value="other">Other</option>
</select>
<label for="genre" class="peer-focus:font-medium absolute text-sm text-white dark:text-white duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Genre</label>
</div>
</div>

<div id="alert-email" class="hidden mb-2">
<div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
    Invalid email!
</div>
<div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
    <p>Please enter a valid email (example : twitter@twitter.com)</p>
</div>
</div>

<div id="alert-password1" class="hidden mb-2">
<div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
    Invalid password!
</div>
<div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
    <p>Please enter a valid password (6 characters minimum, 1 uppercase letter, 1 number)</p>
</div>
</div>

<div id="alert-password2" class="hidden mb-2">
<div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
    Invalid password!
</div>
<div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
    <p>Passwords don't match</p>
</div>
</div>

<div id="alert-birthdate" class="hidden mb-2">
<div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
    Invalid birthdate!
</div>
<div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
    <p>Please enter a valid birthdate (13 years old minimum)</p>
</div>
</div>

<div id="alert-username" class="hidden mb-2">
<div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
    Invalid username!
</div>
<div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
    <p>The username must not contain more than 10 characters and must not contain any special characters</p>
</div>
</div>

<div id="alert-firstname" class="hidden mb-2">
<div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
    Firstname invalid!
</div>
<div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
    <p>Please enter a valid firstname</p>
</div>
</div>

<div id="alert-lastname" class="hidden mb-2">
<div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
    Lastname invalid!
</div>
<div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
    <p>Please enter a valid lastname</p>
</div>
</div>

<div id="alert-gender" class="hidden mb-2">
<div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
    Gender invalid!
</div>
<div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
    <p>Please choose a gender.</p>
</div>
</div>

<div id="alert-username-exists" class="hidden mb-2">
<div class="bg-red-500 text-white font-bold rounded-t px-4 py-2">
    Username Invalid!
</div>
<div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
    <p>This username is already exist, please choose a other username.</p>
</div>
</div>

<div class="bg-blue-100 border-t border-b border-blue-500 text-blue-700 px-4 py-3 hidden" id="alert-compte">
  <p class="font-bold">Account created</p>
  <p class="text-sm">You can now log in!</p>
</div>

<button type="submit" id="submit" class="border-2 border-blue-700 w-full rounded-full font-medium text-white bg-blue-700 hover:bg-[#15202b] hover:text-blue-700 focus:outline-none focus:shadow-outline  h-8 transition duration-150 ease-in-out">Submit</button>
</form>
<button id="returnButton" class="border-2 border-blue-700 w-full rounded-full font-medium hover:bg-blue-700 bg-[#15202b] hover:text-white text-blue-700 focus:outline-none focus:shadow-outline  h-8 transition duration-150 ease-in-out mt-3">Back</button>`;
        container.querySelector('#returnButton').addEventListener('click', restoreInitialContent);
    }

    function showLoginForm() {
        const container = document.querySelector('.w-96.mx-auto.h-96');
        container.innerHTML = `
<form id="loginForm2" class="max-w-md mx-auto ">

<div class="relative z-0 w-full mb-5 group">
<input type="text" name="email" id="email" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
<label for="email" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Email address / Username</label>
</div>

<div class="relative z-0 w-full mb-5 group">
<input type="password" name="password_co" id="password_co" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
<label for="password" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Password</label>
</div>

<button type="submit" id="submit2" class="border-2 border-blue-700 w-full rounded-full font-medium text-white bg-blue-700 hover:bg-[#15202b] hover:text-blue-700 focus:outline-none focus:shadow-outline  h-8 transition duration-150 ease-in-out">Submit</button>
</form>


<button id="returnButton" class="border-2 border-blue-700 w-full rounded-full font-medium hover:bg-blue-700 bg-[#15202b] hover:text-white text-blue-700 focus:outline-none focus:shadow-outline  h-8 transition duration-150 ease-in-out mt-3">Back</button>

`;
        container.querySelector('#returnButton').addEventListener('click', restoreInitialContent);
    }

    attachInitialEventListeners();
});
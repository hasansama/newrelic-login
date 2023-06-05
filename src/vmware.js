console.log("asdfsdf vmware.js")
document.addEventListener('DOMContentLoaded', function () {
    console.log("vmware.js worked")
    const userInput = document.querySelector('#userInput');
    if (userInput) {
        userInput.value = 'Your value here';
    } else {
        console.log('Error: #userInput element not found on the page');
    }
});
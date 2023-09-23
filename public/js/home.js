fetch('/check-profile', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
}).then(response => {
    if(response.status === 200) {
    // Handle the response if needed
    console.log(true)
    document.querySelector(".user_icon").setAttribute("onclick", "window.location.href='/profile'")
    }
    console.log(response)

}).catch(error => {
    console.error('Error storing order:', error);
});
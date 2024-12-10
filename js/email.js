function sendMail(){
    let params = {
        recipient: document.getElementById("recipient").value,
        first_name: document.getElementById("first_name").value,
        last_name: document.getElementById("last_name").value,
        email: document.getElementById("email").value,
        message: document.getElementById("message").value,
    }

    emailjs.send("service_gpyaa9d", "template_3pezxsg", params).then(alert("Email has been sent"));
    
}
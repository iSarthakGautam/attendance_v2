function getVal() {
    var val=document.getElementById("problem").value;
    console.log(val);
    let data = {'text' : val}
    webhook_url="https://chat.googleapis.com/v1/spaces/AAAAAuTM4gk/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=nWvEYPvP9wFsHOi0OMDYqhHdexhWp2svr5ITSs5kH00%3D"
    fetch(webhook_url, {
        method : 'POST',
        body : JSON.stringify(data)
        }).then(r => r.json()
        ).then(d => console.log(d)
        ).catch(e => console.log("Some error occured:", e))

        Swal.fire({
            icon: 'success',
            title: 'Report Submitted',

            })

        document.getElementById("problem").value="";
    
  }

function redirect_teacher(){
    
    var currentUrl = window.location.href;
    var splitUrl = currentUrl.toString().split("report_a_problem")
    re_url=splitUrl[0]+"teacher"
    window.location.href = re_url
}

function redirect_student(){
    var currentUrl = window.location.href;
    var splitUrl = currentUrl.toString().split("report_a_problem")
    re_url=splitUrl[0]
    window.location.href = re_url
}


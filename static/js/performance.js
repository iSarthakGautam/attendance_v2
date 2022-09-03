function redirect_to_student(){
    roll_number=localStorage.getItem("roll_no_att_app")
    var currentUrl = window.location.href;
    var splitUrl = currentUrl.toString().split("performance")
    re_url=splitUrl[0]
    window.location.href = re_url
    // console.log(re_url)
    //change the current url
  }


// Redirect to Problem Function
//name_att_app

student_info="<p>Name: "+localStorage.getItem("name_att_app")+"<br><br> Roll N0.: "+localStorage.getItem("roll_no_att_app")

document.getElementById("student_info").innerHTML = student_info;

  
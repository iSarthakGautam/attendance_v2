function redirect_to_teacher(){
    roll_number=localStorage.getItem("roll_no_att_app")
    var currentUrl = window.location.href;
    var splitUrl = currentUrl.toString().split("get_attendance")
    re_url=splitUrl[0]+"/teacher"
    window.location.href = re_url


  }
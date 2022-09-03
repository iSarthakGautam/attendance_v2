function redirect_to_teacher(){
  var currentUrl = window.location.href;
  var splitUrl = currentUrl.toString().split("#")
  re_url=splitUrl[0]+"teacher"
  window.location.href = re_url
  // console.log(re_url)
}
function redirect_to_problem(){
  var currentUrl = window.location.href;
  var splitUrl = currentUrl.toString().split("#")
  re_url=splitUrl[0]+"report_a_problem"
  window.location.href = re_url
  // console.log(re_url)
}

function redirect_to_performance(){
  var currentUrl = window.location.href;
  var splitUrl = currentUrl.toString().split("#")
  re_url=splitUrl[0]+"performance/"+localStorage.getItem("roll_no_att_app")
  window.location.href = re_url
  // console.log(re_url)
}

function roll_alert(){
  Swal.fire({
    title: "Enter Roll_number!",
    text: "Enter 1234 if Roll No is 1234/20",
    input: 'number',
    showCancelButton: false        
}).then((result) => {
    if (result.value) {
      localStorage.setItem("roll_no_att_app",result.value)
      roll_number=localStorage.getItem("roll_no_att_app")
      var currentUrl = window.location.href;
      var splitUrl = currentUrl.toString().split("#");
      api_url=splitUrl[0]+"api/getname/"+roll_number
      fetch(api_url,{headers:{
        'Content-Type':'application/json',
      }}).then(response => response.json())
      .then(d => localStorage.setItem("name_att_app",d.Message));
      location.reload();
          }
      });



}





const Home = { 
  data: function(){
    return {
      name:localStorage.getItem("name_att_app"),
      subjects:JSON.parse(sessionStorage.getItem("subjects_att_app"))
    }
  },
  template: `<h2>Hi {{ name }}, <br><br>Select Subject</h2>
  
<div id="Subject_option" v-for="x in subjects">
<br><br>
<div id="button_grey">
<router-link  :to="{ name: 'subjects', params: { subject_name: x }}">{{x}}</router-link>
</div>
<br>
</div>
  <p>
  
  </p>`,

  
 }




const specific_subject = { 
  data: function(){
    return {
      name:localStorage.getItem("name_att_app"),
      inp:""
      
    }
  },
  template: `<h2>Hi {{name}}, <br><br>Register Attendance For {{$route.params.subject_name}}</h2>
<div id="Subject_option">
<br><br>
<input type="text" id="s_pin" name="s_pin"  v-model="inp" placeholder="Enter Pin"><br><br><br>

<button id="button_grey" @click="register_att">Submit</button><br><br><br>
<div id="router_div">
<router-link to="/">Go to Home</router-link>
</div>
</div>` ,
methods:{
  register_att: async function register_attendance_api(){
    var currentUrl = window.location.href;
    var splitUrl = currentUrl.toString().split("#");
    var subj_url = splitUrl[1].toString().split("/");
    api_url=splitUrl[0]+"api/subject/"+subj_url[2]
    var send_data = { "att_pin":this.inp,"roll_number":localStorage.getItem("roll_no_att_app")}; //random data change later

    var response=await fetch(api_url,{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body: JSON.stringify(send_data),
    });
    console.log(response)
    if (response.status==200){
      Swal.fire({
        icon: 'success',
        title: 'Attendance Registered',
        text: 'You Can Now Close the app',
        })
    }
    if (response.status==201){
      Swal.fire({
        icon: 'success',
        title: 'Attendance Already Registered',
        text: 'You Can Now Close the app',
        })
    }
    if (response.status==401){
      Swal.fire({
        icon: 'error',
        title: 'Wrong Pin',
        text: 'Enter Correct pin again',
        })
    }
    if (response.status==404){
      Swal.fire({
        icon: 'error',
        title: 'Something Went Wrong',
        text: "Try Editing roll_number" ,
        })
    }
    
  }
}

}


const routes = [
  { path: '/', component: Home },
  { path: '/subject/:subject_name', component: specific_subject ,name: 'subjects',
  props: true },
]


const router = VueRouter.createRouter({
  
  history: VueRouter.createWebHashHistory(),
  routes, // short for `routes: routes`
})

const { createApp } = Vue


const app = Vue.createApp({
  data() {
    return {
      st_name: localStorage.getItem("name_att_app"),
      subjects:[]

    }
  },
  mounted: function() {
    if (localStorage.getItem("roll_no_att_app")==null){
      Swal.fire({
        title: "Enter Roll_number!",
        text: "Enter 1234 if Roll No is 1234/20",
        input: 'number',
        showCancelButton: false        
    }).then((result) => {
        if (result.value) {
          localStorage.setItem("roll_no_att_app",result.value)
          roll_number=localStorage.getItem("roll_no_att_app")
          var currentUrl = window.location.href;
          var splitUrl = currentUrl.toString().split("#");
          api_url=splitUrl[0]+"api/getname/"+roll_number
          fetch(api_url,{headers:{
            'Content-Type':'application/json',
          }}).then(response => response.json())
          .then(d => localStorage.setItem("name_att_app",d.Message));
          location.reload();
              }
          });
    }
    



    roll_number=localStorage.getItem("roll_no_att_app")
    var currentUrl = window.location.href;
    var splitUrl = currentUrl.toString().split("#");


    subject_api_url=splitUrl[0]+"api/subject"
    fetch(subject_api_url,{headers:{
      'Content-Type':'application/json',
    }}).then(response => response.json())
    .then(d => {sessionStorage.setItem("subjects_att_app",JSON.stringify(d.subjects))
  });
    this.subjects=JSON.parse(sessionStorage.getItem("subjects_att_app"))
    

  }

})


app.use(router)
app.mount('#app')
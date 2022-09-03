function redirect_to_student(){
    roll_number=localStorage.getItem("roll_no_att_app")
    var currentUrl = window.location.href;
    var splitUrl = currentUrl.toString().split("teacher")
    re_url=splitUrl[0]
    window.location.href = re_url

  }
  
  

  function   redirect_to_problem(){
    roll_number=localStorage.getItem("roll_no_att_app")
    var currentUrl = window.location.href;
    var splitUrl = currentUrl.toString().split("teacher")
    re_url=splitUrl[0]+"report_a_problem"
    window.location.href = re_url

  }

function  redirect_to_download(){
  roll_number=localStorage.getItem("roll_no_att_app")
    var currentUrl = window.location.href;
    var splitUrl = currentUrl.toString().split("teacher")
    re_url=splitUrl[0]+"get_attendance"
    window.location.href = re_url
}

function reset_pin_dialogue(message){
  if (message.Status='true'){
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Pin has been reset!, No More attendance',
      
    })
  }
  else{
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: 'Something went wrong:(',
      
    })
  }
}

function pin_dialouge(message){
  if (message.body=="Wrong Pin"){
    Swal.fire({
      icon: 'error',
      title: 'Wrong Pin',
      text: "Try Re-Writing" ,
      })
  }

  else if (message.body) {
    let timerInterval
    x_pin='Pin : '+message.body
    
Swal.fire({
  title: x_pin,
  html: 'Automatic Close after <b></b> Sec.<br> Do not interfere.',
  timer: 300000,   // replace it for 5 min
  timerProgressBar: true,
  didOpen: () => {
    Swal.showLoading()
    const b = Swal.getHtmlContainer().querySelector('b')
    timerInterval = setInterval(() => {
      b.textContent = Math.trunc((Swal.getTimerLeft())/1000)
    }, 100)
  },
  willClose: () => {
    clearInterval(timerInterval)
  }
}).then((result) => {
  /* Read more about handling dismissals below */
  if (result.dismiss === Swal.DismissReason.timer) {
    var val=document.getElementById("tpin").value;
    var currentUrl = window.location.href;
      var splitUrl = currentUrl.toString().split("#");
      var subj_url = splitUrl[1].toString().split("/");
      api_url=splitUrl[0]+"/api/subject/"+subj_url[2]
      var send_data = { "t_pin":val}; //random data change later
     
      fetch(api_url,{
        method:"PUT",
        headers:{
        'Content-Type':'application/json',
        },
        body: JSON.stringify(send_data)
      }).then(response => response.json())
      .then(d => reset_pin_dialogue(d));
  }
})
  }

  else{
    Swal.fire({
      icon: 'warning',
      title: 'Something Went Wrong',
      text: "Kindly Report" ,
      })
  }
}


  const Home = { 
    data: function(){
      return {
        subjects:JSON.parse(sessionStorage.getItem("subjects_att_app"))
      }
    },
    template: `<h2>Hi Teacher, <br><br>Select Subject</h2>
  <div id="Subject_option" v-for="x in subjects">
  <br><br>
  <div id="button_grey">
  <router-link  :to="{ name: 'subjects', params: { subject_name: x }}">{{x}}</router-link>
  </div>
  <br>
  
  </div>
  <br><br>
  <div id="Subject_option">
  <div id="button_red">
  <router-link  to=/add_a_subject>+ Subject</router-link>
  </div>
  <br><br>
  <div id="button_green">
  <router-link  to=/add_a_student>+ Student</router-link>
  </div>
  </div>
    <p>
      
    </p>`,
  
    
   }
  
  


  
  
  const specific_subject = { 
    data: function(){
      return {
        inp:""
        
      }
    },
    template: `<h2>Hi Teacher <br><br>Generate a pin</h2>
    <div id="Subject_option">
    <br><br>
    <input type="password" id="tpin" v-model="inp" name="tpin" placeholder="Teacher Pin"><br><br>
    <button id="button_grey" @click="request_pin">Generate</button><br><br><br><br>
    <div id="router_div">
    <router-link  to=/>Go Back</router-link>
    </div>
    </div>` ,
  methods:{
    request_pin: async function req_pin(){
      var currentUrl = window.location.href;
      var splitUrl = currentUrl.toString().split("#");
      var subj_url = splitUrl[1].toString().split("/");
      api_url=splitUrl[0]+"/api/subject/"+subj_url[2]
      var send_data = { "t_pin":this.inp}; //random data change later
     
      fetch(api_url,{
        method:"POST",
        headers:{
        'Content-Type':'application/json',
        },
        body: JSON.stringify(send_data)
      }).then(response => response.json())
      .then(d => pin_dialouge(d));
      
     
      
      
    }
  }
  
  }

  
  
  const addsub = { 
    data: function(){
      return {
        subjects:JSON.parse(sessionStorage.getItem("subjects_att_app")),
        inp_master:"",
        inp_sub_pin:"",
        inp_sub_name:""
      }
    },
    template: `<h2>Hi Teacher, <br><br>Add A Subject</h2>
  <div id="Subject_option">
    <input type="password" id="tpin" v-model="inp_master" name="mpin" placeholder="Master pin" required><br><br>
    <input type="number" id="tpin" v-model="inp_sub_pin" name="tpin" placeholder="Set Pin" required><br><br>
    <input type="text" id="tpin" v-model="inp_sub_name" name="sub_name" placeholder="Set Subject name" required><br><br>
    <button id="button_grey" @click="add_sub_submit">ADD</button><br><br><br><br>
    <div id="router_div">
    <router-link  to=/>Back-Home</router-link>
    </div>
  </div>
  `,
  methods:{
    add_sub_submit: async function add_sub(){
      var currentUrl = window.location.href;
      var splitUrl = currentUrl.toString().split("#");
      var subj_url = splitUrl[1].toString().split("/");
      api_url=splitUrl[0]+"/api/subject/"
      var send_data = { "master_p":this.inp_master,"pin":this.inp_sub_pin,"subject_name":this.inp_sub_name}; //random data change later
      
      var response=await fetch(api_url,{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body: JSON.stringify(send_data),
      });

      if (response.status==200){
        Swal.fire({
          icon: 'error',
          title: 'Subject Already Exist',
          text: 'Try Choosing different name :)',
          })
      }
      if (response.status==201){
        Swal.fire({
          icon: 'success',
          title: 'Subject Added',
          text: 'Go to Home and refresh to See the changes',
          })
          roll_number=localStorage.getItem("roll_no_att_app")
          var currentUrl = window.location.href;
          var splitUrl = currentUrl.toString().split("#");
          
      
          subject_api_url=splitUrl[0]+"/api/subject"
          // console.log(subject_api_url)
          fetch(subject_api_url,{headers:{
            'Content-Type':'application/json',
          }}).then(response => response.json())
          .then(d => sessionStorage.setItem("subjects_att_app",JSON.stringify(d.subjects)));
          this.subjects=JSON.parse(sessionStorage.getItem("subjects_att_app"))
      }
      if (response.status==203){
        Swal.fire({
          icon: 'warning',
          title: 'Wrong Pin',
          text: 'Check Whether Pin is Correct or Not ',
          })
      }
      if (response.status==202){
        Swal.fire({
          icon: 'warning',
          title: 'Missing Values',
          text: 'Check for missing values',
          })
      }
      if (response.status==400){
        Swal.fire({
          icon: 'warning',
          title: 'Something Broken',
          text: 'Kindly report!',
          })
      }
    }
  }
    
   }
  
  
    
  
   const addstu = { 
    data: function(){
      return {
        subjects:JSON.parse(sessionStorage.getItem("subjects_att_app")),
        inp_master:"",
        inp_roll_no:"",
        inp_stu_name:""
      }
    },
    template: `<h2>Hi Teacher, <br><br>Add A Subject</h2>
  <div id="Subject_option">
    <input type="password" id="tpin" v-model="inp_master" name="mpin" placeholder="Master pin" required><br><br>
    <input type="number" id="tpin" v-model="inp_roll_no" name="roll_no" placeholder="Roll Number" required><br><br>
    <input type="text" id="tpin" v-model="inp_stu_name" name="stu_name" placeholder="Name" required><br><br>
    <button id="button_grey" @click="add_sub_submit">ADD</button><br><br><br><br>
    <div id="router_div">
    <router-link  to=/>Go Back</router-link>
    </div>
  </div>
  `,
  methods:{
    add_sub_submit: async function add_sub(){
      var currentUrl = window.location.href;
      var splitUrl = currentUrl.toString().split("#");
      var subj_url = splitUrl[1].toString().split("/");
      api_url=splitUrl[0]+"/api/enrolling/"
      var send_data = { "master_p":this.inp_master,"roll_number":this.inp_roll_no,"name":this.inp_stu_name}; //random data change later
      
      var response=await fetch(api_url,{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body: JSON.stringify(send_data),
      });

      if (response.status==200){
        Swal.fire({
          icon: 'error',
          title: 'Student Already Exist',
          text: 'Try with different roll number :)',
          })
      }
      if (response.status==201){
        Swal.fire({
          icon: 'success',
          title: 'Student Added',
          text: 'Student has been added successfully)',
          })
      }
      if (response.status==203){
        Swal.fire({
          icon: 'warning',
          title: 'Missing value/ Wrong Pin',
          text: 'Check for missing values or edit pin',
          })
      }
      if (response.status==400){
        Swal.fire({
          icon: 'warning',
          title: 'Something Broken',
          text: 'Kindly report!',
          })
      }
    }
  }
    
   }
  
  const routes = [
    { path: '/', component: Home },
    { path: '/subject/:subject_name', component: specific_subject ,name: 'subjects',
    props: true },
    { path: '/add_a_subject', component: addsub },
    {path:'/add_a_student', component:addstu}
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
    mounted() {
      roll_number=localStorage.getItem("roll_no_att_app")
      var currentUrl = window.location.href;
      var splitUrl = currentUrl.toString().split("#");
      
  
      subject_api_url=splitUrl[0]+"/api/subject"

      fetch(subject_api_url,{headers:{
        'Content-Type':'application/json',
      }}).then(response => response.json())
      .then(d => sessionStorage.setItem("subjects_att_app",JSON.stringify(d.subjects)));
      this.subjects=JSON.parse(sessionStorage.getItem("subjects_att_app"))
      
  
    }
  
  })
  
  
  app.use(router)
  app.mount('#app')

from importlib import resources
from flask import Flask, render_template,request, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Resource, Api, reqparse
import datetime
import random
from sqlalchemy import false, true
from fpdf import FPDF

### App Configration
app = Flask(__name__)
api= Api(app) 


### PDF CONFIG



### Database configration
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///testdb.sqlite3" 
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)




class Att_record (db.Model):
  s_no=db. Column(db.Integer, primary_key = True, autoincrement = True)
  date = db.Column(db.String, nullable = False)
  roll_no= db.Column(db.String, nullable = False)
  subject=db.Column(db.String, nullable = False)

class student_info (db.Model):
  s_no=db. Column(db.Integer, primary_key = True, autoincrement = True)
  roll_no= db.Column(db.String, nullable = False, unique=True)
  name=db.Column(db.String, nullable = False)
  
  


class teacher_pin (db.Model):
  subject_name=db.Column(db.String, primary_key = True)
  teacher_pin = db.Column(db.String, nullable = False)
  att_pin=db.Column(db.String, nullable = False)
  

db.create_all()



########################
#####  Master PIN  #####
master_pin="1234"
########################

print(master_pin)

@app.route("/")
def student_home_page():
    return render_template("index.html")

@app.route("/teacher")
def teacher_home_page():
    return render_template("teacher.html")

@app.route("/report_a_problem")
def report_a_problem():
    return render_template("report_a_problem.html")

@app.route("/get_attendance",methods=["GET","POST"])
def download_att():
    if request.method=="GET":
        data_list=[]
        sub_list=[]
        date_data_query=Att_record.query.all()
        for i in date_data_query:
            data_list.append(i.date)
            sub_list.append(i.subject)
        data_set=set(data_list)
        sub_set=set(sub_list)
        data_date_list=list(data_set)
        sub_data_list=list(sub_set)
        return render_template("download_attendance.html",date_data_list=data_date_list,sub_data_list=sub_data_list)
    elif request.method=="POST":
        req_subject=request.form['subj']
        req_date=request.form['date']
        att_data_query=Att_record.query.all()
        title_text="Attendance For " + req_subject
        date_split=req_date.split("-")
        print(date_split)
        date_text=date_split[2]+"/"+date_split[1]+"/"+date_split[0] 
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=14)
        pdf.cell(200, 10, txt=title_text, ln=1, align="L")
        pdf.cell(100, 10, txt=date_text, ln=2, align="L")
        req_list=[]
        for i in att_data_query:
            print(i.subject)
            if i.date==req_date and i.subject==req_subject:
                req_list.append(i.roll_no)
            else:
                render_template("report_a_problem.html")
        
        req_Set=set(req_list)
        final_list=list(req_Set)
        print(att_data_query)
        print(final_list)
        count=0
        for j in final_list:
            count+=1
            roll_text=str(count)+". "+j
            pdf.cell(100, 10, txt=roll_text, ln=2, align="L")
        pdf.output("new_python.pdf")
        
        return send_file("python.pdf", as_attachment=True)


@app.route("/performance/<string:roll>",methods=["GET","POST"])
def performance(roll):
    data_students=student_info.query.all()
    exisiting=[]
    for i in data_students:
        exisiting.append(i.roll_no)
    if roll not in exisiting:
        return render_template("student_performance.html")
    else :
        return_json=[]
        data_subjects=teacher_pin.query.all()
        for j in data_subjects:
            att_count=0
            data_att_record=Att_record.query.all()
            for k in data_att_record:
                if (k.roll_no==roll) and (k.subject==j.subject_name) :
                    att_count+=1
            x=j.subject_name
            y=(att_count/90)*100
            
            format_float = "{:.2f}".format(y)
            l=[x,format_float]
            return_json.append(l)
        print(return_json)

        return render_template("student_performance.html",roll_n=roll,data_list=return_json)


 

##### Extra Functions #####
def datecalc():
  x = str(datetime.datetime.now())
  l=x.split(" ")
  return l[0]

def string_pin_gen():
    n = random.randint(1000,9999)
    x=str(n)
    return x

#################
##### API's #####

###parsers
add_student=reqparse.RequestParser()
add_student.add_argument('roll_number')
add_student.add_argument('name')
add_student.add_argument('master_p')


add_subject=reqparse.RequestParser()
add_subject.add_argument('subject_name')
add_subject.add_argument('pin')
add_subject.add_argument('master_p')


register_att=reqparse.RequestParser()
register_att.add_argument('roll_number')
register_att.add_argument('att_pin')

pin_manipulator=reqparse.RequestParser()
pin_manipulator.add_argument('t_pin')


performance_report_args=reqparse.RequestParser()
performance_report_args.add_argument('roll_number')

downloader=reqparse.RequestParser()
downloader.add_argument('t_pin')
downloader.add_argument('date_req')


## Classes defination For API's
class get_name(Resource):
  def get(self,roll_number):
    data=student_info.query.filter_by(roll_no=roll_number).first()
    if data is not None:
        return {"Message":data.name,"status":"true"}, 200
    return {"Message":"Roll_number Not Found","status":"false"}, 200


class adding_student(Resource):
    def post(self):
        args=add_student.parse_args()
        data=student_info.query.all()
        exisiting=[]
        for i in data:
            exisiting.append(i.roll_no)
        
        
        if args["master_p"]==master_pin:
            if args["roll_number"] in exisiting:
                return {"Message":"Already existing"}, 200
            a = student_info(roll_no=args["roll_number"],name=args["name"])
            db.session.add(a)
            db.session.commit()
            return{"message":"Added_successfully","status":"true"}, 201
        elif args["name"]=="" or args["roll_number"]=="" or args["master_p"]!=master_pin:
            return{"message":"Missing value/ Wrong Pin","status":"false"}, 203
        else :
            return{"message":"Somethings Broken","status":"false"}, 400

class subjects(Resource):
    def get(self):
        data=teacher_pin.query.all()
        exisiting=[]
        for i in data:
            exisiting.append(i.subject_name.lower())
        return {"message":"Sucess","subjects":exisiting},200

    def post(self):

        args=add_subject.parse_args()
        data=teacher_pin.query.all()
        exisiting=[]
        
        for i in data:
            exisiting.append(i.subject_name.lower())
        
        
        if args["master_p"]==master_pin:
            if args["subject_name"].lower() in exisiting:
                return {"Message":"Already existing"}, 200
            if args["subject_name"].lower() == "" or args["pin"]=="":
                return{"message":"Missing value","status":"false"}, 202

            a = teacher_pin(subject_name=args["subject_name"].lower(),teacher_pin=args["pin"],att_pin="0000")
            db.session.add(a)
            db.session.commit()
            return{"message":"Added_successfully","status":"true"}, 201
        elif args["subject_name"]==None or args["pin"]==None or args["master_p"]!=master_pin:
            return{"message":"Missing value/ Wrong Pin","status":"false"}, 203
        else :
            return{"message":"Somethings Broken","status":"false"}, 400       



class attendance_register(Resource):
    def post(self,name_of_subject):
        
        subject_data=teacher_pin.query.all()
        exisiting_subject=[]
        pin_for_subject={}
        for i in subject_data:
            exisiting_subject.append(i.subject_name)
            pin_for_subject[i.subject_name]=i.att_pin
        
        if name_of_subject not in exisiting_subject:
            
            return {"Message":"Subject Not Found","status":"false"},404
        
        args=register_att.parse_args()
        
        data=student_info.query.all()
        exisiting=[]
        

        
        for i in data:
            
            exisiting.append(i.roll_no)
        if args["roll_number"] in exisiting:
            if args["att_pin"]==pin_for_subject[name_of_subject]:
                
                data_attendance=Att_record.query.filter_by(roll_no=args["roll_number"])
                for i in data_attendance:
                    if (i.subject==name_of_subject) and (i.date==datecalc()):
                        
                        return {"Message":"Attendance Already Registered","status":"false"},201


                print(datecalc())
                a = Att_record(subject=name_of_subject,roll_no=args["roll_number"],date=datecalc())
                db.session.add(a)
                db.session.commit()
                return {"Message":"Attendance Registered","status":"true"},200
            else:
                return {"Message":"Wrong Pin","status":"false"}, 401

        else:
            return {"Message":"Problem with Roll Number","status":"false"},404

        
class att_pin_change(Resource):

    def post(self,subject):
        args=pin_manipulator.parse_args()
        subject_data=teacher_pin.query.all()
        pin_for_subject={}
        for i in subject_data:
            pin_for_subject[i.subject_name.lower()]=i.teacher_pin

        print(pin_for_subject[subject])
        print(args["t_pin"])

        if pin_for_subject[subject.lower()]==args["t_pin"]:
            a =teacher_pin.query.filter_by(subject_name=subject.lower()).first()
            x=string_pin_gen()
            a.att_pin=x
            db.session.commit()
            return {"body":x},200
        else:
            return {"body":"Wrong Pin"},200

    def put(self,subject):
        args=pin_manipulator.parse_args()
        subject_data=teacher_pin.query.all()
        pin_for_subject={}
        for i in subject_data:
            pin_for_subject[i.subject_name]=i.teacher_pin


        if pin_for_subject[subject]==args["t_pin"]:
            a =teacher_pin.query.filter_by(subject_name=subject).first()
            x=string_pin_gen()
            a.att_pin=x
            db.session.commit()
            return {"Message":"Pin changed Successfully","Status":"true"},200
        else:
            return {"Message":"Wrong Pin","Status":"False"},200
        

class performance_generator(Resource):
    def post(self):
        args=performance_report_args.parse_args()
        roll=args["roll_number"]
        data_students=student_info.query.all()
        exisiting=[]
        for i in data_students:
            exisiting.append(i.roll_no)
        if roll not in exisiting:
            return {"Message": "Record does not exist. Kindly Check your roll number","status":"false"}, 404
        else :
            return_json={"Message":"report generated"}
            data_subjects=teacher_pin.query.all()
            for j in data_subjects:
                att_count=0
                data_att_record=Att_record.query.all()
                for k in data_att_record:
                    if (k.roll_no==roll) and (k.subject==j.subject_name) :
                        att_count+=1
                return_json[j.subject_name]=(att_count/90)*100
            return return_json

class attendance_downloader(Resource):
    def get(self,subject):
        args=downloader.parse_args()
        t_pin=args["t_pin"]
        date_req=args["date_req"]
        if t_pin==None or date_req==None:
            return {"Message": "Enter valid pin/Date","Status":"false"},401
        else:
            subject_data=teacher_pin.query.all()
            roll_data={}
            data_table_roll=student_info.query.all()
            for k in data_table_roll:
                roll_data[k.roll_no]=k.name
            pin_for_subject={}
            for i in subject_data:
                pin_for_subject[i.subject_name]=i.teacher_pin
            

            if pin_for_subject[subject]==t_pin:
                data_attendace=Att_record.query.all()
                data_list=list([("S.No.", "Roll_number","Name")])
                sno=0
                for j in data_attendace:
                    if j.date==date_req and j.subject==subject:
                        sno+=1
                        # print(roll_data[j.roll_no])
                        #data_list+=str(sno),j.roll_no,roll_data[j.roll_no]
                        data_list.append(tuple([str(sno),j.roll_no,roll_data[j.roll_no]]))
                # for row in data_list:
                #     for datum in row:
                #         pdf.multi_cell(col_width, line_height, datum, border=1,
                #                 new_x="RIGHT", new_y="TOP", max_line_height=pdf.font_size)
                #     pdf.ln(line_height)
                # name_of_file=subject+".pdf"
                #pdf.output(name_of_file)
                output_string=""
                for i in data_list:
                    output_string+=str(i)[1:]+"\n"
                print(output_string)
                return {"Message":"hi"}


api.add_resource(get_name, "/api/getname/<roll_number>")
api.add_resource(adding_student, "/teacher/api/enrolling/")
api.add_resource(subjects, "/api/subject","/teacher/api/subject/")
api.add_resource(attendance_register, "/api/subject/<name_of_subject>")
api.add_resource(att_pin_change, "/teacher/api/subject/<subject>")
api.add_resource(performance_generator, "/api/performance_generator/")
api.add_resource(attendance_downloader, "/api/attendance_downloader/<subject>")


# if __name__ == '__main__':
#     app.run()

let AddSecurities = require("./model/securities-model");
let AddStudents = require("./model/students_model");
let AddFeeTypes = require("./model/fee_details-model");
let AddSubFeeTypes = require("./model/sub_fee_details-model");
let AddExpenses = require("./model/expenses-model");
let AddRoles = require("./model/role-model");
let AddOldStudents = require("./model/old_student-model");
let AddBranchFees = require("./model/branchfee_details-model");
let AddBranches = require("./model/branch_details-model");
let AddCalendarYear = require("./model/calendar_years-model");
let AddAcademicYear = require("./model/academic_years-model");
let AddAllocateStudenBranch = require("./model/allocate_student_branch-model");
let AddTransactions = require("./model/transactions-model");
let subFeeDetails = require("./model/sub_fee_details-model");
let BranchDetailsModel = require("./model/branch_details-model");

const { addManualBillFunction } = require("./addManualTransaction");

const express = require("express");
const mysql = require("mysql");
const mongoose = require("mongoose");
const { format } = require("date-fns");
const { enIN } = require("date-fns/locale/en-IN");
const moment = require("moment");
const relieveModel = require("./model/relieved_amounts");
const subfeeDetailsModel = require("./model/sub_fee_details-model");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || "3002";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  // database: "aglvzm_instafee",
  database: "agl0",
});

const mongoURL = "mongodb://127.0.0.1:27017/agl0";

mongoose
  .connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error.message);
  });


  // Replace with current Academic Year values 
  const currentAcadamicYear = (student_id) =>{
    let id = student_id.split("-")[0];
    let academicYear = parseInt("20" + id);
    let currentYear = new Date().getFullYear();
     let difference = currentYear - academicYear;
  //  if (difference >= 4) {
  //    return "6657017ef8b09646c45277d4";
    if (difference >= 3) {
     return "667d49991aa3c80432422ebd";
   } else if (difference === 2) {
     return "667d49961aa3c80432422eb9";
   } else {
     return "667d49921aa3c80432422eb5"; 
   }
  }


    //Replace with current Calender Year values 
  const currentCalendarYear = (student_id) =>{
    let id = student_id.split("-")[0];
    let calenderYear = parseInt("20" + id);
    // let currentYear = new Date().getFullYear();
    //  let difference = currentYear - academicYear;
   if (calenderYear === 2019) {
     return "667d49aa1aa3c80432422ec8";
   } else if (calenderYear === 2020) {
     return "667d49b11aa3c80432422ecc";
   } else if (calenderYear === 2021) {
     return "667d49b91aa3c80432422ed0";
   } else if (calenderYear === 2022) {
     return "667d49bd1aa3c80432422ed4";
   } else if (calenderYear === 2023) {
     return "667d49c41aa3c80432422ed8";
   } else if (calenderYear === 2024) {
     return "667d4a561aa3c80432422edd";
   }
  //  else if (calenderYear === 2025) return "665701d1f8b09646c45277f7";
 
  }

app.get("/migrate_students", (req, res) => {
  const sql = "SELECT * FROM student_info";
  mysqlConnection.query(sql, (err, data) => {
    if (err) {
      console.error("MySQL Query Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    let arr = [];
    // Assuming data is an array of objects
    data.forEach((student) => {
      // Map MySQL fields to MongoDB fields
      const mappedStudent = {
        student_name: student.student_name,
        student_phone_number: student.student_phone_number,
        hall_ticket_number: student.hall_ticket_number,
        admission_number: student.admission_number,
        id: student.id,
        gender: student.gender,
        dob: student.dob,
        caste: student.caste,
        jnanbhumi_number: student.jnanbhumi_number,
        aadhaar_number: student.aadhaar_number,
        ssc: student.ssc,
        second_language: student.second_language,
        normal_created_date_time: student.create_date_time
          .toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, ""),
        created_date_time: student.modify_date_time
          .toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, ""),
        created_by: "667d48e51aa3c80432422e91", //student.created_by,
        updated_by: "667d48e51aa3c80432422e91", //student.modified_by,
        status: student.status,
        org_id: "667d45871aa3c80432422d5f",
        academic_year_id:currentAcadamicYear(student.id),
        calendar_year_id:currentCalendarYear(student.id),
      };
      // arr.push(mappedStudent);
      // Assuming AddStudents.create is an asynchronous function (returns a promise)
      AddStudents.create(mappedStudent).catch((mongoError) => {
        console.error("MongoDB Insert Error:", mongoError);
        res.status(500).json({ error: "Internal Server Error" });
      });
    });

    // res.json(arr);
    res.json({ message: "Students Migrated successfully" });
  });
});
app.get("/migrate_old_students", (req, res) => {
  const sql = "SELECT * FROM old_student_info";
  mysqlConnection.query(sql, (err, data) => {
    if (err) {
      console.error("MySQL Query Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    let arr = [];
    // Assuming data is an array of objects
    data.forEach(async (student) => {
      // Map MySQL fields to MongoDB fields
      const mappedStudent = {
        student_name: student.student_name,
        student_phone_number: student.student_phone_number,
        hall_ticket_number: student.hall_ticket_number,
        admission_number: student.admission_number,
        id: student.id,
        gender: student.gender,
        dob: student.dob,
        caste: student.caste,
        jnanbhumi_number: student.jnanbhumi_number,
        aadhaar_number: student.aadhaar_number,
        ssc: student.ssc,
        second_language: student.second_language,
        normal_created_date_time: student.create_date_time
          .toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, ""),
        created_date_time: student.modify_date_time
          ?.toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, ""),
        created_by: "667d48e51aa3c80432422e91", //student.created_by,
        updated_by: "667d48e51aa3c80432422e91", //student.modified_by,
        status: student.status,
        org_id: "667d45871aa3c80432422d5f",
        academic_year_id: currentAcadamicYear(student.id),
        calendar_year_id: currentCalendarYear(student.id),
      };


      
      // arr.push(mappedStudent);
      // Assuming AddStudents.create is an asynchronous function (returns a promise)

      let idTOGiveInOldStudentData
      let studentAlreadyExist = await AddStudents.find({ id: student.id });
      if(studentAlreadyExist.length > 0){
       
        idTOGiveInOldStudentData = studentAlreadyExist[0]._id;
      }
      else{
        let results = await AddStudents.create(mappedStudent);
        idTOGiveInOldStudentData = results._id
      }

      // console.log("idTOGiveInOldStudentData-->",idTOGiveInOldStudentData);


      const oldStudentdata = {
        student_id: idTOGiveInOldStudentData,
        old_due_amount: student.original_due,
        status: student.status === "0" ? "0" :"1",
        org_id: "667d45871aa3c80432422d5f",
        created_date_time: student.modify_date_time
          ?.toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, ""),
        created_by: "667d48e51aa3c80432422e91",
        updated_by: "667d48e51aa3c80432422e91",
      };

      let studentAlreadyHaveOldDue = await AddOldStudents.find({
        student_id: idTOGiveInOldStudentData,
      });

      // console.log("studentAlreadyHaveOldDue-- > ",studentAlreadyHaveOldDue);
      // console.log(
      //   "studentAlreadyHaveOldDue[0]._id-- > ",
      //   studentAlreadyHaveOldDue[0]._id
      // );


      try{
        if (studentAlreadyHaveOldDue.length > 0) {
          const oldDueAmount = parseInt(oldStudentdata.old_due_amount);
          // console.log("oldDueAmount -->", oldDueAmount, typeof(oldDueAmount))

          const newDueAmount = oldDueAmount + parseInt(studentAlreadyHaveOldDue[0].old_due_amount);
         await AddOldStudents.updateOne(
           { _id: studentAlreadyHaveOldDue[0]._id },
           { $set: { old_due_amount: newDueAmount } }
         );
        } else {
          await AddOldStudents.create(oldStudentdata).catch((mongoError) => {
            console.error("MongoDB Insert Error:", mongoError);
            res.status(500).json({ error: "Internal Server Error" });
          });
        }
      }
      catch(err){
        console.log(err)
      }

      

   


    });

    // res.json(arr);
    res.json({ message: "Old Students Migrated successfully" });
  });
});



// app.get("/migrate_old_students", (req, res) => {
//   const sql = "SELECT * FROM old_student_info";
//   mysqlConnection.query(sql, (err, data) => {
//     if (err) {
//       console.error("MySQL Query Error:", err);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }

//     let arr = [];
//     // Assuming data is an array of objects
//     data.forEach((student) => {
//       // Map MySQL fields to MongoDB fields
//       const mappedStudent = {
//         student_name: student.student_name,
//         student_phone_number: student.student_phone_number,
//         hall_ticket_number: student.hall_ticket_number,
//         admission_number: student.admission_number,
//         id: student.id,
//         gender: student.gender,
//         dob: student.dob,
//         caste: student.caste,
//         jnanbhumi_number: student.jnanbhumi_number,
//         aadhaar_number: student.aadhaar_number,
//         ssc: student.ssc,
//         second_language: student.second_language,
//         normal_created_date_time: student.create_date_time
//           .toISOString()
//           .replace(/T/, " ")
//           .replace(/\..+/, ""),
//         created_date_time: student.modify_date_time
//           .toISOString()
//           .replace(/T/, " ")
//           .replace(/\..+/, ""),
//         created_by: "667d48e51aa3c80432422e91", //student.created_by,
//         updated_by: "667d48e51aa3c80432422e91", //student.modified_by,
//         status: student.status,
//         org_id: "667d45871aa3c80432422d5f",
//         academic_year_id: currentAcadamicYear(student.id),
//         calendar_year_id: currentCalendarYear(student.id),
//       };

//       // arr.push(mappedStudent);
//       // Assuming AddStudents.create is an asynchronous function (returns a promise)
//       AddStudents.create(mappedStudent).catch((mongoError) => {
//         console.error("MongoDB Insert Error:", mongoError);
//         res.status(500).json({ error: "Internal Server Error" });
//       });
//     });

//     // res.json(arr);
//     res.json({ message: "Students Migrated successfully" });
//   });
// });

app.get("/migrate_fee_types", (req, res) => {
  const sql = 'SELECT * FROM fee_details WHERE status="1"';
  mysqlConnection.query(sql, (err, data) => {
    if (err) {
      console.error("MySQL Query Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    let arr = [];
    // Assuming data is an array of objects
    let i = 1;
    data.forEach((feeTypes) => {
      // Map MySQL fields to MongoDB fields
      var datetime = feeTypes.create_date_time
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      const mappedFeeTypes = {
        fee_type: feeTypes.fee_type,
        access_status: feeTypes.access_status,
        fee_order: i, //feeTypes.fee_order,
        created_date_time: datetime,
        created_by: "667d48e51aa3c80432422e91", //feeTypes.created_by,
        // updated_by: '667d48e51aa3c80432422e91', //feeTypes.modified_by,
        status: feeTypes.status,
        org_id: "667d45871aa3c80432422d5f",
        other_fee_id: feeTypes.fee_type ===  "Old dues" ? "1" : "0",
      };

      // AddFeeTypes.create(mappedFeeTypes).catch((mongoError) => {
      //     console.error('MongoDB Insert Error:', mongoError);
      //     res.status(500).json({ error: 'Internal Server Error' });
      // });
      // const feeidvalue = AddFeeTypes._id;
      // createsubfee = async (feeTypes.fee_type, feeidvalue, 1, '667d45871aa3c80432422d5f', i, '667d48e51aa3c80432422e91', datetime);
      // i++;
      AddFeeTypes.create(mappedFeeTypes)
        .then(async (createdFeeType) => {
          const feeidvalue = createdFeeType._id;
          // console.log(feeidvalue);
          await createsubfee(
            feeTypes.fee_type,
            feeidvalue,
            1,
            "667d45871aa3c80432422d5f",
            1,
            "667d48e51aa3c80432422e91",
            datetime
          );
        })
        .catch((mongoError) => {
          console.error("MongoDB Insert Error:", mongoError);
          res.status(500).json({ error: "Internal Server Error" });
        });
      i++;
    });

    // res.json(arr);
    res.json({ message: "Fee Type Migrated successfully" });
  });
});

const createsubfee = async (
  subfeename,
  fee_type_id,
  access_status,
  org_id,
  fee_order,
  created_by,
  dateTime
) => {
  // console.log(subfeename);
  await AddSubFeeTypes.create({
    fee_type_id: fee_type_id,
    access_status: access_status,
    status: "1",
    org_id: org_id,
    fee_order: fee_order,
    created_by: created_by,
    created_date_time: dateTime,
    sub_fee_type: subfeename,
  });
};

app.get("/migrate_relievedAmounts", async (req, res) => {
  try {
    const sql =
      "SELECT *, SUBSTRING_INDEX(SUBSTRING_INDEX(student_id, '-', 2), '-', -1) AS branch_name FROM relieved_amounts ORDER BY student_id ASC";
    mysqlConnection.query(sql, async (mysqlErr, mysqlData) => {
      if (mysqlErr) {
        console.error("MySQL Query Error:", mysqlErr);
        return res.status(500).json({ error: "Internal Server Error" });
      }


     const sqlBranch =
       "SELECT DISTINCT SUBSTRING_INDEX(SUBSTRING_INDEX(student_id, '-', 2), '-', -1) AS branch FROM relieved_amounts";

     const getBranchNames = () => {
       return new Promise((resolve, reject) => {
         mysqlConnection.query(sqlBranch, (mysqlErr, branchNameData) => {
           if (mysqlErr) {
             console.error("MySQL Query Error:", mysqlErr);
             return reject("Internal Server Error");
           }
        
           const branchNames = branchNameData.map((branch) => branch.branch);
           resolve(branchNames);
         });
       });
     };

        let branch_names = await getBranchNames();
       const studentIds = mysqlData.map((students) =>
         students.student_id.replace(/\s+/g, "")
       );


          const studentIdsMap = {};

          const branchIdsMap = {};

           const branchesData = await AddBranches.find({
             branch_name: { $in: branch_names },
           });
           branchesData.forEach((branches) => {
            let objectID = branches._id;
             branchIdsMap[branches.branch_name] = objectID.toString();
           });


         


      const studentsData = await AddStudents.find({ id: { $in: studentIds } });
      studentsData.forEach((students) => {
        let objectID = students._id;
        studentIdsMap[students.id] = objectID.toString();
      });



      // let termFeeID = "66854720f417e90d6eaf4560"; /// Sub fee id of TERM
      // let statFeeID = "66854720f417e90d6eaf4592";  /// Sub fee id of Stat

      let termFee = await subfeeDetailsModel.find(
        { sub_fee_type: "TERM", org_id: "667d45871aa3c80432422d5f" },
        { _id: 1 }
      );
      let statFee = await subfeeDetailsModel.find(
        { sub_fee_type: "STAT", org_id: "667d45871aa3c80432422d5f" },
        { _id: 1 }
      );

      let termFeeID = termFee[0]?._id?.toString();
      let statFeeID = statFee[0]?._id?.toString();

   
     
     
      const enrichedData = mysqlData.map((data) => ({
        ...data,
        student_id: studentIdsMap[data.student_id],
        branch_id : branchIdsMap[data.branch_name]
      }));

    

       for (let i = 0; i < 2; i++) {
      enrichedData.forEach((data) => {
        // Map MySQL fields to MongoDB fields
        const mappedExpenses = {
          student_id: data.student_id,
          status: data.status,
          fee_id: i === 0 ? termFeeID : statFeeID,
          amount: i === 0 ? data.term_amount : data.stat_amount,
          fee_name: i === 0 ? "TERM" : "STAT",
          date_relieved: data.date_relieved,
          created_date_time: data.create_date_time
            .toISOString()
            .replace(/T/, " ")
            .replace(/\..+/, ""),
          updated_date_time: data.modified_date_time
            .toISOString()
            .replace(/T/, " ")
            .replace(/\..+/, ""),
          org_id: "667d45871aa3c80432422d5f",
          branch_id: data.branch_id,
          branch_name: data.branch_name,
        };

        // console.log("enrichedData obtained is ", mappedExpenses);

    
        if (data.status) {
          relieveModel.create(mappedExpenses).catch((mongoError) => {
            
            console.error("MongoDB Insert Error:", mongoError, mappedExpenses);
            res.status(500).json({ error: "Internal Server Error" });
          });
        }
      });
    }

      // res.json(arr);
      res.json({ message: "Relieved amounts migrated successfully" });
    });
  } catch (error) {
    console.error("Error in migration route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/migrate_expenses", async (req, res) => {
  try {
    const sql = "SELECT * FROM expenses ORDER BY expenses_id ASC";
    mysqlConnection.query(sql, async (mysqlErr, mysqlData) => {
      if (mysqlErr) {
        console.error("MySQL Query Error:", mysqlErr);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Extract security IDs from MySQL data
      const securityIds = mysqlData.map((expense) => expense.created_by);

      // Fetch security data from MongoDB based on security IDs
      const securityData = await AddSecurities.find({
        security_id: { $in: securityIds },
      });

      // Create a mapping of security ID to security name
      const securityNameMap = {};
      securityData.forEach((security) => {
        securityNameMap[security.security_id.toString()] = security._id; // Assuming admin_name is the field you want
      });

      securityNameMap["0"] = "667d48e51aa3c80432422e91"; // no users with security id 0 so linking to admin in mongo only

      securityNameMap["1"] = "667d48e51aa3c80432422e91"; // Admin _id created by superAdmin for a org

      // Enrich MySQL data with security names
      // console.log("mysqlData.create_by is ", mysqlData);
      const enrichedData = mysqlData.map((expense) => ({
        ...expense,
        created_by_id: securityNameMap[expense.created_by],
      }));

      // res.json(enrichedData);
      // return;

      let arr = [];
      // Assuming data is an array of objects
      let i = 1;
      enrichedData.forEach((expanses) => {
        // Map MySQL fields to MongoDB fields
        const mappedExpenses = {
          amount: expanses.amount,
          expenses_to: expanses.expenses_to,
          expense_type: expanses.expense_type,
          reason: expanses.reason,
          accept_url: expanses.accept_url,
          reject_url: expanses.reject_url,
          wait_url: expanses.wait_url,
          status: expanses.status,
          type: expanses.type,
          date: expanses.create_date_time
            .toISOString()
            .replace(/T/, " ")
            .replace(/\..+/, "")
            .split(" ")[0],
          mail_status: expanses.mail_status,
          created_date_time: expanses.create_date_time
            .toISOString()
            .replace(/T/, " ")
            .replace(/\..+/, ""),
          created_by: expanses.created_by_id,
          // created_by: "667d48e51aa3c80432422e91",
          // created_by : "662c78b8c8eb60ac3d9080fc",
          // updated_by: expanses.modified_by_id,
          // status: expanses.status,
          org_id: "667d45871aa3c80432422d5f",
        };

        // console.log("enrichedData obtained is ",enrichedData);

        // arr.push(mappedExpenses);
        // Assuming AddStudents.create is an asynchronous function (returns a promise)
        if (expanses.status) {
          AddExpenses.create(mappedExpenses).catch((mongoError) => {
            console.error("MongoDB Insert Error:", mongoError);
            res.status(500).json({ error: "Internal Server Error" });
          });
        }
      });

      // res.json(arr);
      res.json({ message: "Expenses Migrated successfully" });
    });
  } catch (error) {
    console.error("Error in migration route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/migrate_users", async (req, res) => {
  const sql =
    'SELECT * FROM security WHERE security_id>"1" ORDER By security_id ASC';
  mysqlConnection.query(sql, async (err, data) => {
    if (err) {
      console.error("MySQL Query Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Extract security IDs from MySQL data
    const roleIds = data.map((security) => security.role_id);

    // Fetch security data from MongoDB based on security IDs
    const rolesData = await AddRoles.find({ role_id: { $in: roleIds } });

    // Create a mapping of security ID to security name
    const rolesNameMap = {};
    rolesData.forEach((role) => {
      rolesNameMap[role.role_id.toString()] = role._id; // Assuming admin_name is the field you want
    });

    // Enrich MySQL data with security names
    const enrichedData = data
      .map((security) => ({
        ...security,
        role_id_mongo: rolesNameMap[security.role_id],
      }))
      .sort((a, b) => a.security_id - b.security_id);

    // res.json(enrichedData);
    // return;

    let arr = [];
    // Assuming data is an array of objects
    enrichedData.forEach((users) => {
      // Map MySQL fields to MongoDB fields
      const mappedUsers = {
        security_id: users.security_id,
        admin_name: users.admin_name,
        admin_email: users.admin_email,
        admin_mobile: users.admin_mobile,
        address: "AGL COLLEGE", //users.address,
        admin_password:
          "$2a$12$aSg6QgiwPIRdiT4xbq4YFOGXF2kyvOHp47D4Xl/035Nth9zeV4ZIa", //users.admin_password,
        status: users.status,
        role_id: users.role_id_mongo,
        security_type: users.security_type,
        access_status: users.access_status,
        created_date_time: users.create_date_time
          .toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, ""),
        created_by: "667d48e51aa3c80432422e91", //users.created_by,
        org_id: "667d45871aa3c80432422d5f",
      };

      // arr.push(mappedUsers);
      // Assuming AddStudents.create is an asynchronous function (returns a promise)
      AddSecurities.create(mappedUsers).catch((mongoError) => {
        console.error("MongoDB Insert Error:", mongoError);
        res.status(500).json({ error: "Internal Server Error" });
      });
    });

    // res.json(arr);
    res.json({ message: "Users Migrated successfully" });
  });
});

app.get("/migrate_roles", (req, res) => {
  const sql = "SELECT * FROM roles ORDER BY role_id ASC";
  mysqlConnection.query(sql, (err, data) => {
    if (err) {
      console.error("MySQL Query Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    let arr = [];
    // Assuming data is an array of objects
    let i = 1;
    data.forEach((roles) => {
      // Map MySQL fields to MongoDB fields
      const mappedroles = {
        role_id: roles.role_id,
        role_name: roles.role_name,
        created_date_time: roles.create_date_time
          .toISOString()
          .replace(/T/, " ")
          .replace(/\..+/, ""),
        created_by: "667d48e51aa3c80432422e91", //roles.created_by,
        status: roles.status,
        org_id: "667d45871aa3c80432422d5f",
      };

      // arr.push(mappedFeeTypes);
      // Assuming AddStudents.create is an asynchronous function (returns a promise)
      AddRoles.create(mappedroles).catch((mongoError) => {
        console.error("MongoDB Insert Error:", mongoError);
        res.status(500).json({ error: "Internal Server Error" });
      });
    });

    // res.json(arr);
    res.json({ message: "Roles Migrated successfully" });
  });
});

app.get("/migrate_branches", (req, res) => {
  const sql = "SELECT DISTINCT(branch_name) FROM branch_fees";

  const currentDate = new Date();
  const formattedDate = format(currentDate, "yyyy-MM-dd HH:mm:ss");
  mysqlConnection.query(sql, (err, data) => {
    if (err) {
      console.error("MySQL Query Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    let arr = [];
    // Assuming data is an array of objects
    let i = 1;
    data.forEach((branches) => {
      // Map MySQL fields to MongoDB fields
      const mappedBranches = {
        branch_name: branches.branch_name,
        academic_years_value: 3,
        created_date_time: formattedDate,
        create_by: "667d48e51aa3c80432422e91", //branches.created_by,
        status: 1,
        org_id: "667d45871aa3c80432422d5f",
      };

      // arr.push(mappedBranches);
      // Assuming AddStudents.create is an asynchronous function (returns a promise)
      AddBranches.create(mappedBranches)
        // .then(async (createdBranchFee) => {
        //     const branchidvalue = createdBranchFee._id;
        //     await createBranchFees(
        //         branche_id,
        //         sub_fee_id,
        //         amount,
        //         '667d45871aa3c80432422d5f',
        //         calendar_years_id,
        //         academic_years_id,
        //         '667d48e51aa3c80432422e91',
        //         datetime
        //     );
        // })
        .catch((mongoError) => {
          console.error("MongoDB Insert Error:", mongoError);
          res.status(500).json({ error: "Internal Server Error" });
        });
    });

    // res.json(arr);
    res.json({ message: "Branches Migrated successfully" });
  });
});

app.get("/migrate_branchFees", async (req, res) => {
  const sql =
    "SELECT bd.amount, bd.branch_name, fd.fee_type, bd.year  FROM branch_fees bd, fee_details fd WHERE bd.fee_id=fd.fee_id";

  const currentDate = new Date();
  const formattedDate = format(currentDate, "yyyy-MM-dd HH:mm:ss");
  mysqlConnection.query(sql, async (err, data) => {
    if (err) {
      console.error("MySQL Query Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const branchNames = data.map((branches) => branches.branch_name);
    const Years = data.map((branches) => branches.year);
    const calendarYears = Years.map((el) => "20" + el);
    const FeeTypes = data.map((branches) => branches.fee_type);

    const branchNameMap = {};
    const calendarYearMap = {};
    const subFeeMap = {};

    const branchesData = await AddBranches.find({
      branch_name: { $in: branchNames },
    });
    branchesData.forEach((branches) => {
      branchNameMap[branches.branch_name] = branches._id;
    });

    const calendarYearsData = await AddCalendarYear.find({
      calendar_year_value: { $in: calendarYears },
    });
    calendarYearsData.forEach((branches) => {
      calendarYearMap[branches.calendar_year_value.slice(-2)] = branches._id;
    });

    const FeeTypeData = await AddSubFeeTypes.find({
      sub_fee_type: { $in: FeeTypes },
    });
    FeeTypeData.forEach((branches) => {
      subFeeMap[branches.sub_fee_type] = branches._id;
    });

    // Enrich MySQL data with security names
    const enrichedData = data
      .map((branch) => ({
        ...branch,
        branche_id: branchNameMap[branch.branch_name],
        sub_fee_id: subFeeMap[branch.fee_type],
        calendar_years_id: calendarYearMap[branch.year],
      }))
      .sort((a, b) => a.branch_fee_id - b.branch_fee_id);

    // res.json(enrichedData);
    // return;

    let arr = [];
    // Assuming data is an array of objects
      // const currentAcadamicYear = (student_id) => {
      //   let id = student_id.split("-")[0];
      //   let academicYear = parseInt("20" + id);
      //   let currentYear = new Date().getFullYear();
      //   let difference = currentYear - academicYear;
      //   //  if (difference >= 4) {
      //   //    return "6657017ef8b09646c45277d4";
      //   if (difference >= 3) {
      //     return "667d49991aa3c80432422ebd";
      //   } else if (difference === 2) {
      //     return "667d49961aa3c80432422eb9";
      //   } else {
      //     return "667d49921aa3c80432422eb5";
      //   }
      // };

      // Change these acadamic years while migration.
    let academic_years_array = [
      "667d49921aa3c80432422eb5",
      "667d49961aa3c80432422eb9",
      "667d49991aa3c80432422ebd",
    ];

    for (let i = 0; i < academic_years_array.length; i++) {
      enrichedData.forEach((branches) => {
        // Map MySQL fields to MongoDB fields
        const mappedBranches = {
          branch_id: branches.branche_id,
          sub_fee_id: branches.sub_fee_id,
          amount: branches.amount,
          calendar_years_id: branches.calendar_years_id,
          academic_years_id: academic_years_array[i],

          created_date_time: formattedDate,
          created_by: "667d48e51aa3c80432422e91", //branches.created_by,
          status: 1,
          org_id: "667d45871aa3c80432422d5f",
        };

        // arr.push(mappedBranches);
        // Assuming AddStudents.create is an asynchronous function (returns a promise)
        AddBranchFees.create(mappedBranches).catch((mongoError) => {
          console.error("MongoDB Insert Error:", mongoError);
          res.status(500).json({ error: "Internal Server Error" });
        });
      });
    }

    // res.json(arr);
    res.json({ message: "Branch Fees Migrated successfully" });
  });
});

app.get("/migrate_branchStudents", async (req, res) => {
  const sql = "SELECT id,status FROM student_info union SELECT id,status FROM old_student_info order by id desc";
  // const sql = "SELECT id,status from old_student_info order by id desc";

  // const sql = "SELECT id,status from student_info order by id desc"

  const currentDate = new Date();
  const formattedDate = format(currentDate, "yyyy-MM-dd HH:mm:ss");
  mysqlConnection.query(sql, async (err, data) => {
    if (err) {
      console.error("MySQL Query Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const studentIds = data.map((students) => students.id);
    const studentBranches = data.map((students) => {
      studentsArray = students.id.split("-");
      return studentsArray[1];
    });

    const Years = data.map((students) => {
      studentsArray = students.id.split("-");
      return studentsArray[0];
    });

    const studentYears = Years.map((el) => "20" + el);

    const branchNames = [...new Set(studentBranches)];
    const calendarYears = [...new Set(studentYears)];

    // const calendarYears = Years.map(el => '20' + el)

    const studentIdsMap = {};
    const calendarYearMap = {};
    const branchNameMap = {};

    const studentsData = await AddStudents.find({ id: { $in: studentIds } });
    studentsData.forEach((students) => {
      studentIdsMap[students.id] = students._id;
    });

    const branchesData = await AddBranches.find({
      branch_name: { $in: branchNames },
    });
    branchesData.forEach((branches) => {
      branchNameMap[branches.branch_name] = branches._id;
    });

    const calendarYearsData = await AddCalendarYear.find({
      calendar_year_value: { $in: calendarYears },
    });

    calendarYearsData.forEach((CalendarYear) => {
      calendarYearMap[CalendarYear.calendar_year_value.slice(-2)] =
        CalendarYear._id;
    });

    // res.json(calendarYears);
    // return;
    let orginalStudentID = data[0].id;
    // Enrich MySQL data with security names
    const enrichedData = data
      .map((students) => ({
        ...students,
        branch_id: branchNameMap[students.id.split("-")[1]],
        student_id1: studentIdsMap[students.id],

        calendar_years_id:
          calendarYearMap[
            students.id.trim().split("-")[0].endsWith("S")
              ? students.id.trim().split("-")[0].slice(0, -1)
              : students.id.trim().split("-")[0]
          ],
        student_id: students.id,
      }))
      .sort((a, b) => a.branch_fee_id - b.branch_fee_id);


     

    // res.json(enrichedData);
    // return;

    // let arr = [];
    // Assuming data is an array of objects
    let academic_years_array = [
      "662a3ef5862115e621e1ea55",
      // "662a4e2b862115e621e1eef4",
      // "662a4e38862115e621e1eef8",
      // "662a4e43862115e621e1eefc",
    ];

   

    for (let i = 0; i < 1; i++) {
      enrichedData.forEach((branches) => {
        // Map MySQL fields to MongoDB fields
        const mappedBranches = {
          student_id: branches.student_id1,
          branch_id: branches.branch_id,
          amount: branches.amount,
          calendar_years_id: branches.calendar_years_id,
          // academic_years_id: academic_years_array[i],
          // academic_years_id: /.+-.+-/.test(branches.student_id)
          //   ? String(currentAcadamicYear(branches.student_id))
          //   : "662a4e43862115e621e1eefc",
          academic_years_id: String(currentAcadamicYear(branches.student_id)),
          created_date_time: formattedDate,
          created_by: "667d48e51aa3c80432422e91", //branches.created_by,
          status: branches.status, //branches.status,
          org_id: "667d45871aa3c80432422d5f",
        };
     

        // arr.push(mappedBranches);
        // Assuming AddStudents.create is an asynchronous function (returns a promise)
        AddAllocateStudenBranch.create(mappedBranches).catch((mongoError) => {
          console.error("MongoDB Insert Error:", mongoError);
          res.status(500).json({ error: "Internal Server Error" });
        });
      });
    }

    // res.json(arr);
    res.json({ message: "Students allocated to the branches successfully" });
  });
});

app.get("/migrate_transactions", async (req, res) => {
  const sql =
    "SELECT t.*, SUBSTRING_INDEX(SUBSTRING_INDEX(t.student_id, '-', 2), '-', -1) as branch_name, fd.fee_type FROM transactions t JOIN fee_details fd ON t.fee_id = fd.fee_id";
  // "SELECT t.*, bf.branch_name, fd.fee_type FROM transactions t JOIN fee_details fd ON t.fee_id = fd.fee_id LEFT JOIN branch_fees bf ON t.student_id LIKE CONCAT('%-', bf.branch_name, '-%') Limit 8";

 const convertDate = (originalDateString) => {
   var originalDate = new Date(originalDateString);
   var year = originalDate.getFullYear();
   var month = originalDate.getMonth() + 1;
   month = month < 10 ? "0" + month : month;
   var day = originalDate.getDate();
   day = day < 10 ? "0" + day : day;
   var hours = originalDate.getHours();
   hours = hours < 10 ? "0" + hours : hours;
   var minutes = originalDate.getMinutes();
   minutes = minutes < 10 ? "0" + minutes : minutes;
   var seconds = originalDate.getSeconds();
   seconds = seconds < 10 ? "0" + seconds : seconds;

   var newDateString =
     year +
     "-" +
     month +
     "-" +
     day +
     " " +
     hours +
     ":" +
     minutes +
     ":" +
     seconds;
   return newDateString;
 };

  function cleanValue(value) {
    // Remove alphabetic characters
    value = value.replace(/[a-zA-Z]/g, "");
    // Trim spaces
    value = value.trim();
    // Replace empty string with '0'
    if (value === "") {
      return "0";
    } else {
      return value;
    }
  }

  mysqlConnection.query(sql, async (err, data) => {
    if (err) {
      console.error("MySQL Query Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const branchesFromStudentID = data.map((branch) => {
      let [year, branchId] = branch.student_id.split("-");
      return branchId;
    });

    const calenderYearIds = data.map((branch) => {
      let [year, branchId] = branch.student_id.split("-");
      return 20 + year;
    });

    // Extract security IDs from MySQL data
    const securityIds = data.map((trans) => trans.created_by);

    const studentIds = data.map((students) => students.student_id);
    const FeeTypes = data.map((branches) => branches.fee_type);

    // Fetch security data from MongoDB based on security IDs

    // Create a mapping of security ID to security name
    const securityNameMap = {};
    const subFeeMap = {};
    const studentIdsMap = {};

    const branchIdMap = {};
    const calenderIDMap = {};

    const branchData = await BranchDetailsModel.find({
      branch_name: { $in: branchesFromStudentID },
    });
    branchData.forEach((branch) => {
      branchIdMap[branch.branch_name] = branch._id;
    });

    const calendarYearsData = await AddCalendarYear.find({
      calendar_year_value: { $in: calenderYearIds },
    });
    calendarYearsData.forEach((branches) => {
      calenderIDMap[branches.calendar_year_value.slice(-2)] = branches._id;
    });

    const securityData = await AddSecurities.find({
      security_id: { $in: securityIds },
    });
    securityData.forEach((security) => {
      securityNameMap[security.security_id] = security._id; // Assuming admin_name is the field you want
    });

    securityNameMap["0"] = "667d48e51aa3c80432422e91"; // no user with security id 0 so linking to admin only
    securityNameMap["1"] = "667d48e51aa3c80432422e91";

    const FeeTypeData = await AddSubFeeTypes.find({
      sub_fee_type: { $in: FeeTypes },
    });
    FeeTypeData.forEach((branches) => {
      subFeeMap[branches.sub_fee_type.toString()] = branches._id;
    });

    const studentsData = await AddStudents.find({ id: { $in: studentIds } });
    studentsData.forEach((students) => {
      studentIdsMap[students.id] = students._id;
    });

    //  const currentAcadamicYear = (students_id) => {
    //    if (!/.+-.+-/.test(students_id)) {
    //      return String("");
    //    }
    //    let studentYear = 20 + students_id.split("-")[0];

    //    let currentYear = new Date().getFullYear();

    //    if (currentYear - studentYear >= 4) {
    //      return String("662a4e43862115e621e1eefc");
    //    } else if (currentYear - studentYear == 3) {
    //      return String("662a4e38862115e621e1eef8");
    //    } else if (currentYear - studentYear == 2) {
    //      return String("662a4e2b862115e621e1eef4");
    //    } else {
    //      return String("662a3ef5862115e621e1ea55");
    //    }
    //  };

    let academic_years_array = [
      "662a3ef5862115e621e1ea55",
      "662a4e2b862115e621e1eef4",
      "662a4e38862115e621e1eef8",
      "662a4e43862115e621e1eefc",
    ];
    
    // console.log("enrichedData is ", data[0].create_date_time);

    // Enrich MySQL data with security names
    const enrichedData = data
      .map((transactions) => ({
        ...transactions,

        security_id: securityNameMap[transactions.created_by],
        student_id1: studentIdsMap[transactions.student_id],
        fee_type_id: subFeeMap[transactions.fee_type],
        created_by_id: securityNameMap[transactions.created_by],
        branch_id: branchIdMap[transactions.branch_name],
        calendar_years_id:
          calenderIDMap[
            transactions.student_id.split("-")[0].endsWith("S")
              ? transactions.student_id.split("-")[0].slice(0, -1)
              : transactions.student_id.split("-")[0]
          ],
        student_name: transactions.student_name,
        transactionIdValue: transactions.transaction_id,
      }))
      .sort((a, b) => a.transactions_id - b.transactions_id);

    //  for (let i = 0; i < academic_years_array.length; i++) {
      console.log("enrichedData length is", enrichedData.length);

    for (let i = 0; i < enrichedData.length; i++) {
      const tt = enrichedData[i];

      // Map MySQL fields to MongoDB fields
      var dateString = tt.create_date_time;
      var date = new Date(dateString);
      var year = date.getFullYear();

      const mappedTransactions = {
        bill_number: tt.bill_number,

        created_date_time_value: convertDate(tt.create_date_time),

        transactionidvalue: tt.transactionIdValue,

        tot_amt: cleanValue(tt.amount),

        paiddetails: [
          {
            student_id: tt.student_id1,
            sub_fee_id: tt.fee_type_id,

            payment_method: tt.payment_method,
            amount: cleanValue(tt.amount),
            cash: cleanValue(tt.cash),
            bank: cleanValue(tt.bank),
            upi: cleanValue(tt.upi),
            bill_type: tt.bill_type,
            status: tt.status,
            transaction_type: tt.transaction_type,
            created_by: tt.created_by_id,

            // updated_by: { type: String },
            

            org_id: "667d45871aa3c80432422d5f",
            created_date_time: convertDate(tt.create_date_time),
            year: year,
            branch_id: tt.branch_id,
            date: moment(tt.date).format('YYYY-MM-DD'),
            //  academic_years_id:  academic_years_array[i],
            academic_years_id: String(currentAcadamicYear(tt.student_id)),

            calendar_years_id: tt.calendar_years_id,
            transaction_number: tt.transaction_number,
            transaction_id: tt.transaction_id,
          },
        ],
      };

      // console.log("enrichedData is ",mappedTransactions);
      const currentDate = tt.create_date_time;
      const formattedDate = format(currentDate, "yyyy-MM-dd HH:mm:ss");

      // console.log("formattedDate is", tt.transaction_type);


      // start
      if (tt.transaction_type === 'M') {
        let obj = {};
        // obj['student_id'] = student_id;
        obj["sub_fee_id"] = tt.fee_type_id;
        obj["id"] = tt.student_id;
        obj["student_name"] = tt.student_name;
        (obj["date"] = moment(tt.date).format("YYYY-MM-DD")),
          (obj["payment_method"] = tt.payment_method);
        obj["amount"] = cleanValue(tt.amount);
        obj["cash"] = cleanValue(tt.cash);
        obj["bank"] = cleanValue(tt.bank);
        obj["upi"] = cleanValue(tt.upi);
        obj["bill_type"] = tt.bill_type;
        obj["transaction_type"] = tt.transaction_type;
        obj["status"] = tt.status;
        obj["created_by"] = tt.created_by_id;
        obj["org_id"] = "667d45871aa3c80432422d5f";
        obj["created_date_time"] = formattedDate;
        obj["academic_years_id"] = "";
        obj["calendar_years_id"] = tt.calendar_years_id;
        obj["branch_id"] = tt.branch_id;
        obj["transactionIdValue"] = tt.transactionIdValue;

        await addManualBillFunction(obj);

        // end
      } else {
        AddTransactions.create(mappedTransactions).catch((mongoError) => {
          console.error("MongoDB Insert Error:", mongoError);
          res.status(500).json({ error: "Internal Server Error" });
        });
      }
    }
    //  }

    // res.json(arr);
    res.json({ message: "Transactions Migrated successfully" });
  });
});

//  delete MongoDB collections data

app.get("/delete_users", async (req, res) => {
  try {
    // const result = await AddSecurities.deleteMany({});
    res
      .status(200)
      .json({ message: `Deleted 0 documents from the Securities collection` });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/delete_students", async (req, res) => {
  try {
    // Delete all documents in the 'students' collection
    const result = await AddStudents.deleteMany({});
    const result1 = await AddOldStudents.deleteMany({});
    // console.log(`Deleted ${result.deletedCount} documents from the students collection`);
    res.status(200).json({
      message: `Deleted ${result.deletedCount} documents from the students collection and ${result1.deletedCount} from old students collection`,
    });
  } catch (err) {
    // console.error('Error deleting documents:', err);
    res.status(500).json({ message: "Internal Server Error" });
  }

  // Close the connection
  // client.close();
});

app.get("/delete_fee_types", async (req, res) => {
  try {
    // Delete all documents in the 'students' collection
    const result = await AddFeeTypes.deleteMany({});
    const result1 = await AddSubFeeTypes.deleteMany({});
    // console.log(`Deleted ${result.deletedCount} documents from the students collection`);
    res.status(200).json({
      message: `Deleted FeeTYpes: ${result.deletedCount} & SubFeeTypes: ${result1.deletedCount} documents from the Fee details & Sub Fee Deatils collections`,
    });
  } catch (err) {
    // console.error('Error deleting documents:', err);
    res.status(500).json({ message: "Internal Server Error" });
  }

  // Close the connection
  // client.close();
});

app.get("/delete_expenses", async (req, res) => {
  try {
    // Delete all documents in the 'students' collection
    const result = await AddExpenses.deleteMany({});
    // console.log(`Deleted ${result.deletedCount} documents from the students collection`);
    res.status(200).json({
      message: `Deleted ${result.deletedCount} documents from the Expenses collection`,
    });
  } catch (err) {
    // console.error('Error deleting documents:', err);
    res.status(500).json({ message: "Internal Server Error" });
  }

  // Close the connection
  // client.close();
});

app.get("/delete_roles", async (req, res) => {
  try {
    // Delete all documents in the 'students' collection
    const result = await AddRoles.deleteMany({});
    // console.log(`Deleted ${result.deletedCount} documents from the students collection`);
    res.status(200).json({
      message: `Deleted ${result.deletedCount} documents from the Roles collection`,
    });
  } catch (err) {
    // console.error('Error deleting documents:', err);
    res.status(500).json({ message: "Internal Server Error" });
  }

  // Close the connection
  // client.close();
});

app.get("/delete_branches", async (req, res) => {
  try {
    // Delete all documents in the 'students' collection
    const result = await AddBranches.deleteMany({});
    // console.log(`Deleted ${result.deletedCount} documents from the students collection`);
    res.status(200).json({
      message: `Deleted ${result.deletedCount} documents from the Branches collection`,
    });
  } catch (err) {
    // console.error('Error deleting documents:', err);
    res.status(500).json({ message: "Internal Server Error" });
  }

  // Close the connection
  // client.close();
});

app.get("/delete_branche_fees", async (req, res) => {
  try {
    // Delete all documents in the 'students' collection
    const result = await AddBranchFees.deleteMany({});
    // console.log(`Deleted ${result.deletedCount} documents from the students collection`);
    res.status(200).json({
      message: `Deleted ${result.deletedCount} documents from the Branches collection`,
    });
  } catch (err) {
    // console.error('Error deleting documents:', err);
    res.status(500).json({ message: "Internal Server Error" });
  }

  // Close the connection
  // client.close();
});

app.get("/delete_branchStudents", async (req, res) => {
  try {
    // Delete all documents in the 'students' collection
    const result = await AddAllocateStudenBranch.deleteMany({});
    // console.log(`Deleted ${result.deletedCount} documents from the students collection`);
    res.status(200).json({
      message: `Deleted ${result.deletedCount} documents from the Allocate Studennts Branches collection`,
    });
  } catch (err) {
    // console.error('Error deleting documents:', err);
    res.status(500).json({ message: "Internal Server Error" });
  }

  // Close the connection
  // client.close();
});

app.get("/delete_transactions", async (req, res) => {
  try {
    // Delete all documents in the 'Transaction' collection
    const result = await AddTransactions.deleteMany({});
    res.status(200).json({
      message: `Deleted ${result.deletedCount} documents from the Tranastions collection`,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.get("/delete_relievedAmounts", async (req, res) => {
  try {
    // Delete all documents in the 'Transaction' collection
    const result = await relieveModel.deleteMany({});
    res.status(200).json({
      message: `Deleted ${result.deletedCount} documents from the Tranastions collection`,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

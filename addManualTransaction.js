let studentinfo = require("./model/students_model");
let transaction = require("./model/transactions-model");

function addLeadingZeros(num, totalLength) {
  return String(num).padStart(totalLength, "0");
}

const addTransactionnumber = (reqdata) => {
  return new Promise(async (resolve, reject) => {
    const updateDocument = async (resObj) => {
      let unwind = { $unwind: "$paiddetails" };
      let tranvalue = await transaction
        .aggregate([unwind])
        .sort({ "paiddetails.transaction_id": -1 })
        .limit(1);
      let transaction_id = 1;
      if (tranvalue.length > 0) {
        let tran_id = tranvalue[0]?.paiddetails?.transaction_id ?? 0;
        transaction_id = parseInt(tran_id) + 1;
      }
      let tran_id = resObj._id;
       if(tran_id.toString() == 5){
          console.log("pakad leyaaa");
       }
     

      let transaction_number = "STDTRNS" + addLeadingZeros(transaction_id, 5);
      await transaction.updateOne(
        { "paiddetails._id": tran_id },
        {
          $set: {
            "paiddetails.$.transaction_id": transaction_id,
            "paiddetails.$.transaction_number": transaction_number,
          },
        }
      );
      // transaction_id ++;
    };
    let paiddetails = reqdata.paiddetails;
    let promises = [];
    for (let i = 0; i < paiddetails.length; i++) {
      let val = paiddetails[i];
      promises.push(await updateDocument(val));
    }
    await Promise.all(promises);
    resolve(1);
  });
};

const addManualBillFunction = async (data) => {
  let idToGive = data.id.toString();
    let student = await studentinfo.create({
      org_id: data.org_id,
      reg_type: "M",
      student_name: data.student_name,
      student_phone_number: "",
      status: "1",
      hall_ticket_number: "",
      admission_number: "",
      aadhaar_number: "",
      jnanbhumi_number: "",
      id: idToGive,
      ssc: "",
      second_language: "",
      created_by: data.created_by,
      created_date_time: data.current_date_time,
      manual_created_date_time: data.current_date_time,
    });
    let student_id = (student?._id).toString();
    

    let paiddetails = [];
    paiddetails.push(data);
    paiddetails = paiddetails.map((item, i) => ({
      ...item,
      student_id: student_id,
    }));
let transactionidvalue = 1;

    // import transaction
     const tranvalue = await transaction
       .find()
       .sort({ transactionidvalue: -1 })
       .limit(1);

     
     let billno;

     const present_date = data.created_date_time.split(" ")[0];
     let todaydate = present_date.replace(/-/g, "");
      // added
      //  if (tranvalue.length == 0) {
        
     if (tranvalue.length > 0 && !tranvalue[0]?.transactionidvalue) {
       billno = todaydate + addLeadingZeros(transactionidvalue, 3);
     } else {
       transactionidvalue = parseInt(tranvalue[0]?.transactionidvalue) + 1;

       billno = tranvalue[0].bill_number;
       let date = tranvalue[0]?.created_date_time_value ?? dateTime;
       let date1 = date.split(" ")[0];
       let date2 = date1.replace(/-/g, "");
       if (date2 == todaydate) {
         billno = parseInt(billno) + 1;
         // billno = todaydate + addLeadingZeros(transactionidvalue, 3);
       } else {
         billno = todaydate + addLeadingZeros(1, 3);
       }
     }
     let transaction_number =
       "STDTRNS" + addLeadingZeros(transactionidvalue, 5);


     let objvalue = {};
     objvalue["tot_amt"] = data.amount;
     objvalue["bill_number"] = billno;
     // objvalue['transaction_number'] = transaction_number;
     objvalue["transactionidvalue"] = transactionidvalue;
     objvalue["created_date_time_value"] = data.created_date_time;
     objvalue["paiddetails"] = paiddetails;





     // adding a new transaction in transaction DB

     let value = await transaction.create(objvalue);
     // created a new transaction which returned total transaction obj as value
     if (value) {
       // to update tranction number, id and _id
       await addTransactionnumber(value);
     }

   
}

module.exports = { addManualBillFunction };


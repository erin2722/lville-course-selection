/*
  - the functions createAllCoursesArray, createCourseDescriptionArray, and
    createSavedSelectionsArray are not needed if sentinel pulls JSON formatted
    data from the database
*/
$(document).ready(function(){
  /*this variable is an array of objects that just has each RGP and priority value
  in it. This makes looping through the tables easier */
  var tableRGPS = createTableRGPS();
  /*This is where sentinel will pull from the course database.
  Right now it just reads in the CSV file as a string, parses it, and returns
  an array of course objects. The allCoursesArray and courseDescription array
  could probably be combined if they pull from the same course database. The
  saved selections array is unique to each student and is just which courses they
  have already saved.*/
  var allCoursesArray = createAllCoursesArray(courseList);
  var courseDescriptionArray = createCourseDescriptionArray(courseDescriptions);
  var savedSelectionsArray = createSavedSelectionsArray(outputCSV);

  /*Sentinel will also pull student data here. Everything will be a constant but
  I am leaving it as a variable for now for the presetation. It does not matter
  if the year, studentID, and year are strings or ints, my code formats them as
  needed later on. */
  const studentID = 12345;
  var name = $('#name').val();
  var risingForm = $('#form').val();

  //get the current year for the school year section of output
  var d = new Date();
  var schoolYear = d.getFullYear();

  //this is just for demo purposes, after presentation night it can be removed
  $("#name").keypress(function(e) {
    if(e.which == 13) {
        name = $('#name').val();
    }
  });
  $("#form").keypress(function(e) {
    if(e.which == 13) {
        risingForm = $('#form').val();
    }
  });

  //call all of the functions needed when events happen
  $("#catalog").on('change', function() {
      $('#courseDescriptionBox').toggle($("#catalog").is(':checked'));
  });

  $('.close').on('click', function() {
    $('#courseDescriptionBox').hide()
  });

  /*These two commands should also be linked the the database. The save
  button will save the data to the student's account and the submit button
  will save the courses and then send them to Mr. Fernandez.*/
  $('#saveBtn').click(saveCourses);

  $('#submitBtn').click(function() {
    saveCourses();
    console.log("Courses Submitted!")
  });

  populateColumns();
  fillWithSavedCourses();

  /*this function creates the course tables on the page and then adds the RG,
  department dropdown menu, filler text for the course cell, and priority*/
  function populateColumns() {
    for(var i = 0; i<6; i+=1) {
      $('#fall').append(createCourseTable(tableRGPS[i]));
      $('#winter').append(createCourseTable(tableRGPS[i+6]));
      $('#spring').append(createCourseTable(tableRGPS[i+12]));
      for(var k = 0; k<18; k+=6) {
        for(var j = 0; j<3; j++) {
          $('#' + tableRGPS[i+k][j].RGP + ' .dept')
            .html(createDeptDrop(allCoursesArray, tableRGPS[i+k][j].RGP));
          $('#' + tableRGPS[i+k][j].RGP + ' .course')
            .html("Select a department");
          $('#' + tableRGPS[i+k][j].RGP + ' .priority')
            .html(tableRGPS[i+k][j].priority);
        }
      }
    }
  }

  //fills in all of the saved courses
  function fillWithSavedCourses() {
    for(var m = 0; m<savedSelectionsArray.length; m++) {
        var savedRGP = (savedSelectionsArray[m].request_group +
          savedSelectionsArray[m].priority).replace(/\s+/g, '');
        var filterByForm = true;
        if(savedSelectionsArray[m].notes != "") {
          filterByForm = false;
        }
        for(var x=0; x<allCoursesArray.length; x++) {
          var currentID = parseInt(savedSelectionsArray[m].veracross_course_id)
          if(currentID == parseInt(allCoursesArray[x].veracross_course_id)) {
            $('.' + savedRGP + 'Department').val(allCoursesArray[x].Subject);
            var newDrop = createClassDrop($('.' + savedRGP + 'Department').val(),
              allCoursesArray, savedRGP, filterByForm);
            $('#' + savedRGP + ' .course').html(newDrop);
            $('.' + savedRGP + 'Courses').val(currentID);
            autofill(parseInt(savedRGP), currentID);
          }
        }
    }
  }
  /*this function creates the RGP and priority values for the tables. I also
  use this array when cycling through the table*/
  function createTableRGPS() {
    var tableRGPS = [];
    var tempArr = [];
    for(var term=1; term<4; term++) {
      for(var num=1; num<7; num++) {
        for(var priority=1; priority<4; priority++) {
          tempArr.push(
            {
              RGP: String(num)+String(term)+String(priority),
              priority: String(priority)
            }
          );
        }
        tableRGPS.push(tempArr);
        tempArr = [];
      }
    }
    return tableRGPS
  }

  /*this function takes in the data from the CSV file (that I just put as a string
  in the courseList var) and turns it into an array of course objects that I can
  use for the rest of the code*/
  function createAllCoursesArray(courseList) {
      var tempArray = courseList.split('\n');
      var courseObjectList = [];
      for(var i = 1; i<(tempArray.length); i++) {
        var courseArray = tempArray[i].split(",");
        courseObjectList.push(
          {
            veracross_course_id: String(courseArray[0]),
            Subject: String(courseArray[1]),
            CourseID: String(courseArray[2]),
            CourseName: String(courseArray[3]),
            veracross_grading_period_id: String(courseArray[4]),
            RisingForm: String(courseArray[5]),
          }
        )
      }
      return courseObjectList;
  }

  /* Create array of objects with the course description included. I had trouble
  parsing this but it should be ok once it is pulling straight from the database */
  function createCourseDescriptionArray(courseList) {
      var tempArray = courseList.split('\n');
      var courseObjectList = [];
      for(var i = 1; i<(tempArray.length); i++) {
        var courseArray = tempArray[i].split(",");
        newObject =
          {
            veracross_course_id: courseArray[0],
            Subject: courseArray[1],
            CourseName: courseArray[3],
            Description: courseArray[4]
          }
        if(newObject.Subject != undefined) {
          courseObjectList.push(newObject);
        }
      }
      return courseObjectList;
  }

  //creates array of saved course objects when they are read back into the code.
  function createSavedSelectionsArray(outputCSV) {
      var tempArray = outputCSV.split('\n');
      var courseObjectList = [];
      for(var i = 1; i<(tempArray.length); i++) {
        var courseArray = tempArray[i].split(",");
        courseObjectList.push(
          {
            veracross_student_id: courseArray[0],
            veracross_course_id: courseArray[1],
            school_year: courseArray[2],
            veracross_grading_period_id: courseArray[3],
            request_group: courseArray[4],
            enrollment_level_id: courseArray[5],
            priority: courseArray[6],
            notes: courseArray[7]
          }
        )
      }
      return courseObjectList;
  }

  /*these are the attributes Mr. Fernandez needs for output, this function
  just creates an object of them*/
  function createCourseOutputObj(veracross_student_id, veracross_course_id, school_year,
     veracross_grading_period_id, request_group, enrollment_level_id, priority, notes) {
    var courseOutputObj = {
      veracross_student_id,
      veracross_course_id,
      school_year,
      veracross_grading_period_id,
      request_group,
      enrollment_level_id,
      priority,
      notes
    };
    return courseOutputObj;
  }

  /*this function creates each of the tables for course selection and gives them
  their individual class names*/
  function createCourseTable(tableRGPS) {
    var newTable = document.createElement("TABLE");
    newTable.className = "courseTable table";
    //the id of each table is its RG
    newTable.id = String(tableRGPS[0].RG);
    for(var i=0; i<3; i++) {
      var newRow = newTable.insertRow();
      //the row's ID is its RGP (RG and Priority)
      newRow.id = tableRGPS[i].RGP;
      newRow.className = newRow.id[0] + newRow.id[2];
      newRow.insertCell(0).className = "priority";
      newRow.insertCell(1).className = "dept";
      newRow.insertCell(2).className = "course";
    }
    return newTable;
  }

  //creates the dropdown list for departments
  function createDeptDrop(allCoursesArray, RGP) {
    var allDepartments = [];
    var alreadyInList = false
    /*cycle through course array and add each department to the list if it
    hasn't been added already*/
    for(var i=0; i<allCoursesArray.length; i++) {
      for(var j = 0; j<allDepartments.length; j++){
        if(allDepartments[j] == allCoursesArray[i].Subject) {
          alreadyInList = true
        }
      }
      if(!alreadyInList) {
        allDepartments.push(allCoursesArray[i].Subject);
      }
      alreadyInList = false
    }

    //make a dropdown menu out of that list
    var newSelect = document.createElement("SELECT");
    newSelect.id = "deptDropdown";
    newSelect.className = RGP + "Department form-control input-sm deptDropdown";
    $(newSelect).change(updateCourseDropdown);
    var fillerOption = document.createElement("option");
    fillerOption.value = "";
    fillerOption.text = "Dept."
    newSelect.add(fillerOption);
    for(var i=0; i<allDepartments.length; i++) {
      var newOption = document.createElement("option");
      newOption.value = allDepartments[i];
      newOption.text = allDepartments[i];
      newSelect.add(newOption);
    }
    return newSelect;
  }

  //create the course dropdown list after they select their department
  function createClassDrop(subject, allCoursesArray, RGP, filterByForm) {
    var coursesForDept = [];
    var term = String(parseInt(String(RGP)[1])*2);
    var correctSubject = false;
    var correctTerm = false;
    var correctGrade = false;

    //create the list by checking the subject, term, and form requirements
    for(var i=0; i<allCoursesArray.length; i++) {
      correctSubject = allCoursesArray[i].Subject == subject;
      correctTerm = String(allCoursesArray[i].veracross_grading_period_id).includes(term) ||
        String(allCoursesArray[i].veracross_grading_period_id) == "50";
      correctGrade = String(allCoursesArray[i].RisingForm).includes(risingForm) ||
        !filterByForm;
      if(correctSubject && correctGrade && correctTerm) {
        coursesForDept.push(allCoursesArray[i]);
      }
    }
    //create the dropdown out of that list
    var newSelect = document.createElement("SELECT");
    newSelect.id = "courseDropdown";
    newSelect.className = RGP + "Courses form-control input-sm courseDropdown";
    $(newSelect).change(courseDropChanged);
    var fillerOption = document.createElement("option");
    fillerOption.value = "";
    fillerOption.text = "Choose a course"
    newSelect.add(fillerOption);
    for(var i=0; i<coursesForDept.length; i++) {
      var newOption = document.createElement("option");
      newOption.value = coursesForDept[i].veracross_course_id;
      newOption.text = coursesForDept[i].CourseName;
      newSelect.add(newOption);
    }

    if(filterByForm) {
      var newOption = document.createElement("option");
      newOption.value = "Other";
      newOption.text = "Other";
      newSelect.add(newOption);
    }
    return newSelect;
  }

  //when they change the department, update the corresponding course list
  function updateCourseDropdown() {
    var newDrop = createClassDrop(this.value, allCoursesArray, parseInt(this.className), true);
    $('#' +  parseInt(this.className) + ' .course').html(newDrop);
  }

  function courseDropChanged() {
    courseName = $('.' + parseInt(this.className) + 'Courses option:selected').text();
    showOther(parseInt(this.className), courseName);
    checkForDuplicates(parseInt(this.className), this.value); //check this when everything else is done
    autofill(parseInt(this.className), this.value);
    showCourseDescription(this.value);
  }

  //if other is selected, replace the dropdown with one not filtered by form
  function showOther(RGP, courseName) {
    if(courseName == "Other") {
      alert("You will now see classes not approved for your form");
      var newDrop = createClassDrop($('.' + RGP + 'Department').val(),
        allCoursesArray, RGP, false);
      $('#' +  RGP + ' .course').html(newDrop);
    }
  }

  function checkForDuplicates(RGP, courseID) {
    for(var i = 0; i<6; i+=1) {
      for(var k = 0; k<18; k+=6) {
        for(var j = 0; j<3; j++) {
          if($('.' + tableRGPS[i+k][j].RGP + 'Courses').val() == courseID) {
            if(tableRGPS[i+k][j].RGP != RGP) {
              alert("This course has already been chosen, please select another one")
              $('.' + RGP + 'Courses').val("");
            }
          }
        }
      }
    }
  }

  //autopopulate if multi-term class
  function autofill(currentRGP, currentCourseID) {
    for(var i = 0; i<allCoursesArray.length; i++) {
      if(currentCourseID == allCoursesArray[i].veracross_course_id) {
        if(allCoursesArray[i].RisingForm.includes(risingForm)) {
          var filterByForm = true;
        } else {
          var filterByForm = false;
        }
        if(String(allCoursesArray[i].veracross_grading_period_id) == "50") {
            if(String(currentRGP)[1] == 1) {
              nextRGPs = [String(currentRGP + 10), String(currentRGP + 20)]
            } else if(String(currentRGP)[1] == 2) {
              nextRGPs = [String(currentRGP - 10), String(currentRGP + 10)]
            } else if(String(currentRGP)[1] == 3) {
              nextRGPs = [String(currentRGP - 20), String(currentRGP - 10)]
            }
            fill(nextRGPs);
        } else if(String(allCoursesArray[i].veracross_grading_period_id) == "24") {
            if(String(currentRGP)[1] == "1") {
              nextRGPs = [currentRGP + 10];
            } else {
              nextRGPs = [currentRGP - 10];
            }
            fill(nextRGPs)
        } else if(String(allCoursesArray[i].veracross_grading_period_id) == "46") {
            if(String(currentRGP)[1] == "2") {
              nextRGPs = [currentRGP + 10];
            } else {
              nextRGPs = [currentRGP - 10];
            }
            fill(nextRGPs)
        }
      }
    }
    function fill(nextRGPs) {
      for(var i = 0; i<nextRGPs.length; i++) {
        $('.' + nextRGPs[i] + 'Department').val($('.' + currentRGP + 'Department').val());
        var newDrop = createClassDrop($('.' + currentRGP + 'Department').val(),
          allCoursesArray, nextRGPs[i], filterByForm);
        $('#' + nextRGPs[i] + ' .course').html(newDrop);
        $('.' + nextRGPs[i] + 'Courses').val(currentCourseID);
      }
    }
  }

  function showCourseDescription(courseID) {
    var populated = false;
    $('#descriptionText').html("");
    for(var i = 0; i<courseDescriptionArray.length; i++) {
      if(courseDescriptionArray[i].veracross_course_id == courseID) {
        $('#descriptionText').append(courseDescriptionArray[i].CourseName + ":  ");
        $('#descriptionText').append(courseDescriptionArray[i].Description);
        populated = true;
      }
    }
    if(!populated) {
      $('#descriptionText').append("Please select a course to view its description");
    }
    var catalogOn = $("#catalog").is(':checked');
    if(catalogOn && courseID != "Other") {
         $('#courseDescriptionBox').show();
    }
  }

  /*when the submit button is clicked, read in all of the data from the tables,
  get the other needed data from the all courses array objects, make a new array
  of the course objects ready to be outputed, and then transform that array of
  objects into a CSV file*/
  function saveCourses() {
    var rg = "";
    var course = "";
    var priority = "";
    var courseID = "";
    var gradingPeriod = "";
    var notes = "";
    var outputStr = "";
    var finalStudentCourseArray = [];

    for(var i = 0; i<6; i+=1) {
      for(var k = 0; k<18; k+=6) {
        for(var j = 0; j<3; j++) {
          var alreadyRecorded = false
          if($('.' + tableRGPS[i+k][j].RGP + 'Courses').val()!=undefined &&
            $('.' + tableRGPS[i+k][j].RGP + 'Courses').val()!= "Other" &&
            $('.' + tableRGPS[i+k][j].RGP + 'Courses').val()!= "") {
            rg = String(tableRGPS[i+k][j].RGP).substring(0, 2);
            course = $('.' + tableRGPS[i+k][j].RGP + 'Courses option:selected').text();
            courseID = $('.' + tableRGPS[i+k][j].RGP + 'Courses').val();
            priority = $('#' + tableRGPS[i+k][j].RGP + ' .priority').html();
            for(var m = 0; m<allCoursesArray.length; m++) {
              if(courseID == allCoursesArray[m].veracross_course_id) {
                if(allCoursesArray[m].veracross_grading_period_id.length != 1) {
                  gradingPeriod = allCoursesArray[m].veracross_grading_period_id;
                } else {
                  gradingPeriod = String(parseInt(rg[1])*2);
                }
                if(allCoursesArray[m].RisingForm.includes(risingForm)) {
                  notes = ""
                } else {
                  notes = "not approved for rising form"
                }
              }
            }
            if(finalStudentCourseArray.length != 0) {
              for(var n = 0; n<finalStudentCourseArray.length; n++) {
                if(courseID == finalStudentCourseArray[n].veracross_course_id) {
                  alreadyRecorded = true
                }
              }
            }
            if(!alreadyRecorded) {
              finalStudentCourseArray.push(createCourseOutputObj(studentID,
                courseID, schoolYear, gradingPeriod, rg, "", priority, notes));
            }
          }
        }
      }
    }
    console.log(finalStudentCourseArray);

    //this is what i used to turn the array of objects back into a string
    for(propt in finalStudentCourseArray[0]) {
      outputStr += propt + ", "
    }
    outputStr = outputStr.substring(0, outputStr.length - 2);
    outputStr += '\n';

    for(var i = 0; i<finalStudentCourseArray.length; i++) {
      for(propt in finalStudentCourseArray[i]) {
        outputStr += finalStudentCourseArray[i][propt];
        outputStr += ", ";
      }
      outputStr = outputStr.substring(0, outputStr.length - 2);
      outputStr += '\n';
    }
    console.log(outputStr);
  }
});

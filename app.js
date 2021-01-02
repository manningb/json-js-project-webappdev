// make http request for json file
var xmlhttp = new XMLHttpRequest();
var url = "scheduling.json";

xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

        //Parse the JSON data to a JavaScript variable. 
        var parsedJSON = JSON.parse(xmlhttp.responseText);
        // This function is defined below and deals with the JSON data read from the file. 
        addDates(parsedJSON);
    }
};

xmlhttp.open("GET", url, true);
xmlhttp.send();

// global variables that will be used throughout
var storeSlots = [];
var dateChoiceVar = "";

function myFunction(obj) {
    
}

// Function to add dates buttons from json file
function addDates(obj) {
  // initiialise variables to stores dates and times
  // makes it easier to reuse these in the add times function below    
  var daysArray = [];
  var dateArray = [];
  var dateButton = [];
  var timesArray = {};

  var numDays = Object.keys(obj).length;
    // loop through each of the days
    for (day = 0; day < numDays; day++) {
        dateArray.push(obj[Object.keys(obj)[day]].date);
        daysArray.push(obj[Object.keys(obj)[day]].day);
        var slots = obj[Object.keys(obj)[day]].slots;
        storeSlots[day] = slots;
        var indTimes = [];
        dateButton[day] = document.createElement("button");
        dateButton[day].innerHTML = daysArray[day] + ", " + dateArray[day].slice(8, 10) + "th of April";
        dateButton[day].value = day;

        // when date button is clicked add times dropdown for that date
        dateButton[day].onclick = function() {
            addTimes(this.value, timesArray, dateArray, daysArray);
        };
        document.getElementById("dates").appendChild(dateButton[day]);

        // loop through each of the times
        var numSlots = Object.keys(slots).length;
        for (j = 0; j < numSlots; j++) {
            indTimes.push(slots[Object.keys(slots)[j]].time);
        }
        timesArray[day] = indTimes;
    }
}

// Function to add times dropdown based on date selection from json file 
// and to change the submit button based on the date
function addTimes(i, timesArray, dateArray, daysArray) {
    // add the chosen date to the submit button
    var submitB = document.getElementById("submitB");
    var dateChoice = document.getElementById("dateChoice");
    dateChoice.innerHTML = "";
    dateChoiceIndex = i;
    dateChoiceVar = daysArray[i] + ", " + dateArray[i].slice(8, 10) + "th of April";
    submitB.innerHTML = "Submit " + dateChoiceVar;

    // get the divider for where the times will be shown 
    var times = document.getElementById("times");
    document.getElementById("timeHead").innerHTML = "Select a time (optional)";

    // make it empty (prevent times being added on every date choice)
    times.innerHTML = "";
    var select = document.createElement("select");
    select.name = "times";
    select.id = "timeSelect";

    // create default option
    var optionDefault = document.createElement("option");
    optionDefault.setAttribute("disabled", 0);
    optionDefault.setAttribute("selected", 0);
    optionDefault.setAttribute("value", "");
    optionDefault.text = "Please select a time for " + daysArray[i];
    select.appendChild(optionDefault);

    // add time options
    for (j = 0; j < timesArray[i].length; j++) {
        var option = document.createElement("option");
        option.value = timesArray[i][j];
        option.text = timesArray[i][j];
        select.appendChild(option);
    }

    // add the select to the html document
    var label = document.createElement("label");
    label.htmlFor = "times";
    document.getElementById("times").appendChild(label).appendChild(select);
}


var count = 0;

// function to return output after pressing submit button
function getData(paperCheck) {
    var checkSessions = false;
    if (dateChoiceVar != "") {
        document.getElementById("content").classList.add("contentAfter");
        document.getElementById("paper").style = "display:block";
    
        //this resets the checkbox to all when the getData function is submitted
        if (paperCheck === 0) {
            document.getElementById("all").checked = true;
            document.getElementById("paperOnly").checked = false;
            document.getElementById("paperNot").checked = false;
        }
        var selectedTime = document.getElementById("timeSelect").value;
        var dateContainer = document.getElementById("dateContainer");
        var dateSubmitted = document.getElementById("dateSubmitted");
        // clear the previous results
        dateContainer.innerHTML = "";
        dateSubmitted.innerHTML = "";
        dateSubmitted.innerHTML += `You selected: ${dateChoiceVar}`;
        if (selectedTime != "") {
            dateSubmitted.innerHTML += ` at ${selectedTime}`
        }
        for (const id in storeSlots[dateChoiceIndex]) {
            for (const session in storeSlots[dateChoiceIndex][id].sessions) {
              sessionTypeVar = storeSlots[dateChoiceIndex][id].sessions[session].type;
              sessionTimeVar = storeSlots[dateChoiceIndex][id].time;
              if (selectedTime == "" || selectedTime == sessionTimeVar) {
                  if (sessionTypeVar == 'paper' && paperCheck == 1 || sessionTypeVar != 'paper' && paperCheck == 2 || paperCheck == 0) {
                      checkSessions = true;
                      // create divider for the session info
                      divx = document.createElement("div");
                      divx.classList.add("sessionClass", sessionTypeVar);
                      divx.id = storeSlots[dateChoiceIndex][id].sessions[session].sessionId;
                      dateContainer.appendChild(divx);
                      // add the title to the session
                      sessionHead = document.createElement("h4");
                      //sessionHead.id = "viewMore" + session;
                      sessionHead.value =divx.id;
                      sessionHead.innerHTML = storeSlots[dateChoiceIndex][id].sessions[session].title;
                      if (storeSlots[dateChoiceIndex][id].sessions[session].submissions.length > 0) {
                        // add click to the session title if there are submissions
                        sessionHead.classList.add('clickable')
                        sessionHead.onclick = function() {
                              viewMoreFunction(this.value, storeSlots[dateChoiceIndex][id].sessions[session].submissions);
                          };
                      }
                      divx.appendChild(sessionHead);
                      // add information about the session below the title
                      sessionInfo = document.createElement("p");
                      sessionInfo.innerHTML = "🗺️ Room <b>" + storeSlots[dateChoiceIndex][id].sessions[session].room + "</b> - 📝 Type: <b>" + toTitleCase(sessionTypeVar) + "</b> - ⌚ Starts at <b>" + sessionTimeVar.slice(0, 5) + "</b>";
                      divx.appendChild(sessionInfo);

                  }
              }
          }
        }
    } else {
        window.alert("You must choose a date before submitting.");
    }
    // check if there are no sessions return error message if so
    if (checkSessions === false){
      var noSessions = document.getElementById("myElement");
      if (!noSessions){
        noSessions = document.createElement("div");
        noSessions.id = "noSessions";
        noSessions.innerHTML = `<strong>Oh!</strong> There's no sessions for the current selection. Please try again.`;
        dateContainer.appendChild(noSessions);
      }
    }
}

function viewMoreFunction(value, submissions) {
    mainDiv = document.getElementById(value);
    divPrev = document.getElementById(value + "div");
    // show hide submissions every click
    if (divPrev) {
        if (divPrev.style.display === "none") {
            divPrev.style.display = "block";
        } else {
            divPrev.style.display = "none";
        }
    // create the submissions if its the first time
    } else {
        div = document.createElement("div");
        div.id = value + "div";
        div.classList.add("submissionClass");
        mainDiv.appendChild(div);
        for (const submission in submissions) {
            submissionHead = document.createElement("p");
            submissionHead.innerHTML = "📗 " + submissions[submission].title + " ";
            submissionHead.style = "display:inline;";
            div.appendChild(submissionHead);
            url = submissions[submission].doiUrl;
            // checks there's a url, if so show it
            if (url) {
                submissionURL = document.createElement("a");
                submissionURL.target = "_blank";
                submissionURL.innerHTML = "(" + url + ")<br>";
                // check if not last submissions - add a break if not
                if (submission != submissions.length - 1) {
                    submissionURL.innerHTML += "<br>";
                }
                submissionURL.href = url;
                div.appendChild(submissionURL);
            }
        }
    }
}

// function to convert to title case from here: https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
// also added a check if its already upper case to not convert
function toTitleCase(str) {
    if (str === str.toUpperCase()) {
        return str;
    } else {
        return str.replace(
            /\w\S*/g,
            function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }
}
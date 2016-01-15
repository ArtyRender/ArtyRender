//create UI Interface
var myPanel = this;
myPanel.txt = myPanel.add("statictext", [10, 10, 120, 30], "Number of threads: ");
myPanel.txt.location = [10, 15];

myPanel.numThread = myPanel.add("edittext", [15, 15, 40, 35], 1);
myPanel.numThread.location = [120, 15];

myPanel.rerender = myPanel.add("checkbox", [10, 10, 100, 30], "reRender");
myPanel.rerender.value = false;
myPanel.rerender.location = [7, 45];

myPanel.btn = myPanel.add("button", [10, 10, 100, 30], "Render");
myPanel.btn.location = [30, 70];


//===============================================================================================================================

function createAndRunButFile() {
    var numThread = myPanel.numThread.text; //read number from text form
    //verify input number, it must be integer number
    if (numThread % 1 != 0) // if string or real number
    {
        alert("input integer number of render instances");
    } else {
        app.project.save(); //save projects for app.project.file.path value
        var projPath = app.project.file.path + "/aeCommandLineRender.bat"; // path where *.bat file will be saved

        var batFile = new File(projPath); //create file
        batFile.open("w"); //open file for whrite
        var AEPath = new File($.fileName).parent.parent.parent; // path to AE install folder

        //write content of *bat file

        batFile.writeln('"' + AEPath.fsName + '\\aerender.exe' + '"' + ' -project ' + '"' + app.project.file.fsName + '"' + '\r' + 'pause');
        batFile.close();

        //in loop execute *.bat file'
        //alert(AEPath.fsName + "\\aerender.exe -project " + app.project.file.absoluteURI);
        for (var i = 1; i <= numThread; i++) batFile.execute(); // запустить bat файл несколько раз
    }
}

//===============================================================================================================================
//create event onClick function, when Render button press
myPanel.btn.onClick = function() {
    //============================================check OS - if not Windows - we don't know how run aerender.exe :)

    if ($.os.toUpperCase().indexOf("WIN") === -1) {
        alert("Sorry, we don't know how to run aerender.exe in console + '\r' + If you want help to write this script for Mac, please contact me gvozdenkov@gmail.com");
        return
    };

    //==============================================check Allow script to wright files============
    var writEnable = app.preferences.getPrefAsLong("Main Pref Section v2", "Pref_SCRIPTING_FILE_NETWORK_SECURITY", PREFType.PREF_Type_MACHINE_SPECIFIC); //read from file Adobe After Effects 13.2 Prefs.txt
    if (writEnable != 1) // if Preferences->Gerenal not set to Allow Scripts to Write Files and Access Network for wright *.bat file
    {
        alert("Enable Allow Scripts to Write Files and Access Network in Preferences->General for correct plug-in work");
        app.executeCommand(2359);
        return;
    }
    var MPEnabled = app.preferences.getPrefAsLong("MP - CS5 - 4", "MP - Enable", PREFType.PREF_Type_MACHINE_SPECIFIC);
    if (MPEnabled == 1) {
        alert("For correct work Disable Render Multiple Frame Simultaneously in Preferences->Memory&Multiprocessing");
        app.executeCommand(2359);
        return;
    }

    //===============================================check RQ=====================================
    var numRQItem = app.project.renderQueue.numItems;
    if (numRQItem == 0) //RQ empty
    {
        alert("Add any Comps to Render Queue!");
        return;
    }
    //=============================check RQ for Render Items and Delet Re-Rendered files from folders===============================
    var noRQTasks = true; // проверка чтобы стояли галочки на рендер
    for (var i = 1; i <= numRQItem; i++) {
        app.project.renderQueue.item(i).applyTemplate("Multi-Machine Settings"); //chenge settings to Multi-Machine Settings
        var RQComp = app.project.renderQueue.item(i).comp.name;
        var RQCompStat = app.project.renderQueue.item(i).status;
        var RQOutput = "";
        var RQFolderName = "";

        if (RQCompStat == 2615) // 2615 - code if RQItem checked for render
        {
            noRQTasks = false;
            var RQItemFrameRate = app.project.renderQueue.item(i).comp.frameRate;
            var startFrame = app.project.renderQueue.item(i).timeSpanStart * RQItemFrameRate;
            var endFrame = startFrame + app.project.renderQueue.item(i).timeSpanDuration * RQItemFrameRate - 1;
            var reRender = myPanel.rerender.value;

            //read list files in render directory
            RQOutput = app.project.renderQueue.item(i).outputModule(1).file.path;
            var RFolder = new Folder(RQOutput);
            var fileName = app.project.renderQueue.item(i).outputModule(1).file.name;
            var fileIndexDigit = fileName.lastIndexOf("#") - fileName.indexOf("#") + 1; //number of digits in file index
            var AllFile = RFolder.getFiles(); //array of all files in Render Folder

            //create sublist of files for THIS RQ (if folder contain another rendered file sequences)
            var RFile = [];
            var k = 0;
            for (var j = 0; j < AllFile.length; j++) {
                var AllFileName = AllFile[j].name;
                var targetFileName = fileName.slice(0, fileName.length - 11 - fileIndexDigit); // only name part in RQ output To
                var thisFileName = AllFileName.slice(0, AllFile[j].name.length - 5 - fileIndexDigit); // only name part of file in render location (may be file of another image sequence)
                if (thisFileName == targetFileName) {
                    RFile[k] = AllFile[j].name;
                    k++;
                }
            }

            //read new list of files and compare number of frames with render range
            for (var j = 0; j < RFile.length; j++) {
                var fileName = RFile[j];
                var fileIndex = parseInt(fileName.slice(fileName.length - 4 - fileIndexDigit, fileName.length - 4), 10); //extract frome full file name index

                // compare fileIndex - if in render range and if reRender checkbox on delete file
                if ((fileIndex >= startFrame) && (fileIndex <= endFrame) && (reRender == true)) {
                    var deleteFile = new File(RQOutput + "/" + fileName);
                    deleteFile.remove();
                }
            }
        }
    }

    //chek if no RQ items in RQ
    if (noRQTasks == true) {
        alert("No Render Queue items selected!");
        return; // если галочки в RQ не стоят, то прерываем функцию.
    } else createAndRunButFile();
}

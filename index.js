const fs = require("fs")
const readline = require("readline")
const clUsage = require("command-line-usage")

let version = 1.1

let usage = clUsage([
    {
        header: 'VTOL VR JSON Utility',
        content: `
        The VTOL VR JSON utility will convert your VTOL VR files to and from JSON.\n\n

        Currently supported file types are:\n
        - JSON\n
        - Scenarios (.VTS)\n
        - Campaigns (.VTC)\n
        - Maps (.VTM)\n
        - Liveries (.VTL)

        Version ${version}
        `
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'input',
                alias: 'i',
                typeLabel: '{underline file path}',
                description: "(REQUIRED) The file you want to convert"
            },
            {
                name: 'output',
                alias: 'o',
                typeLabel: '{underline folder path}',
                description: "The folder that you want the converted file to be saved to",
                defaultValue: "/conversions/fromJSON or /conversions/toJSON, depending on the input file"
            },
            {
                name: 'help',
                alias: 'h',
                description: 'Prints this usage guide.'
            },
            {
                name: 'version',
                alias: 'v',
                description: 'Prints the version of the VTOL VR JSON utility that you are using.'
            }
        ]
    }
])

const commandLineArgs = require("command-line-args")
let options = commandLineArgs([
    {
        name: 'input',
        alias: 'i',
        type: String
    },
    {
        name: 'output',
        alias: 'o',
        type: String
    },
    {
        name: "help",
        alias: 'h'
    },
    {
        name: "version",
        alias: 'v'
    }
]);

let mode = "commandline"

function confirmDir(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path)
    }
}

function waitForUserInput(func) {
    rl.question('Press Enter to continue...', () => {
        if (func) func()
        rl.close();
    });
}

function fancyOutput(output, mode, wait) {
    let modeCoor = {
        "error": "\x1B[41m ERROR \x1B[0m",
        "warning": "\x1B[43m WARNING \x1B[0m",
        "info": "\x1B[44m INFO \x1B[0m",
        "success": "\x1B[42m SUCCESS \x1B[0m"
    }
    let prefix = modeCoor[mode] || ""

    console.log((`${prefix} ${output}`).trimStart())

    if ((mode == "error" || mode == "success") && wait) {
        waitForUserInput()
    }
}

confirmDir("conversions")
confirmDir("conversions/toJSON")
confirmDir("conversions/fromJSON")

let interp = require("./interpreter")

if (mode == "gui") {
    const nodegui = require("@nodegui/nodegui")
    const win = new nodegui.QMainWindow();

    let VTOLFileDialog = new nodegui.QFileDialog()
    VTOLFileDialog.setFileMode(nodegui.FileMode.ExistingFiles);
    VTOLFileDialog.setWindowTitle("Select VTOL VR File")
    VTOLFileDialog.setNameFilter('VTOL VR (*.vts *.vtm *.vtc *.vtl)');

    let JSONFileDialog = new nodegui.QFileDialog()
    JSONFileDialog.setFileMode(nodegui.FileMode.ExistingFiles);
    JSONFileDialog.setWindowTitle("Select JSON File")
    JSONFileDialog.setNameFilter('JSON (*.json)');

    win.setWindowTitle("VTOL VR Editor to JSON")
    win.setFixedWidth(700)
    win.setFixedHeight(500)

    let operationsListLabel = new nodegui.QLabel(win)
    operationsListLabel.setText("Operations")
    operationsListLabel.setInlineStyle("margin-left: 10px")

    //let operationsList = new nodegui.QScrollArea(win)
    //operationsList.setFixedWidth(700)
    //operationsList.setFixedHeight(300)
    //operationsList.setInlineStyle("background: #fafafa; margin: 10px; margin-top: 30px;")

    let operationsListTable = new nodegui.QTableWidget(0, 3)
    operationsListTable.setHorizontalHeaderLabels(["Status", "File", "Format"])
    operationsListTable.setColumnWidth(0, 700 * .13)
    operationsListTable.setColumnWidth(1, 700 * .70)
    operationsListTable.setColumnWidth(2, 700 * .10)
    operationsListTable.setFixedWidth(700)
    operationsListTable.setFixedHeight(300)
    operationsListTable.setInlineStyle("background: #fafafa; margin: 10px; margin-top: 30px;")
    const cell00 = new nodegui.QTableWidgetItem('C00');
    const cell01 = new nodegui.QTableWidgetItem('C01');
    const cell10 = new nodegui.QTableWidgetItem('C10');
    const cell11 = new nodegui.QTableWidgetItem('C11');

    class Conversion {
        constructor(input, output) {

        }
    }

    operationsListTable.setRowCount(2)
    operationsListTable.setItem(0, 0, cell00);
    operationsListTable.setItem(0, 1, cell01);
    operationsListTable.setItem(1, 0, cell10);
    operationsListTable.setItem(1, 1, cell11);


    //operationsList.setWidget(operationsListTable)

    win.setCentralWidget(operationsListTable)
    win.show();
    global.win = win;
}

if (mode == "commandline") {

    if(options.help === null || options.help){
        console.log(`${usage}\n`)
        return
    }

    if(options.version === null || options.version){
        console.log(`v${version}\n`)
        return
    }

    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let inputOpt = options.input
    let outputOpt = options.output || '__AUTO__'
    let mode = "toJSON"

    let valInputExt = [
        "vtm",
        "vts",
        "vtc",
        'vtl',
        "json"
    ]

    if (!inputOpt) {
        fancyOutput("Define an input file path with --input or -i", "error", true)
        return
    }

    let inputIssue = 0;
    try {
        if (fs.lstatSync(inputOpt).isDirectory()) {
            inputIssue = -1
        }
    } catch (e) {
        inputIssue = e.errno
    }

    if (inputIssue != 0) {
        if (inputIssue == -1) {
            fancyOutput(`Input parameter must be a path to a file\nat: ${inputOpt}`, "error", true)
            return
        } else if (inputIssue == -4058) {
            fancyOutput(`Input path does not exist\nat: ${inputOpt}`, "error", true)
            return
        } else {
            fancyOutput(`Something went wrong validating the input directory. Try running as an administrator\nat: ${inputOpt}`, "error", true)
            return
        }
    }

    let valInput = false;
    let inputOptLower = inputOpt.toLowerCase()
    valInputExt.forEach(ext => {
        if (inputOptLower.endsWith(`.${ext}`)) {
            valInput = true
        }
    })
    if (!valInput) {
        fancyOutput("Input file must be a VTM, VTS, VTC, VTL, or JSON", "error", true)
        return
    }

    
    if (outputOpt == "__AUTO__") {
        if (inputOpt.endsWith(".json")) {
            outputOpt = "./conversions/fromJSON"
            mode = "fromJSON"
        } else {
            outputOpt = "./conversions/toJSON"
        }

        fancyOutput(`Output directory automatically set to ${outputOpt}`, "info")
    } else {
        let outputIssue = 0
        try {
            if (!fs.lstatSync(outputOpt).isDirectory()) {
                outputIssue = -1
            }
        } catch (e) {
            outputIssue = e.errno
        }


        if (outputIssue != 0) {
            if (outputIssue == -1) {
                fancyOutput(`Output parameter must be a path to a directory\nat: ${outputOpt}`, "error", true)
                return
            } else if (outputIssue == -4058) {
                fancyOutput(`Output directory does not exist\nat: ${outputOpt}`, "error", true)
                return
            } else {
                fancyOutput(`Something went wrong validating the output directory. Try running as an administrator\n${outputOpt}`, "error", true)
                return
            }
        }
    }
    

    let inputFileName = inputOpt.split(/[\\/]/);
    inputFileName = inputFileName[inputFileName.length - 1]
    inputFileName = inputFileName.substring(0, inputFileName.lastIndexOf("."))
    inputFileName = `${inputFileName}.json`
    let outputFinal = outputOpt
    if(!outputFinal.endsWith("/") && !outputFinal.endsWith("\\")){
        outputFinal = `${outputFinal}/`
    }
    outputFinal = `${outputFinal}${inputFileName}`
    if(mode == "fromJSON"){
        outputFinal = outputFinal.substring(0, outputFinal.lastIndexOf("."))
    }
    

    switch (mode) {
        case "toJSON":
            interp.toJSON(inputOpt, async (json) => {
                
                const jsonData = JSON.stringify(json, null, 2);
                fs.writeFile(`${outputFinal}`, jsonData, (err) => {
                    if (err) {
                        fancyOutput(`Error writing JSON file\nat: ${outputFinal}`, "error", true);
                        console.log(err)
                        rl.close()
                        return;
                    }
                    fancyOutput(`Converted ${inputOpt} to JSON succesfully\nat: ${outputFinal}`, "success", true)
                });
            });
            break;
        case "fromJSON":
            interp.fromJSON(inputOpt, (vtol) => {
                outputFinal = `${outputFinal}.${vtol.type}`
                fs.writeFile(outputFinal, vtol.data, (err) => {
                    if (err) {
                        fancyOutput(`Error writing VTOL ${vtol.type} file\nat: ${outputFinal}`, "error", true);
                        console.log(err)
                        rl.close()
                        return;
                    }
                    fancyOutput(`Converted ${inputOpt} to VTOL ${vtol.type} succesfully\nat: ${outputFinal}`, "success", true)
                });
            });
            break;
        default:
            break;
    }

    

    
}


const readline = require("readline")
const dot = require("dot-object")

function convertString(str) {
    if(!str){
        return undefined
    }

    let numValid = /^[0-9.-]*$/.test(str)

    if (!str.includes('.') && numValid) {
        const intVal = parseInt(str);
        if (!isNaN(intVal)) {
            return intVal;
        }
    }

    if(str.includes(",") && str.startsWith("(") && str.endsWith(")")){
        let split = (str.slice(1, -1)).split(",")
        let vals = []
        split.forEach(val=>{
            vals.push(parseFloat(val))
        })
        return vals
    }

    const floatVal = parseFloat(str);
    if (!isNaN(floatVal) && numValid) {
        return floatVal;
    }

    const lowerCaseString = str.toLowerCase();
    if (lowerCaseString === 'true') {
        return true;
    } else if (lowerCaseString === 'false') {
        return false;
    }

    return str;
}

function main(stream, completed) {
    let rl = readline.createInterface({
        input: stream,
        terminal: false,
        crlfDelay: Infinity
    })

    let converted = {}
    let cur = ""
    let mode = {
        name: "IDLE",
        data: {}
    }
    let classRecord = {
        "_parent": "__GAME__"
    }

    function getCur() {
        if (!cur) {
            return converted;
        }
        return dot.pick(cur, converted)
    }

    function addCur(part) {
        if (!cur) {
            cur = part
            return cur
        }
        cur = `${cur}.${part}`
    }

    function delCur() {
        const parts = cur.split('.');
        if (parts.length <= 1) {
            return "";
        } else {
            parts.pop();
            let join = parts.join('.');
            cur = join;
            return cur;
        }
    }

    rl.on('line', line => {
        if(!line){
            return
        }

        if (line.includes("{")) {
            if (mode.name != "DECLARING") {
                throw new SyntaxError("Inappropriate opening bracket")
            }
            mode.name = "IDLE"
        }

        if (line.includes("}")) {
            if (mode.name != "IDLE") {
                throw new SyntaxError("Inappropriate closing bracket")
            }

            if (cur["_parent"] == "__GAME__") {
                rl.close()
                return
            }

            delCur()
            //cur = cur["_parent"] // FIX
        }

        if (line.includes("=")) {
            if (mode.name != "IDLE") {
                throw new SyntaxError("Unexpected value declaration")
            }

            let split = line.split("=")
            let key = split[0].trim()
            let val = convertString(split[1].trim())

            if(key == "seed" && cur == "_class_VTMapCustom_0"){
                val = split[1].trim()
            }

            //console.log(getCur())
            getCur()[key] = val
            //cur[key] = val // FIX
        }

        if (!line.includes("=") && !line.includes("}") && !line.includes("{")) {
            if (mode.name != "IDLE") {
                throw new SyntaxError("Unexpected class declaration")
            }

            let className = line.trim()
            mode.name = "DECLARING"
            mode.data = {
                className: className
            }

            if (!classRecord[className]) {
                classRecord[className] = 0
            }
            let classAmount = classRecord[className]++
            let format = `_class_${className}_${classAmount}`
            //let parent = cur

            //console.log(`NEW CLASS: ${className}`)

            // FIX
            //cur[format] = {}
            //cur = cur[format]
            ////cur["_parent"] = parent
            getCur()[format] = {}
            addCur(format)
        }
    })

    rl.on('close', () => {
        completed(converted)
    })
    
    return converted
}

module.exports = main
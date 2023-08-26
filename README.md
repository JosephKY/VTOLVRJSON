# VTOLVR JSON Utility
The VTOL VR JSON Utility is a tool that you can use to convert VTOL VR files to and from JSON.

The utility currently supports the following VTOL VR files:
- Maps (.VTM)
- Scenarios (.VTS)
- Campaigns (.VTC)
- Liveries (.VTL)

# Usage
## Command Line
You can either do `node index.js` or execute the appropriate binary version for your operating system `./VTOLVR-JSON-Utility.exe`

Specify the file you want to convert with the `--input` or `-i` parameter. 
- Example: `node index.js -i C:/path/to/file.vts`

You don't need to specify an output. The converted file with automatically be saved to `./conversions/fromJSON` or `./conversions/toJSON` depending on your usage. However, if you really want to specify the output, you can do so with `--output` or `-o`. 
- Example: `node index.js -i C:/path/to/file.vts -o C:/path/to/directory/`

## GUI
WIP. Check back later

## Web CDN
WIP. Check back later

# FAQ
Q: When converting from JSON to a VTOL file, do I need to specify what kind of file (campaign, scenario, livery, map) it is?

A: Nope! The utility will automatically detect the VTOL file type that you need.

Q: Will the utility crash if any of the automatic output directories are unavailable?

A: No. The utility will simply create the directories if it cannot find them.

Q: How do I report a bug?

A: There are a few options if you discover a bug. You can [submit an issue](https://github.com/JosephKY/VTOLVRJSON/issues), or you can fix it yourself and create a pull request. If you submit an issue, please be clear and descriptive; describe the bug, the environment it occurred in (e.g.: was on Linux Ubuntu), the steps to reproduce the bug, and any other details that may be relevant.

Q: What if I have an idea that would make the utility better?

A: Please [submit an issue](https://github.com/JosephKY/VTOLVRJSON/issues), just be sure to choose "enhancement" for the Labels option. Feedback and suggestions are always appreciated, so if you have something to say, please let me know!



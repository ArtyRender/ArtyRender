# ArtyRender
Multithreaded render system for Adobe After Effects. ArtRender script squeezes out all the power from your system.

## System Requirenment:
Still Windows only.

## Installation
Copy  ArtyRender.jsx in Adobe After Effects ScriptUI folder. For example C:\Program Files\Adobe\ {Adobe After Effects folder}  \Support Files\Scripts\ScriptUI Panels

script window:

![script window](https://raw.githubusercontent.com/ArtyRender/ArtyRender/master/images/interface.jpg)


## Usage
1. Run from menu Window -> ArtyRender.jsx
2. Add to Render Queue compostiton as usual
3. Set "Number of threads" it should not be more than number of CPU cores in yours system
4. Checkbox "reRender" make it rerender range of frames that set in Render Settings. __Note:__ At first all the range will be erased only than rerender.
5. If checkbox "Multi-Machine Settings" is set for all elements in Render  Queue will be used preset "Multi-Machine  Settings". If you want to use your own preset you should uncheck this checkbox and apply yours preset for elements in Render Queue. __Note:__ in yours preset you should set checkbox "Skip  existing  files  (allow  multi-machine  rendering)" checked. In other way each AE thread will rerender same frames.

Render Settings:

![Render Settings](https://raw.githubusercontent.com/ArtyRender/ArtyRender/master/images/settings.jpg)

## Performance:
Number of threads depends on your system RAM. Each thread can use more than 3Gb RAM depends on project.
In usual projects it is about 2GB RAM per thread.
Script run threads with max priority. Lots of threads can freeze the system.


# WindowsInWebBrowser
A Windowing framework in JS

# Usage of banner buttons :

- banner : drag the banner to move the window
- \+ / # : free / stick-to-grid mode
- S : resize window (click the button, move mouse, click anywhere to stop)
- X : close window, and stop associated threads
You can click anywhere in the window to bring it to front.

# Coding with windows.js :
## one-line import :
```
<script src="windows.js"></script>
```

## WindowSystem class :
```
var WindowSystemHandler = new WindowSystem(/*DOM element where the windows will be placed*/);
```
```
var ws = new WindowSystem(windowsZone);
```

## popup function :
```
var windowHandler = ws.popup(sizeX, sizeY, title, css, mode [px || %]);
```

## Examples :
```
b = ws.popup(300, 0, "Example 1 : dimensions specified", "background: grey;", "px");
c = ws.popup(430, 150, "Example 2 : transparent background and assigned setInterval", "color: #4d3f6d;", "px");
d = ws.popup(300, 300, "Example 3 : dimensions specified", "background: green;", "px");
e = ws.popup(600, 300, "manual", "background: white;", "px");
```

## Assigned setInterval :

If you declare a setInterval() like that, it will be terminated as the user quit the window.
```
windowHandler.thrloop = setInterval(/*function*/, /*time between function calls*/);
```
```
b.thrloop = setInterval(function(){ b.content.innerText += "INTERVAL-EFFECT !\n"; }, 1000);
```

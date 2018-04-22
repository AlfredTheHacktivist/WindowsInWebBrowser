// windows.js : windowing system made by AlfredTH
class Window {
	constructor(parentSystem, x, y, sx, sy, title, style="", mode="%"){
		this.style = style;
		this.title = title;
		this.x = x;
		this.y = y;
		this.z = parentSystem.windows.length;
		this.parentSystem = parentSystem;
		this.mode = mode;
		this.exactPosition = false;
		this.resizing = false;
		this.offsetX=0;
		this.offsetY=0;
		this.sizeX = sx;
		this.sizeY = sy;
		this.borderX = 0;
		this.borderY = 0;
		this.thrloop = false;
		this.diefunc = false;
		
		this.divElement = document.createElement("div");
		this.divElement.id = parentSystem.windows.length;
		this.divElement.onmousedown = function(e){ if(!parentSystem.currentlyResizingWindow){ parentSystem.pushToFront(this.id, false); } }
		this.parentSystem.WindowsZone.append(this.divElement);
		this.addBanner(this.parentSystem);
		
		this.content = document.createElement("div");
		this.divElement.append(this.content);
		
		this.borderUpdate();
		
		this.update();
		
		this.parentSystem.windows.unshift(this);
	}
	
	baseStyleString(width, height){
		return "position: absolute; z-index: "+this.z.toString()+"; top: "+this.y.toString()+this.mode+"; left: "+this.x.toString()+this.mode+"; box-shadow: 0px 0px 8px #000; width: "+width.toString()+"; /*min-width: 80;*/ height: "+height.toString()+"; /*min-height: 40;*/";
	}
	
	update(mr, mo){
		if (typeof mr != "undefined"){
			var w = mr[0].target.parentElement;
			var win = w.parentElement.parentSystem.windows[w.id];
		} else {
			var win = this;
		}
		win.borderUpdate();
		var width = parseInt(typeof win.sizeX == "number" ? win.sizeX:win.content.offsetWidth) - win.borderX;
		var height = parseInt(typeof win.sizeY == "number" ? win.sizeY:win.content.offsetHeight) - win.borderY + 20;
		win.divElement.style.cssText = win.baseStyleString(width, height);
		win.content.style.cssText = win.style;
		win.content.style.overflow = "auto";
		win.content.style.width = win.sizeX;//(typeof win.sizeX == "number" ? width:"");
		win.content.style.height = win.sizeY;//(typeof win.sizeY == "number" ? (height - 20):"");
		//win.content.style.minWidth = "80";
		//win.content.style.minHeight = "20";
		win.divElement.getElementsByTagName('button')[0].innerText = win.title;
	}
	
	borderUpdate(){
		this.borderX = this.x + parseInt(typeof this.sizeX == "number" ? this.sizeX:this.content.offsetWidth) - this.parentSystem.WindowsZone.clientWidth;
		if (this.borderX<0){ this.borderX = 0; }
		this.borderY = this.y + parseInt(typeof this.sizeY == "number" ? this.sizeY:this.content.offsetHeight) - this.parentSystem.WindowsZone.clientHeight + 20;
		if (this.borderY<0){ this.borderY = 0; }
	}
	
	addBanner(parentSystem){
		var banner = document.createElement("button");
		banner.style.backgroundColor = "white";
		banner.className = "bannerBtn";
		banner.onmousedown = function(e){
			var parent = parentSystem.windows[this.parentElement.id];
			parent.offsetX = e.clientX - parent.x;
			parent.offsetY = e.clientY - parent.y;
			parentSystem.pushToFront(this.parentElement.id);
		}
		banner.addEventListener("touchstart", function(e){
			var parent = parentSystem.windows[this.parentElement.id];
			parent.offsetX = e.changedTouches[0].pageX - parent.x;
			parent.offsetY = e.changedTouches[0].pageY - parent.y;
			parentSystem.pushToFront(this.parentElement.id);
		}, false);
		banner.style.width = "calc(100% - 60px)";
		banner.style.minWidth = "20px";
		banner.style.display = "flex";
		banner.style.float = "left";
		banner.innerText = this.title;
		this.divElement.append(banner);
		
		var btn = document.createElement("button");
		btn.className = "bannerBtn bannerBtn2";
		btn.onclick = function(){
			var parent = parentSystem.windows[this.parentElement.id];
			parent.exactPosition = !parent.exactPosition;
			if (parent.exactPosition){
				this.innerText = "#";
			} else {
				this.innerText = "+"
			}
		}
		btn.innerText = "+";
		btn.style.float = "left";
		this.divElement.append(btn);
		
		var btn = document.createElement("button");
		btn.className = "bannerBtn bannerBtn2";
		btn.onclick = function(){ parentSystem.currentlyResizingWindow = this.parentElement.id; }
		btn.innerText = "S";
		btn.style.float = "left";
		this.divElement.append(btn);
		
		var btn = document.createElement("button");
		btn.className = "bannerBtn bannerBtn2";
		btn.onclick = function(){
			var parentSystem = this.parentElement.parentElement.parentSystem;
			var loopid = parentSystem.windows[this.parentElement.id].thrloop;
			var diefunc = parentSystem.windows[this.parentElement.id].diefunc;
			if (loopid){
				clearInterval(loopid);
			}
			if (diefunc){
				diefunc();
			}
			this.parentElement.remove();
			parentSystem.windows.splice(this.parentElement.id, 1);
			parentSystem.organizeWindows();
		}
		btn.innerText = "X";
		this.divElement.append(btn);
	}
}

class WindowSystem {
	constructor (wzone){
		this.windows = [];
		this.currentlyMovingWindow = false;
		this.currentlyResizingWindow = false;
		this.WindowsZone = wzone;
		this.WindowsZone.parentSystem = this;
		this.WindowsZone.className += "WindowSystem";
		this.WindowsZone.onmouseup = this.mouseUP;
		this.WindowsZone.onmouseenter = this.mouseUP;
		this.WindowsZone.onmousemove = this.moveWindow;
		this.WindowsZone.addEventListener("touchend", this.mouseUP, false);
		this.WindowsZone.addEventListener("touchleave", this.mouseUP, false);
		this.WindowsZone.addEventListener("touchmove", this.moveWindowTouch, false);
	}

	popup(sx, sy, title, style="", mode="%"){
		var px = 20 + (15 * this.windows.length % 100);
		var w = new Window(this, px, px, sx, sy, title, style, mode);
		this.organizeWindows();
		var observer = new MutationObserver(w.update);
		var config = { attributes: false, subtree: true, childList: true };
		observer.observe(w.content, config);
		w.update();
		return w;
	}

	organizeWindows(){
		for (var i=0;i<this.windows.length;i++){
			this.windows[i].divElement.id = i.toString();
			this.windows[i].z = (this.windows.length-i).toString();
			this.windows[i].divElement.style.zIndex = this.windows[i].z;
		}
	}

	pushToFront(index, move=true){
		var w = this.windows[index];
		this.windows.splice(index, 1);
		this.windows.unshift(w);
		this.organizeWindows();
		if(move){ this.currentlyMovingWindow = w; }
	}

	mouseUP(){
		var parentSystem = this.parentSystem;
		parentSystem.currentlyMovingWindow = false;
		parentSystem.currentlyResizingWindow = false;
	}

	moveWindow(e){
		var parentSystem = this.parentSystem;
		if (parentSystem.currentlyMovingWindow){
			e.preventDefault();
			var parent = parentSystem.currentlyMovingWindow;
			var x = e.clientX-parent.offsetX;
			var y = e.clientY-parent.offsetY;
			if (parent.exactPosition){
				x = parseInt(x/10)*10;
				y = parseInt(y/10)*10;
			}
			parent.x = (x >= 0 ? x:0);
			parent.y = (y >= 0 ? y:0);
			parent.borderUpdate();
			parent.update();
		}
		if (parentSystem.currentlyResizingWindow){
			e.preventDefault();
			var parent = parentSystem.windows[parentSystem.currentlyResizingWindow];
			parent.sizeX = e.clientX - parent.x - parseInt(parentSystem.WindowsZone.offsetLeft);
			parent.sizeY = e.clientY - parent.y - 20 - parseInt(parentSystem.WindowsZone.offsetTop);
			if (parent.exactPosition){
				parent.sizeX = parseInt(parent.sizeX/10)*10;
				parent.sizeY = parseInt(parent.sizeY/10)*10;
			}
			parent.borderUpdate();
			parent.update();
		}
	}

	moveWindowTouch(e){
		var parentSystem = this.parentSystem;
		if (parentSystem.currentlyMovingWindow){
			var parent = parentSystem.currentlyMovingWindow;
			var x = e.changedTouches[0].pageX-parent.offsetX;
			var y = e.changedTouches[0].pageY-parent.offsetY;
			if (parent.exactPosition){
				x = parseInt(x/10)*10;
				y = parseInt(y/10)*10;
			}
			parent.x = (x >= 0 ? x:0);
			parent.y = (y >= 0 ? y:0);
			parent.borderUpdate();
			parent.update();
		}
		if (parentSystem.currentlyResizingWindow){
			var parent = parentSystem.windows[parentSystem.currentlyResizingWindow];
			parent.sizeX = e.changedTouches[0].pageX - parent.x - parseInt(parentSystem.WindowsZone.offsetLeft);
			parent.sizeY = e.changedTouches[0].pageY - parent.y - 20 - parseInt(parentSystem.WindowsZone.offsetTop);
			if (parent.exactPosition){
				parent.sizeX = parseInt(parent.sizeX/10)*10;
				parent.sizeY = parseInt(parent.sizeY/10)*10;
			}
			parent.borderUpdate();
			parent.update();
		}
	}
}

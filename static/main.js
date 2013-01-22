var ctx, c;
var pointCount;
var points = [];
var xroot;
var yroot;
var vectorSize;
var vecfield;
var potfield;
var timer;


var objects = [
    {
        m: 100,
        r: 10,
        x: -100,
        y: -125,
        vx: 0,
        vy: 0,
    },
    {
        m: 475,
        r: 20,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
    },
    {
        m: 200,
        r: 10,
        x: -50,
        y: 75,
        vx: 0,
        vy: 0,
    },
    {
        m: 150,
        r: 10,
        x: 100,
        y: -150,
        vx: 0,
        vy: 0,
    },
    {
        m: 75,
        r: 10,
        x: 200,
        y: 200,
        vx: 0,
        vy: 0,
    },
    {
        m: 75,
        r: 10,
        x: 150,
        y: -200,
        vx: 0,
        vy: 0,
    },
];


$(document).ready(function(){
    c = document.getElementById("c");
    xroot=c.width/2;
    yroot=c.width/2;
    ctx = c.getContext("2d");
    $('#start').click(init);
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,c.width,c.height);
    drawBackground();
    $('#c').click(function(){
        window.clearInterval(timer);
    });
});

function init(){
    window.clearInterval(timer);
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,c.width,c.height);
    vecfield=$('#drawVecs').attr('checked')=='checked';
    potfield=$('#drawPoten').attr('checked')=='checked';
    vectorSize=parseInt($('#vecSize').val(),10);
    pointCount=parseInt($('#particles').val(),10);
    
    points=[];
    doneCount=0;
    for(var i=0; i < pointCount; i++){
        mass=-50+Math.random()*100;
        xpos=-300+Math.random()*600;
        ypos=-300+Math.random()*600;
        points.push({
            m: mass,
            active:true,
            x: xpos,
            y: ypos,
            vx: 0,
            vy: 0,
        });
        doneCount++;
    }
    for(var i=0; i < points.length; i++){
        var x1=points[i].x;
        var y1=points[i].y;
        for(var j=0; j < objects.length; j++){
            var x2=objects[j].x;
            var y2=objects[j].y;
            if(distance(x1,y1,x2,y2)<objects[j].r){
                points[i].active=false;
                doneCount--;
            }
        }
    }
    
    
    drawBackground(true);
    ctx.strokeStyle="rgba(255,175,0,1.0)";
    initlen=points.length*1;
    timer=window.setInterval(updateObjects,50);
}

function randomColour(){
    return 'rgb('+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+')';
}

function updateObjects(){
    ctx.beginPath();
    
	
    if(doneCount==0){
        window.clearInterval(timer);
        init();
        return;
    }
    var initpts=points.length;
    for(var i=0; i < points.length; i++){
        
        if(!points[i].active) continue;
        
        var fx=0;
        var fy=0;
        
        var m1=points[i].m;
        var x1=points[i].x;
        var y1=points[i].y;
        if(Math.abs(x1)>xroot+100 || Math.abs(y1)>yroot+100){
            points[i].active=false;
            doneCount--;
            continue;
        }
        ctx.moveTo(x1+xroot,y1+yroot);
        
        for(var j=0; j < objects.length; j++){
            var m2=objects[j].m;
            var x2=objects[j].x;
            var y2=objects[j].y;
            var fvec=force(m1,m2,x1,y1,x2,y2);
            fx+=fvec.x;
            fy+=fvec.y;
            if(distance(x1,y1,x2,y2)<objects[j].r){
                points[i].active=false;
                doneCount--;
            }
        }
        var dvx=(fx/m1);
        var dvy=(fy/m1);
        points[i].vx+=dvx;
        points[i].vy+=dvy;
        points[i].x-=points[i].vx;
        points[i].y-=points[i].vy;
        if(points[i].active){
            ctx.lineTo(points[i].x+xroot,points[i].y+yroot);
        }
    }
    ctx.stroke();
}

function drawBackground(vec){
    
    if(vec){
        for(var x1=-xroot; x1 < xroot; x1+=vectorSize){
            for(var y1=-yroot; y1 < yroot; y1+=vectorSize){
                
                var fx=0;
                var fy=0;
            
        
                for(var j=0; j < objects.length; j++){
                    var m2=objects[j].m;
                    var x2=objects[j].x;
                    var y2=objects[j].y;
                    var fvec=force(1,m2,x1,y1,x2,y2);
                    fx+=fvec.x;
                    fy+=fvec.y;
                }
                angi=angle(0,0,fx,fy);
            
                if(vecfield){
                    ctx.beginPath();
                    ctx.moveTo(xroot+x1,yroot+y1);
                    ctx.lineTo(xroot+x1+vectorSize*Math.cos(angi),yroot+y1+vectorSize*Math.sin(angi));
                    ctx.strokeStyle = "rgba(255,255,255,0.3)";
                    ctx.stroke();
                }
                if(potfield){
                    ctx.fillStyle = "rgba(0,100,0,"+Math.min(Math.sqrt(fx*fx+fy*fy)/2,1)+")";
                    ctx.fillRect(xroot+x1,yroot+y1,vectorSize,vectorSize);
                }
            }
        }
    }
    ctx.fillStyle = "white";
    for(var i=0; i < objects.length; i++){
        
        circle(objects[i].x+xroot,objects[i].y+yroot,objects[i].r);
    }
    /*
    for(var i=0; i < points.length; i++){
        ctx.fillStyle = points[i].c;//"orange";
        if(points[i].active) circle(points[i].x+xroot,points[i].y+yroot,1);
        
    }*/
}

function force(m1,m2,x1,y1,x2,y2){
    var consta = 5;
	var botm = Math.pow(distance(x1,y1,x2,y2), -2);
	var summ = consta*m1*m2*botm;
	var angi=angle(x1,y1,x2,y2);
	var xco=summ*Math.cos(angi);
	var yco=summ*Math.sin(angi);
	return Vec2(xco,yco);
}


function circle(x,y,r){
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI*2, true);
	ctx.closePath();
	ctx.fill();
}

function distance(x1,y1,x2,y2){
	return (Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2)));
}

function angle(x1,y1,x2,y2){
	//1 to 2
	var deltax=x1-x2; // + right - left
	var deltay=y1-y2; // + up - down
	var angg= rad2deg(Math.atan(deltay/deltax));
	if(deltax<0&&deltay>0) angg+=180;
	if(deltax<0&&deltay<0) angg+=180;
	if(deltax>0&&deltay<0) angg+=360;
	if(angg==0&&deltax<0) angg=180;
	return deg2rad(angg);
}

function rad2deg (angle) {
    return (angle/Math.PI) * 180;
}

function deg2rad (angle) {
    return (angle*Math.PI) / 180;
}

function Vec2(x,y){
    return {x:x,y:y};
}

function saveStuff(){
    var canvasData = document.getElementById('c').toDataURL("image/png");
    var ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onreadystatechange = function(){
                if(ajaxRequest.readyState == 4){
                    window.location = '/images/'+ajaxRequest.responseText+'.png';
                }
        };
    ajaxRequest.open("POST",'save.php',false);
    ajaxRequest.setRequestHeader('Content-Type', 'application/upload');
    ajaxRequest.send(canvasData);
    z = setInterval('drawShape(xpoint,ypoint)', 50);
}
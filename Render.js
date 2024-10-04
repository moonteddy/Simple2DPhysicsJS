

// Draw debug renderer
class Render{
	
	ctx;
	canvas;

	// debug draw options
	isDrawWorldbase = true;
	isDrawDebug = true;

	constructor(canvas){
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");

	}

	// render options...
	settings(isDrawWorldbase, isDrawDebug){
		this.isDrawWorldbase = isDrawWorldbase;
		this.isDrawDebug = isDrawDebug;
	}

	tick(deltaTime){
		// celar canvas every frame
		this.ctx.clearRect(0, 0, world.width, world.height);

		//this.drawWorldBase();
		this.drawAllBodies();
		//this.debugDraw();
		//this.drawDot(physics.A);
	}


	drawWorldBase(){
		if (false == this.isDrawWorldbase)
			return;

		// draw a border of world .
		this.drawPolygon(world.points, "gray");

		// draw a cross hair.
		this.drawLine(new Vector(0, physics.crosshairPosition.y), new Vector(world.width, physics.crosshairPosition.y), "gray");
		this.drawLine(new Vector(physics.crosshairPosition.x, 0), new Vector(physics.crosshairPosition.x, world.height), "gray");
	}

	drawAllBodies(){
		// draw an all bodies.
		for (var i = 0; i < world.bodyArr.length; i++) {

			var body = world.bodyArr[i];

			/*
			if (body.isCircle) {
				this.drawCircle(body.position, body.radius);
				this.drawDot(body.position);
			}else{
				this.drawPolygon(body.points);
				this.drawDot(body.position);
			}
			*/

			if (body.isImageLoaded) {
				var offset = add(body.position, body.imageOffset);
				this.drawImage(body.image, offset, dgreeToRadian(body.rotation));
			}


			// draw a bounding box area for debug darw
			//this.drawPolygon(body.getBoundingBox(), body.collisionBody.length == 0 ? "green" : "red");
		}
	}

	drawCircle(center, radius){
		this.ctx.strokeStyle = "gray";
		this.ctx.beginPath();
		this.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
		this.ctx.stroke();
	}

	drawPolygon(points, color = "gray", fill = false){
		if (points.length < 2)
			return;

		this.ctx.strokeStyle = color;

		this.ctx.beginPath();
	    this.ctx.moveTo(points[0].x, points[0].y);

	    for (var i = 1; i < points.length; i++) {
			this.ctx.lineTo(points[i].x, points[i].y);
		}

	    this.ctx.lineTo(points[0].x, points[0].y);

	    if (fill)
			this.ctx.fill();
    	else
			this.ctx.stroke();
	}

	drawDot(position, color = "red"){
		this.ctx.fillStyle = color;
		this.ctx.fillRect(position.x - 1, position.y - 1, 2, 2);
	}

	drawLine(start, end, color = "orange", thickness = 1){
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = thickness;
		this.ctx.beginPath();
    	this.ctx.moveTo(start.x, start.y);
    	this.ctx.lineTo(end.x, end.y);
    	this.ctx.stroke();
	}

	drawText(text, position, font = "16px serif"){
		this.ctx.font = font;
		this.ctx.fillText(text, position.x, position.y);
	}

	drawImage(img, pos, rot){
		this.ctx.save();
		this.ctx.translate(pos.x, pos.y);
		this.ctx.rotate(rot);
		this.ctx.drawImage(img, -img.width/2, -img.height/2);
		this.ctx.restore();
	}

	debugDraw(){
		if (false == this.isDrawDebug)
			return;

		// draw minkowski diff points
		for (var i = 0; i < physics.minkowskiDiffArr.length; i++) {
			this.drawDot(add(physics.minkowskiDiffArr[i], physics.crosshairPosition), "black");
		}

		// draw a convexHull
//		this.drawPolygon(physics.convexHullArr, "red"/*, isCollide*/);

		// darw a epa
		this.drawPolygon(physics.epaArr, "green"/*, isCollide*/);
		//for (var i = 0; i < epaArr.length; i++) {
		//	this.drawText(i, epaArr[i]);
		//}
		
		//this.drawText("count : " + epaArr.length , new Vector(500, 250));

		//this.drawLine(physics.testA, physics.crosshairPosition, "blue");

		this.drawLine(physics.dsitLineA, physics.dsitLineB, "blue");
		


		for (var i = 0; i < physics.hitPointsArr.length; i++)
		{
			this.drawCircle(physics.hitPointsArr[i], 5);
		}

		if (physics.hitLine.length > 0)
			this.drawLine(physics.hitLine[0], physics.hitLine[1]);



		// clear arr
		physics.minkowskiDiffArr = [];
		physics.convexHullArr = [];
		physics.epaArr = [];
		physics.hitPointsArr = [];
		physics.hitLine = [];
	}

}
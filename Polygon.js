
class Polygon extends Body{

	points = [];  //vertices


	constructor(position, vertextCount, size, mass = 1, bounciness = 0.5){
		super(position, mass, bounciness);
		super.isCircle = false;

		var angle = 360 / vertextCount;

		var firstPoint = add(position, scale(upVector(), size));
		this.points.push(firstPoint);

		for (var i = 1; i < vertextCount; i++) {
			var nextPoint = rotateAngleAxis(this.position, this.points[i - 1], angle);
			this.points.push(nextPoint);
		}
		
		this.centerOfMass();
	}

	setCustomPoint(coordinate){
		this.points.length = 0; // array clear
		for (var i = 0; i < coordinate.length; i++) {
			this.points.push(add(this.position, coordinate[i]));
		}
	}

	addPosition(movement){
		super.addPosition(movement);

		for (var i = 0; i < this.points.length; i++) {
			this.points[i] = add(this.points[i], movement);
		}
	}

	setPositon(position){
		//super.setPositon(position);

		let movement = sub(position, this.position);
		this.addPosition(movement);
	}

	updatePosition(){
		if (this.physicsEnable == false)
			return;

		this.centerOfMass();

		for (var i = 0; i < this.points.length; i++) {
			this.points[i] = add(this.points[i], this.velocity);
		}
	}


	addRotation(addRoation){
		super.addRotation(addRoation);

		for (var i = 0; i < this.points.length; i++) {
			this.points[i] = rotateAngleAxis(this.position, this.points[i], addRoation);
		}

	}

	updateRotation(){
		if (this.physicsEnable == false)
			return;

		super.updateRotation();

		this.addRotation(this.torque);
	}


	isInside(point){
		var inside = false;

	    for (var i = 0, j = this.points.length - 1; i < this.points.length; j = i++) {
	        var xi = this.points[i].x, yi = this.points[i].y;
	        var xj = this.points[j].x, yj = this.points[j].y;
	        
	        var intersect = ((yi > point.y) != (yj > point.y))
	            && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);

	        if (intersect) inside = !inside;
	    }
	    
	    return inside;
	}

	centerOfMass(){
		var count = this.points.length;

		// triangle center of mass
		if (3 == count) {
			this.position = centerOfTriangle(this.points);
		}else if (4 == count) {
			var A_points = [this.points[0], this.points[1], this.points[2]];
			var B_points = [this.points[2], this.points[3], this.points[0]];

			var Aposition = centerOfTriangle(A_points);
			var Bposition = centerOfTriangle(B_points);

			var A_Area = triangleArea(A_points);
			var B_Area = triangleArea(B_points);

			var ratio = B_Area / (A_Area + B_Area);
			this.position = center(Aposition, Bposition, ratio);
		}
		else if (5 == count){
			var A_points = [this.points[0], this.points[1], this.points[2]];
			var B_points = [this.points[0], this.points[2], this.points[3]];
			var C_points = [this.points[0], this.points[3], this.points[4]];

			var Aposition = centerOfTriangle(A_points);
			var Bposition = centerOfTriangle(B_points);
			var Cposition = centerOfTriangle(C_points);

			this.position = centerOfTriangle([Aposition, Bposition, Cposition]);
		}
		// Todo : count 6 ~ 아오 귀찮어

	}


	setBoundingBox(){
		var arrX = [];
		var arrY = [];

		for (var i = 0; i < this.points.length; i++) {
			arrX.push(this.points[i].x);
			arrY.push(this.points[i].y);
		}

		this.boundingBox.minX = Math.min(...arrX);
		this.boundingBox.minY = Math.min(...arrY);
		this.boundingBox.maxX = Math.max(...arrX);
		this.boundingBox.maxY = Math.max(...arrY);
	}
	

}
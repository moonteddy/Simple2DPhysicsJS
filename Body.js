
class Body{
	
	name = "";
	mass = 1;
	bounciness = 0.5;
	isCircle = false;
	queryOnly = false;

	intersectBody = [];
	boundingBox = new BoundingBox();

	// force
	velocity = new Vector(0, 0);
	torque = 0;	// rotation inertia

	// transform
	position = new Vector(0, 0);
	rotation = 0;

	image;
	isImageLoaded = false;
	imageOffset = new Vector(0, 0);

	constructor(position, mass = 1, bounciness = 0.5){
		this.position = position;
		this.mass = mass;
		this.bounciness = bounciness;
	}

	addForce(force){
		this.velocity = force;
	}

	addTorque(force){
		this.torque = force;
	}

	applyGrivity(deltaTime){
		var x = this.velocity.x + deltaTime * world.gravity.x * this.mass;
		var y = this.velocity.y + deltaTime * world.gravity.y * this.mass;

		this.addForce(new Vector(x, y));
	}

	applyVelocityResist(deltaTime){
		this.velocity = scale(this.velocity, world.airDensity);
	}

	addPosition(movement){
		this.position = add(this.position, movement);
	}

	setPositon(position){
		this.position = position;
	}

	updatePosition(){
	}

	applyRotationResist(deltaTime){
		if (this.torque < 0) {
			this.torque += deltaTime * this.mass;
		}else if (0 < this.torque) {
			this.torque -= deltaTime * this.mass;
		}else {
			this.torque = 0;
		}
	}

	addRotation(addRoation){
		this.rotation += addRoation;

		if (this.rotation < -360 || 360 < this.rotation) {
			this.rotation %= 360;
		}

		this.imageOffset = rotateAngleAxis(zeroVector(), this.imageOffset, addRoation);
	}

	setRotation(rotation){
		if (rotation < -360 || 360 < rotation) {
			this.rotation = rotation % 360
		}
		else{
			this.rotation = rotation;	
		}
	}

	updateRotation(){
	}

	isInside(point){
	}

	getBoundingBox(){ // AABB
		var point0 = new Vector(this.boundingBox.minX, this.boundingBox.minY);
		var point1 = new Vector(this.boundingBox.maxX, this.boundingBox.minY);
		var point2 = new Vector(this.boundingBox.maxX, this.boundingBox.maxY);
		var point3 = new Vector(this.boundingBox.minX, this.boundingBox.maxY);

		return [point0, point1, point2, point3];
	}

	setBoundingBox(){
	}

	onBoundingBoxEnter(body){
		this.intersectBody.push(body);
	}

	onBoundingBoxExit(body){
		removeFromArray(this.intersectBody, body);
	}

	setImage(imageSrc){
		const image = new Image();
		image.src = imageSrc;

		this.image = image;
		this.image.addEventListener('load', () => { this.isImageLoaded = true; }, false);
	}

	setImageOffset(offset){
		this.imageOffset = offset;
	}

	setCustomPoint(coordinate){
	}

}

class Circle extends Body{

	radius = 0;

	constructor(position, radius, mass = 1, bounciness = 0.5){
		super(position, mass, bounciness);
		super.isCircle = true;
		this.radius = radius;
	}

	updatePosition(){
		if (this.physicsEnable == false)
			return;

		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}

	updateRotation(){
		if (this.physicsEnable == false)
			return;

		super.updateRotation();
		super.addRotation(this.torque);
	}



	isInside(point){
		return this.radius > distance(point, this.position);
	}

/*
	clampWorld(){
		if(world.height - this.radius < this.position.y &&  0 < this.velocity.y ){
			var vel_y = this.velocity.y * -this.bounciness;
			this.addForce(new Vector(this.velocity.x, vel_y));
		}
		else if(this.radius > this.position.x && 0 > this.velocity.x){
			var vel_x = this.velocity.x * -this.bounciness;
			this.addForce(new Vector(vel_x, this.velocity.y));
		}
		else if(world.width - this.radius < this.position.x && 0 < this.velocity.x){
			var vel_x = this.velocity.x * -this.bounciness;
			this.addForce(new Vector(vel_x, this.velocity.y));
		}
		else if (this.radius > this.position.y && 0 > this.velocity.y) {
			var vel_y = this.velocity.y * -this.bounciness;
			this.addForce(new Vector(this.velocity.x, vel_y));
		}
	}
*/
	setBoundingBox(){
		this.boundingBox.minX = this.position.x - this.radius;
		this.boundingBox.minY = this.position.y - this.radius;
		this.boundingBox.maxX = this.position.x + this.radius;
		this.boundingBox.maxY = this.position.y + this.radius;
	}

}
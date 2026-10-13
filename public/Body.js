
import { Vector, BoundingBox } from './Vector.js';
import { add, scale, rotateAngleAxis, zeroVector, removeFromArray } from './Utils.js';

export class Body {
	name = "";
	mass = 1;
	bounciness = 0.5;
	isCircle = false;
	queryOnly = false;
	physicsEnable = true;
	collisionDelay = 0;	// seconds left ignoring other dynamic bodies (still hits static ones)

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

	constructor(position = new Vector(0, 0), mass = 1, bounciness = 0.5) {
		this.position = position;
		this.mass = mass;
		this.bounciness = bounciness;
	}

	addForce(force) {
		this.velocity = force;
	}

	addTorque(force) {
		this.torque = force;
	}

	applyGravity(deltaTime) {
		if (typeof window !== 'undefined' && window.world) {
			var gravityScale = window.world.gravityScale;
			var x = this.velocity.x + deltaTime * window.world.gravity.x * gravityScale * this.mass;
			var y = this.velocity.y + deltaTime * window.world.gravity.y * gravityScale * this.mass;
			this.addForce(new Vector(x, y));
		}
	}

	// Backward compatibility typo alias
	applyGrivity(deltaTime) {
		this.applyGravity(deltaTime);
	}

	applyVelocityResist(deltaTime) {
		if (typeof window !== 'undefined' && window.world) {
			this.velocity = scale(this.velocity, window.world.airDensity);
		}
	}

	addPosition(movement) {
		this.position = add(this.position, movement);
	}

	setPosition(position) {
		this.position = position;
	}

	// Backward compatibility typo alias
	setPositon(position) {
		this.setPosition(position);
	}

	updatePosition() {
	}

	applyRotationResist(deltaTime) {
		if (this.torque < 0) {
			this.torque += deltaTime * this.mass;
		} else if (0 < this.torque) {
			this.torque -= deltaTime * this.mass;
		} else {
			this.torque = 0;
		}
	}

	addRotation(addRotation) {
		this.rotation += addRotation;

		if (this.rotation < -360 || 360 < this.rotation) {
			this.rotation %= 360;
		}

		this.imageOffset = rotateAngleAxis(zeroVector(), this.imageOffset, addRotation);
	}

	setRotation(rotation) {
		if (rotation < -360 || 360 < rotation) {
			this.rotation = rotation % 360;
		} else {
			this.rotation = rotation;	
		}
	}

	updateRotation() {
	}

	isInside(point) {
		return false;
	}

	getBoundingBox() { // AABB
		var point0 = new Vector(this.boundingBox.minX, this.boundingBox.minY);
		var point1 = new Vector(this.boundingBox.maxX, this.boundingBox.minY);
		var point2 = new Vector(this.boundingBox.maxX, this.boundingBox.maxY);
		var point3 = new Vector(this.boundingBox.minX, this.boundingBox.maxY);

		return [point0, point1, point2, point3];
	}

	setBoundingBox() {
	}

	onBoundingBoxEnter(body) {
		this.intersectBody.push(body);
	}

	onBoundingBoxExit(body) {
		removeFromArray(this.intersectBody, body);
	}

	setImage(imageOrSrc) {
		if (typeof imageOrSrc === 'string') {
			const image = new Image();
			image.src = imageOrSrc;
			this.image = image;
			this.image.addEventListener('load', () => { this.isImageLoaded = true; }, { once: true });
			if (image.complete) {
				this.isImageLoaded = true;
			}
		} else if (imageOrSrc instanceof HTMLImageElement) {
			this.image = imageOrSrc;
			this.isImageLoaded = imageOrSrc.complete;
			if (!this.isImageLoaded) {
				imageOrSrc.addEventListener('load', () => { this.isImageLoaded = true; }, { once: true });
			}
		}
	}

	setImageOffset(offset) {
		this.imageOffset = offset;
	}

	setCustomPoint(coordinate) {
	}
}
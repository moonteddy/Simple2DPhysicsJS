
import { Body } from './Body.js';
import { distance } from './Utils.js';

export class Circle extends Body {
	radius = 0;

	constructor(position, radius, mass = 1, bounciness = 0.5) {
		super(position, mass, bounciness);
		this.isCircle = true;
		this.radius = radius;
	}

	updatePosition() {
		if (this.physicsEnable === false)
			return;

		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}

	updateRotation() {
		if (this.physicsEnable === false)
			return;

		super.updateRotation();
		super.addRotation(this.torque);
	}

	isInside(point) {
		return this.radius > distance(point, this.position);
	}

	setBoundingBox() {
		this.boundingBox.minX = this.position.x - this.radius;
		this.boundingBox.minY = this.position.y - this.radius;
		this.boundingBox.maxX = this.position.x + this.radius;
		this.boundingBox.maxY = this.position.y + this.radius;
	}
}
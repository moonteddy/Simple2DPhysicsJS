
// 2D
export class Vector {
	x = 0;
	y = 0;

	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	set(x, y) {
		this.x = x;
		this.y = y;
		return this;
	}

	copy(v) {
		this.x = v.x;
		this.y = v.y;
		return this;
	}

	clone() {
		return new Vector(this.x, this.y);
	}

	addSelf(v) {
		this.x += v.x;
		this.y += v.y;
		return this;
	}

	subSelf(v) {
		this.x -= v.x;
		this.y -= v.y;
		return this;
	}

	scaleSelf(s) {
		this.x *= s;
		this.y *= s;
		return this;
	}

	getLength() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	normalize() {
		const len = this.getLength();
		if (len > 0) {
			this.x /= len;
			this.y /= len;
		}
		return this;
	}

	invert() {
		this.x *= -1;
		this.y *= -1;
		return this;
	}
}

// 3D 
export class Vector3 {
	x = 0;
	y = 0;
	z = 0;

	constructor(x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}

export class Edge {
	u = new Vector();
	v = new Vector();

	constructor(u, v) {
		this.u = u;
		this.v = v;
	}

	getLength() {
		const dx = this.u.x - this.v.x;
		const dy = this.u.y - this.v.y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	normalize() {
		const dx = this.u.x - this.v.x;
		const dy = this.u.y - this.v.y;
		const len = Math.sqrt(dx * dx + dy * dy);
		return len > 0 ? new Vector(dx / len, dy / len) : new Vector();
	}
}

export class BoundingBox {
	minX = 0;
	minY = 0;
	maxX = 0;
	maxY = 0;

	constructor(minX = 0, minY = 0, maxX = 0, maxY = 0) {
		this.minX = minX;
		this.minY = minY;
		this.maxX = maxX;
		this.maxY = maxY;
	}
}
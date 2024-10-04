
// 2D
class Vector{
	
	x = 0;
	y = 0;

	constructor(x = 0, y = 0){
		this.x = x;
		this.y = y;
	}

	getLength(){
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	normalize(){
		const len = this.getLength();
		this.x /= len;
		this.y /= len;

		return this;
	}

	invert(){
		this.x *= -1;
		this.y *= -1;

		return this;
	}

}

// 3D 
class Vector3{
	x = 0;
	y = 0;
	z = 0;

	constructor(x = 0, y = 0, z = 0){
		this.x = x;
		this.y = y;
		this.z = z;
	}
}


class Edge{

	u = new Vector();
	v = new Vector();

	constructor(u ,v){
		this.u = u;
		this.v = v;
	}

	getLength(){
		return distance(this.u, this.v);
	}

	normalize(){
		return normal(sub(this.u, this.v));
	}

}


class BoundingBox{
	
	minX;
	minY;
	maxX;
	maxY;

	constructor(){
	}
}
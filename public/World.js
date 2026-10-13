
import { Vector } from './Vector.js';
import { removeFromArray } from './Utils.js';
import { Polygon } from './Polygon.js';

export class World {
	gravity = new Vector();
	gravityScale = 1;		// multiplier on gravity, tunes how fast letters fall
	airDensity = 0.99;		// Resist of velocity (velocity *= airDensity per tick)
	width = 0;
	height = 0;

	bodyArr = [];
	points = [];  	// world clamp vertices
	wallBodies = [];
	wallOptions = null;	// options of the last makeWorldEdges call, reused on resize

	constructor(gravity, width = window.innerWidth, height = window.innerHeight, gravityScale = 1) {
		this.gravity = gravity;
		this.gravityScale = gravityScale;
		this.width = width;
		this.height = height;

		const canvas = document.getElementById("canvas");
		if (canvas) {
			canvas.width = width;
			canvas.height = height;
		}
	}

	resize(width, height) {
		this.width = width;
		this.height = height;

		const canvas = document.getElementById("canvas");
		if (canvas) {
			canvas.width = width;
			canvas.height = height;
		}

		if (this.wallOptions) {
			for (const wall of this.wallBodies) {
				this.removeBody(wall);
			}
			this.wallBodies = [];
			this.makeWorldEdges(this.wallOptions);
		}
	}

	addBody(body) {
		this.bodyArr.push(body);
	}

	removeBody(body) {
		removeFromArray(this.bodyArr, body);

		// drop stale broadphase references so a removed body can't collide anymore
		for (var i = 0; i < this.bodyArr.length; i++) {
			removeFromArray(this.bodyArr[i].intersectBody, body);
		}
		body.intersectBody = [];
	}

	// overhang : how far the side walls extend above the screen
	// thickness : thicker walls are harder to tunnel through at high speed
	makeWorldEdges(options = {}) {
		const { top = true, bottom = true, left = true, right = true, overhang = 0, thickness = 100 } = options;
		this.wallOptions = options;

		// vertices
		var leftTop = new Vector(0, 0);
		var rightTop = new Vector(this.width, 0);
		var leftBottom = new Vector(0, this.height);
		var rightBottom = new Vector(this.width, this.height);

		this.points = [leftTop, rightTop, rightBottom, leftBottom];

		var sideTop = -overhang;

		var topPoints = [leftTop, rightTop, new Vector(rightTop.x, -thickness), new Vector(leftTop.x, -thickness)];
		var leftPoints = [new Vector(0, sideTop), leftBottom, new Vector(-thickness, leftBottom.y), new Vector(-thickness, sideTop)];
		var rightPoints = [new Vector(this.width, sideTop), rightBottom, new Vector(rightBottom.x + thickness, rightBottom.y), new Vector(rightTop.x + thickness, sideTop)];
		var bottomPoints = [leftBottom, rightBottom, new Vector(rightBottom.x, rightBottom.y + thickness), new Vector(leftBottom.x, leftBottom.y + thickness)];

		var walls = [];
		if (top)    walls.push(this.makeWall(topPoints, "top wall"));
		if (left)   walls.push(this.makeWall(leftPoints, "left wall"));
		if (right)  walls.push(this.makeWall(rightPoints, "right wall"));
		if (bottom) walls.push(this.makeWall(bottomPoints, "bottom Wall"));

		this.wallBodies = walls;

		for (const wall of walls) {
			this.addBody(wall);
		}
	}

	makeWall(points, name) {
		var wall = new Polygon(points);
		wall.queryOnly = true;
		wall.name = name;
		return wall;
	}
}

import { Vector } from './Vector.js';
import { Simplex } from './Simplex.js';
import { 
	intersectAABB, removeFromArray, distance, normal, sub, scale,
	lerpVector, length, isOnRight, rightVector, dot, invert,
	equalTolerance, upVector, rotateVector, squaredDistance, getUV
} from './Utils.js';

export class Physics {
	crosshairPosition = new Vector(400, 500);
	origin = new Vector(0, 0);
	intersectPair = [];
	simplex = new Simplex();

	// collision response tuning (letter vs letter; walls use each body's bounciness)
	collisionForceScale = 1;		// separation velocity = penetration depth * this
	collisionTorqueScale = 0.5;		// spin from a polygon hit = penetration depth * this

	// debug arrays
	minkowskiDiffArr = [];
	convexHullArr = [];
	epaArr = [];
	hitPointsArr = [];
	hitLine = [];
	dsitLineA = new Vector();
	dsitLineB = new Vector();

	constructor(collisionForceScale = 1, collisionTorqueScale = 0.5) {
		this.collisionForceScale = collisionForceScale;
		this.collisionTorqueScale = collisionTorqueScale;
	}

	tick(deltaTime) {
		// 1. All bodies move physically(location & rotation).
		this.applyPhysicsAllBodies(deltaTime);
		// 2. Rectangular collision check for all bodies.
		this.checkBoundingBox(10);
		// 3. Collect square Rectangular results.
		this.collectCollisions();
		// 4. Collision solve algorithm.
		for (var i = 0; i < this.intersectPair.length; i++) {
			this.collisionSolve(this.intersectPair[i][0], this.intersectPair[i][1]);
		}

		// clear
		this.intersectPair = [];
	}

	debugGJK(bodyA, bodyB) {
		var dir = [];
		var startDir = upVector();
		for (var i = 0; i < 35; i++) {
			dir.push(rotateVector(startDir, i * 10));
		}

		for (var i = 0; i < dir.length; i++) {
			var supportPoint = this.support2(bodyA.points, bodyB.points, dir[i]);
			var pointHull = new Vector(supportPoint.x + this.crosshairPosition.x, supportPoint.y + this.crosshairPosition.y);

			if (false === this.convexHullArr.includes(pointHull)) {
				this.convexHullArr.push(pointHull);
			}
		}
	}

	applyPhysicsAllBodies(deltaTime) {
		const world = typeof window !== 'undefined' ? window.world : null;
		if (!world) return;

		for (var i = 0; i < world.bodyArr.length; i++) {
			let body = world.bodyArr[i];
			body.setBoundingBox();

			if (body.collisionDelay > 0)
				body.collisionDelay -= deltaTime;

			if (body.queryOnly)
				continue;
			
			body.applyGravity(deltaTime);
			body.applyVelocityResist(deltaTime);
			body.applyRotationResist(deltaTime);

			body.updatePosition();
			body.updateRotation();
		}
	}

	// Backward compatibility alias
	applayPhysicsAllBodies(deltaTime) {
		this.applyPhysicsAllBodies(deltaTime);
	}

	// Optimized Broadphase O(N(N-1)/2)
	checkBoundingBox(padding = 0) {
		const world = typeof window !== 'undefined' ? window.world : null;
		if (!world) return;

		// Expand bounding box with padding
		for (var i = 0; i < world.bodyArr.length; i++) {
			world.bodyArr[i].boundingBox.minX -= padding;
			world.bodyArr[i].boundingBox.minY -= padding;
			world.bodyArr[i].boundingBox.maxX += padding;
			world.bodyArr[i].boundingBox.maxY += padding;
		}
		
		for (let i = 0; i < world.bodyArr.length; i++) {
			const bodyA = world.bodyArr[i];
			for (let j = i + 1; j < world.bodyArr.length; j++) {
				const bodyB = world.bodyArr[j];

				// ignore if both are static walls
				if (bodyA.queryOnly && bodyB.queryOnly) {
					continue;
				}

				// bodies in collisionDelay only collide with static ones
				if (!bodyA.queryOnly && !bodyB.queryOnly && (bodyA.collisionDelay > 0 || bodyB.collisionDelay > 0)) {
					continue;
				}

				// check each body's intersect
				const isIntersect = intersectAABB(bodyA.boundingBox, bodyB.boundingBox);

				if (isIntersect) {
					if (!bodyB.intersectBody.includes(bodyA)) {
						bodyB.onBoundingBoxEnter(bodyA);
					}
					if (!bodyA.intersectBody.includes(bodyB)) {
						bodyA.onBoundingBoxEnter(bodyB);
					}
				} else {
					if (bodyA.intersectBody.includes(bodyB)) {
						bodyA.onBoundingBoxExit(bodyB);
					}
					if (bodyB.intersectBody.includes(bodyA)) {
						bodyB.onBoundingBoxExit(bodyA);
					}
				}
			}
		}
	}

	collectCollisions() {
		const world = typeof window !== 'undefined' ? window.world : null;
		if (!world) return;

		for (var i = 0; i < world.bodyArr.length; i++) {
			let bodyA = world.bodyArr[i];

			// pop instead of indexing: entries are removed while collecting
			while (bodyA.intersectBody.length > 0) {
				let bodyB = bodyA.intersectBody.pop();
				removeFromArray(bodyB.intersectBody, bodyA);

				// ignore world wall
				if (bodyA.queryOnly && bodyB.queryOnly)
					continue;

				this.intersectPair.push([bodyA, bodyB]);
			}
		}
	}


	collisionSolve(bodyA, bodyB){

		if (bodyA.isCircle && bodyB.isCircle) {
			// Circle to Circle
			this.collisionSolveCircle(bodyA, bodyB);
		}else if (!bodyA.isCircle && !bodyB.isCircle) {
			// Polygon to Polygon
			this.collisionSolvePolygon(bodyA, bodyB);
		}else{
			// Circle to Polygon
			this.collisionSolvePolygonCircle(bodyA, bodyB);
		}
	}

	collisionSolveCircle(bodyA, bodyB){

		let dist = distance(bodyA.position, bodyB.position);
		let sumRadius = bodyA.radius + bodyB.radius;

		let impactSize = sumRadius - dist;

		if (impactSize < 0)
			return;


		let force = normal(sub(bodyA.position, bodyB.position));
		force = scale(force, impactSize);

		this.separate(bodyA, bodyB, force);

	}


	collisionSolvePolygonCircle(bodyA, bodyB){
		let circle = bodyA.isCircle ? bodyA : bodyB;
		let polygon = bodyA.isCircle ? bodyB : bodyA;

		let hitOnEdge = this.simplex.getHitPoint(polygon, circle);

        let dist = distance(hitOnEdge, circle.position);

		// circle center went inside the polygon : push out through the nearest edge
		let isCenterInside = polygon.isInside(circle.position);

		let impactSize = isCenterInside ? circle.radius + dist : circle.radius - dist;

		if (impactSize < 0)
			return;

		// pushes the circle away from the polygon
		let force = normal(sub(circle.position, hitOnEdge));
		if (isCenterInside) {
			force = invert(force);
		}
		force = scale(force, impactSize);

		this.separate(circle, polygon, force);
	}


	collisionSolvePolygon(bodyA, bodyB){
		// GJK
		let gjkResult = this.gjk(bodyA, bodyB);	
	

	    // collisoin hit!!!
		if (gjkResult.point == this.origin) {
			
			// EPA
			let epaResult = this.epa(bodyA, bodyB, gjkResult.vertices);

			if (!epaResult || epaResult.edge.length < 3)
				return;


			let force =	epaResult.closestNormal;

			this.separate(bodyA, bodyB, scale(force, -1));


			let contributeResult = this.getContributePoints(bodyA, bodyB, [epaResult.edge[0], epaResult.edge[1]]);

			let contributeA = contributeResult.A; // array
			let contributeB = contributeResult.B; // array

			// hit points can't be restored from the EPA edge, so skip torque
			if (contributeA.length < 2 || contributeB.length < 2)
				return;

			let hitPointA = lerpVector(contributeA[0], contributeA[1], epaResult.edge[2]);
			let hitPointB = lerpVector(contributeB[0], contributeB[1], epaResult.edge[2]);

			let torque = length(force) * this.collisionTorqueScale;


			if (false == bodyA.queryOnly) {
				let torqueA = torque;

				let dirHitAtoCenterA = sub(bodyA.position, hitPointA);
				let dirHitAtoHitB = sub(hitPointB, hitPointA);			// penetarte


				if (isOnRight(dirHitAtoHitB, dirHitAtoCenterA)) {
					torqueA *= -1;
				}

				bodyA.addTorque(torqueA);

			}


			if (false == bodyB.queryOnly) {
				let torqueB = torque;

				let dirHitBtoCenterB = sub(bodyB.position, hitPointB);
				let dirHitBtoHitA = sub(hitPointA, hitPointB);			// penetarte

				if (false == isOnRight(dirHitBtoCenterB, dirHitBtoHitA)) {
					torqueB *= -1;
				}

				bodyB.addTorque(torqueB);
			}
		}
	}



	// pushA : separation vector for bodyA, bodyB gets the opposite one
	separate(bodyA, bodyB, pushA){
		if (bodyB.queryOnly && false == bodyA.queryOnly) {
			this.resolveStatic(bodyA, pushA);
		} else if (bodyA.queryOnly && false == bodyB.queryOnly) {
			this.resolveStatic(bodyB, scale(pushA, -1));
		} else {
			if (false == bodyA.queryOnly) {
				bodyA.addForce(scale(pushA, this.collisionForceScale));
			}

			if (false == bodyB.queryOnly) {
				bodyB.addForce(scale(pushA, -this.collisionForceScale));
			}
		}
	}

	// Against a static (queryOnly) body : move out of it and bounce only the velocity going into it,
	// so the body keeps sliding along it instead of having its whole velocity replaced.
	resolveStatic(body, push){
		body.addPosition(push);

		let n = normal(push);
		let into = dot(body.velocity, n);

		if (into < 0) {
			body.addForce(sub(body.velocity, scale(n, into * (1 + body.bounciness))));
		}
	}


	gjk(bodyA, bodyB){
	    let result = { point : new Vector(), vertices : []}; // return a closest point, simplex polytope


		this.simplex.clear();
   		let dir = rightVector(); // Random initial direction
	    let supportPoint = this.support2(bodyA.points, bodyB.points, dir);
	    this.simplex.addVertex(supportPoint);

		let closest;

	    for (let i = 0; i < 9; i++)
	    {
	        closest = this.simplex.getClosest(this.origin); // query : origin
	        
	        let point = closest.point;
	        let vertices = this.simplex.vertices;

        	result = { point, vertices };

	        if (closest.point == this.origin) {
	        	break;
	        }
	        
	        if (1 < this.simplex.count)
	        {
	            // Rebuild the simplex with vertices that are used(involved) to calculate closest distance
	            this.simplex.shrink(closest.contributors);
	        }

	        dir = sub(this.origin, closest.point);
	        supportPoint = this.support2(bodyA.points, bodyB.points, dir);


	        // If the new support point is not further along the search direction than the closest point,
	        // two objects are not colliding so you can early return here.

	        if (0 > dot(dir, sub(supportPoint, closest.point))) {
	            break;
	        }

	        // early return here
	        if (this.simplex.containsVertex(supportPoint)) {
	            break;
	        }
	       

	        this.simplex.addVertex(supportPoint);
	    }

	    return result;
	}


	epa(bodyA, bodyB, polytope){
		let minkowskiDiff = this.minkowskiDifference(bodyA, bodyB);

		let edgeResult;
		for (var i = 0; i < minkowskiDiff.length; i++) {
			
			edgeResult = this.getClosestEdgeNormal(polytope);

			let supportPoint = this.support(minkowskiDiff, edgeResult.closestNormal);

			if (polytope.includes(supportPoint)) {
				break;
			}

			// expends the polytope
			polytope.splice(edgeResult.insertIndex, 0, supportPoint);
		}

	   	return edgeResult;
	}


	getClosestEdgeNormal(vertices){
		let minDistance = Infinity;
		let result = {closestNormal : new Vector(), edge : [], insertIndex : -1};
	
		for (var i = 0; i < vertices.length; i++) {
			var j = i + 1 == vertices.length ? 0 : i + 1;

			var a = vertices[i];
			var b = vertices[j];
 
			let w = getUV(a, b, this.origin);
			let p = lerpVector(a, b, w);

			let dist = squaredDistance(p, this.origin);

			if (dist < minDistance ) {
				minDistance = dist;
				result.closestNormal = sub(p, this.origin);
				result.edge = [a, b, w];
				result.insertIndex = j;
			}
		}

		return result;
	}

	// return farthest point by dir in points array.
	support(points, dir){
		var farthestPoint = points[0];
		var farthestDot = dot(dir, farthestPoint);

		for (var i = 1; i < points.length; i++) {
			var dotValue = dot(dir, points[i]);

			if (dotValue > farthestDot) {
				farthestDot = dotValue;
				farthestPoint = points[i];
			}
		}

		return farthestPoint;
	}

	// for convex hull
	support2(pointsA, pointsB, dir){
		var pointAsupport = this.support(pointsA, dir);
		var pointBsupport = this.support(pointsB, invert(dir));

		return sub(pointAsupport, pointBsupport);
	}

	// Minkowski Difference : A ⊖ B = {Pa - Pb| Pa ∈ A, Pb ∈ B}
	// https://en.wikipedia.org/wiki/Minkowski_distance
	minkowskiDifference(bodyA, bodyB){
		var points = [];

		for (var i = 0; i < bodyA.points.length; i++) {
			for (var j = 0; j < bodyB.points.length; j++) {
				var x = bodyA.points[i].x - bodyB.points[j].x;
				var y = bodyA.points[i].y - bodyB.points[j].y;

				points.push(new Vector(x, y));
			}
		}

		return points;
	}

	// find hit points from epa result edge.
	getContributePoints(bodyA, bodyB, resultEdge){
		let resultA = [];
		let resultB = [];

		for (var k = 0; k < resultEdge.length; k++) {
			var edgePoint = resultEdge[k];

			// only the first matching pair per edge point
			findPair:
			for (var i = 0; i < bodyA.points.length; i++) {
				for (var j = 0; j < bodyB.points.length; j++) {

					var diff = sub(bodyA.points[i], bodyB.points[j]);

					if (equalTolerance(edgePoint, diff, 1.0)) {
						resultA.push(bodyA.points[i]);
						resultB.push(bodyB.points[j]);
						break findPair;
					}
				}
			}
		}

		return { A : resultA, B : resultB};
	}

}




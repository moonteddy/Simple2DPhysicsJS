
class Physics{

	crosshairPosition = new Vector(400, 500);
	origin = new Vector(0, 0);
	intersectPair = [];
    simplex = new Simplex();

	constructor(){
	}

	tick(deltaTime){
		
		// 1. All bodies move physically(location & rotation).
		this.applayPhysicsAllBodies(deltaTime);
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

	

	debugGJK(bodyA, bodyB){
		// minkoski convex hull..  for debug draw
		// 0 ~ 360
		var dir = [];

		var startDir = upVector();
		for (var i = 0; i < 35; i++) {
			dir.push(rotateVector(startDir, i * 10));
		}

		for (var i = 0; i < dir.length; i++) {
			var supportPoint = this.support2(bodyA.points, bodyB.points, dir[i]);
			var pointHull = new Vector(supportPoint.x + this.crosshairPosition.x, supportPoint.y + this.crosshairPosition.y);

			if (false == this.convexHullArr.includes(pointHull)) {
				this.convexHullArr.push(pointHull);
			}
		}
	}

	applayPhysicsAllBodies(deltaTime){
		// loop every bodies 
		for (var i = 0; i < world.bodyArr.length; i++){
			let body = world.bodyArr[i];

			body.setBoundingBox();

			if (body.queryOnly)
				continue;
			
			body.applyGrivity(deltaTime);

			body.applyVelocityResist(deltaTime);
			body.applyRotationResist(deltaTime);

			body.updatePosition();
			body.updateRotation();
		}

	}


	// check every bodies
	checkBoundingBox(padding = 0){
		// add padding
		for (var i = 0; i < world.bodyArr.length; i++) {
			world.bodyArr[i].boundingBox.minX -= padding;
			world.bodyArr[i].boundingBox.minY -= padding;
			world.bodyArr[i].boundingBox.maxX += padding;
			world.bodyArr[i].boundingBox.maxY += padding;
		}
		
		for (var i = 0; i < world.bodyArr.length; i++) {
			for (var j = 0; j < world.bodyArr.length; j++) {
				// ignore same body
				if (world.bodyArr[i] == world.bodyArr[j]) {
					continue;
				}
				// ignore world wall
				if (world.bodyArr[i].queryOnly && world.bodyArr[j].queryOnly) {
					continue;
				}

				// check each body's intersect
				var isIntersect = intersectAABB(world.bodyArr[i].boundingBox, world.bodyArr[j].boundingBox);

				if (isIntersect) {
					// notify to body
					if (false == world.bodyArr[j].intersectBody.includes(world.bodyArr[i])) {
						world.bodyArr[j].onBoundingBoxEnter(world.bodyArr[i]);
					}

					if (false == world.bodyArr[i].intersectBody.includes(world.bodyArr[j])) {
						world.bodyArr[i].onBoundingBoxEnter(world.bodyArr[j]);
					}
				}else{
					// notify to body
					if (world.bodyArr[i].intersectBody.includes(world.bodyArr[j])) {
						world.bodyArr[i].onBoundingBoxExit(world.bodyArr[j]);
					}

					if (world.bodyArr[j].intersectBody.includes(world.bodyArr[i])) {
						world.bodyArr[j].onBoundingBoxExit(world.bodyArr[i]);
					}
				}
			}
		}

	}


	collectCollisions(){
		for (var i = 0; i < world.bodyArr.length; i++) {
			let bodyA = world.bodyArr[i];
			for (var j = 0; j < bodyA.intersectBody.length; j++) {
				let bodyB = bodyA.intersectBody[j];

				// ignore world wall
				if (bodyA.queryOnly && bodyB.queryOnly)
					continue;

				this.intersectPair.push([bodyA, bodyB]);
				removeFromArray(bodyB.intersectBody, bodyA);
				removeFromArray(bodyA.intersectBody, bodyB);
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

		if (false == bodyA.queryOnly) {
			bodyA.addForce(force);
		}

		if (false == bodyB.queryOnly) {
			bodyB.addForce(scale(force, -1));
		}

	}	


	collisionSolvePolygonCircle(bodyA, bodyB){
		let hitOnEdge;
		let circleCenter;
		let radius;

		if (bodyA.isCircle) {
			hitOnEdge = this.simplex.getHitPoint(bodyB, bodyA);
			circleCenter = bodyA.position;
			radius = bodyA.radius;
		}else{
			hitOnEdge = this.simplex.getHitPoint(bodyA, bodyB);
			circleCenter = bodyB.position;
			radius = bodyB.radius;
		}


        let dist = distance(hitOnEdge, circleCenter);

		let impactSize = radius - dist;

		if (impactSize < 0)
			return;

		let force = normal(sub(hitOnEdge, circleCenter));
		force = scale(force, impactSize);

		if (false == bodyA.queryOnly) {
			bodyA.addForce(force);
		}

		if (false == bodyB.queryOnly) {
			bodyB.addForce(scale(force, -1));
		}
	}


	collisionSolvePolygon(bodyA, bodyB){
		// GJK
		let gjkResult = this.gjk(bodyA, bodyB);	
	

	    // collisoin hit!!!
		if (gjkResult.point == this.origin) {
			
			// EPA
			let epaResult = this.epa(bodyA, bodyB, gjkResult.vertices);


			let contributeResult = this.getContributePoints(bodyA, bodyB, [epaResult.edge[0], epaResult.edge[1]]);

			let contributeA = contributeResult.A; // array
			let contributeB = contributeResult.B; // array

			let hitPointA = lerpVector(contributeA[0], contributeA[1], epaResult.edge[2]);
			let hitPointB = lerpVector(contributeB[0], contributeB[1], epaResult.edge[2]);


			let force =	epaResult.closestNormal;
			let torque = length(force) * 0.5;

			
			if (false == bodyA.queryOnly) {
				bodyA.addForce( scale(force, -1) );

				let dirHitAtoCenterA = sub(bodyA.position, hitPointA);
				let dirHitAtoHitB = sub(hitPointB, hitPointA);			// penetarte


				if (isOnRight(dirHitAtoHitB, dirHitAtoCenterA)) {
					torque *= -1;
				}

				bodyA.addTorque(torque);

			}


			if (false == bodyB.queryOnly) {
				bodyB.addForce(force);

				let dirHitBtoCenterB = sub(bodyB.position, hitPointB);
				let dirHitBtoHitA = sub(hitPointA, hitPointB);			// penetarte
				
				if (false == isOnRight(dirHitBtoCenterB, dirHitBtoHitA)) {
					torque *= -1;
				}

				bodyB.addTorque(torque);
			}		
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

			for (var i = 0; i < bodyA.points.length; i++) {
				for (var j = 0; j < bodyB.points.length; j++) {
					
					var diff = sub(bodyA.points[i], bodyB.points[j]);

					if (equalTolerance(edgePoint, diff, 1.0)) {
						resultA.push(bodyA.points[i]);
						resultB.push(bodyB.points[j]);
						break;
					}
				}
			}
		}

		return { A : resultA, B : resultB};
	}

}



